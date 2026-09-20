"""Gemini-powered CV ↔ job analysis and the Career Match Co-Pilot chat.

The model produces the qualitative analysis; this module keeps it honest:
scores are clamped, the overall score is recomputed from the four dimensions
with fixed weights, and every "evidence" excerpt is checked against the actual
CV text (unverifiable quotes are dropped rather than shown as fact).
"""
import re
from urllib.parse import quote_plus

from agents import gemini_client

MAX_CV_CHARS = 14000
MAX_JOB_CHARS = 8000

# Overall score = weighted mean of the four dimensions (shown in the UI legend).
DIMENSION_WEIGHTS = {
    "technical_skills": 0.35,
    "experience_depth": 0.25,
    "education": 0.15,
    "role_alignment": 0.25,
}

_S = {"type": "STRING"}
_I = {"type": "INTEGER"}


def _obj(props, required=None):
    return {"type": "OBJECT", "properties": props, "required": required or list(props)}


def _arr(item):
    return {"type": "ARRAY", "items": item}


_DIMENSION = _obj({"score": _I, "rationale": _S})

ANALYSIS_SCHEMA = _obj({
    "job_title": _S,
    "company": _S,
    "ats_pass_probability": _I,
    "verdict": _S,
    "dimensions": _obj({k: _DIMENSION for k in DIMENSION_WEIGHTS}),
    "matched_skills": _arr(_obj({"skill": _S, "evidence": _S})),
    "skill_gaps": _arr(_obj({
        "skill": _S,
        "urgency": {"type": "STRING", "enum": ["high", "medium", "low"]},
        "time_to_acquire": _S,
        "why_it_matters": _S,
    })),
    "weak_points": _arr(_obj({
        "title": _S,
        "severity": {"type": "STRING", "enum": ["critical", "major", "minor"]},
        "diagnosis": _S,
    })),
    "bullet_rewrites": _arr(_obj({"original": _S, "improved": _S, "reason": _S})),
    "ats_checks": _arr(_obj({
        "check": _S,
        "status": {"type": "STRING", "enum": ["pass", "flag", "fail"]},
        "detail": _S,
    })),
    "courses": _arr(_obj({
        "title": _S,
        "provider": {"type": "STRING", "enum": ["Coursera", "Udemy", "Official Docs", "edX", "LinkedIn Learning", "freeCodeCamp"]},
        "skill": _S,
        "duration": _S,
        "level": {"type": "STRING", "enum": ["Beginner", "Intermediate", "Advanced"]},
        "match_boost": _I,
    })),
    "roadmap": _arr(_obj({"title": _S, "description": _S, "timeframe": _S})),
})

ANALYSIS_SYSTEM = """You are a senior technical recruiter and ATS specialist. You audit a candidate's CV against one target job and return a strict JSON report.

Rules — accuracy matters more than flattery:
1. Ground every claim in the CV text and the job text provided. Never invent employers, degrees, tools, numbers or dates.
2. matched_skills: only skills the job actually asks for AND the CV demonstrably shows. "evidence" MUST be a short VERBATIM excerpt copied from the CV (max ~160 chars). Do not paraphrase.
3. skill_gaps: skills the job requires (or strongly prefers) that the CV does not show. Rank most important first. urgency=high if it is a stated must-have.
   time_to_acquire is a realistic estimate for a working candidate (e.g. "2-3 weeks", "3 months").
4. Dimension scores are integers 0-100, calibrated: 90+ exceeds requirements, 70-89 solid match, 50-69 partial, below 50 clear gap.
   - technical_skills: coverage of required tools/skills, weighted by importance.
   - experience_depth: years, seniority, scope and impact versus what the job expects.
   - education: degrees/certifications versus requirements (score 70-80 if none are required and the CV is reasonable).
   - role_alignment: how closely past titles/responsibilities resemble this role and domain.
5. ats_pass_probability: integer 0-100 estimating the chance an automated keyword/format screen passes this CV for this job. Base it on keyword coverage, standard section headers, and quantified impact.
6. weak_points: 3-6 specific problems in THIS CV for THIS job (vague bullets, missing metrics, buried keywords, weak summary, gaps). severity: critical = likely causes rejection, major = hurts materially, minor = polish. diagnosis explains why and how to fix it in 1-3 sentences.
7. bullet_rewrites: 3-5 rewrites of REAL bullets from the CV (original = verbatim). Rewrite with Google's XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]". Use only facts present in the original; where a metric is unknown, use a clear placeholder like [N%] rather than fabricating a number.
8. ats_checks: exactly these six, in order: "Keyword density", "Section headers", "Quantifiable impact", "Contact & formatting", "Job-title alignment", "Action verbs". status: pass / flag (fixable issue) / fail (blocking). detail: 1 sentence of evidence.
9. courses: 3-5 real, well-known courses/documentation that close the top skill gaps (real titles only — if unsure of an exact title, use the provider's well-known official learning path for the skill). match_boost = realistic integer percentage-point gain to overall match (1-12).
10. roadmap: exactly 3 prioritized steps, highest impact first, each with a concrete description and timeframe.
11. verdict: 2 sentences, professional and direct. Address the candidate as "you" everywhere (verdict, rationales, diagnoses, roadmap) — the candidate is the one reading this report.
12. job_title and company come from the job text; use "" if not stated.
Write in a professional tone regardless of any other instruction. Output JSON only."""


def _clamp(value, low=0, high=100):
    try:
        return max(low, min(high, int(round(float(value)))))
    except (TypeError, ValueError):
        return low


def _norm(text):
    return re.sub(r"\s+", " ", re.sub(r"[^\w\s%$+#.]", " ", (text or "").lower())).strip()


def _evidence_is_real(evidence, skill, cv_norm):
    ev = _norm(evidence)
    if len(ev) >= 8 and ev in cv_norm:
        return True
    # Model may have trimmed or lightly reworded: accept if most of its words appear consecutively-ish.
    words = ev.split()
    if len(words) >= 5:
        window = " ".join(words[: min(6, len(words))])
        if window in cv_norm:
            return True
    return False


def _course_url(course):
    q = quote_plus(f"{course['title']}")
    provider = course["provider"]
    if provider == "Coursera":
        return f"https://www.coursera.org/search?query={q}"
    if provider == "Udemy":
        return f"https://www.udemy.com/courses/search/?q={q}"
    if provider == "edX":
        return f"https://www.edx.org/search?q={q}"
    if provider == "LinkedIn Learning":
        return f"https://www.linkedin.com/learning/search?keywords={q}"
    if provider == "freeCodeCamp":
        return f"https://www.freecodecamp.org/news/search/?query={q}"
    return f"https://www.google.com/search?q={quote_plus(course['title'] + ' official documentation')}"


def _finalize(raw, cv_text):
    cv_norm = _norm(cv_text)

    dims = {}
    for key in DIMENSION_WEIGHTS:
        d = (raw.get("dimensions") or {}).get(key) or {}
        dims[key] = {"score": _clamp(d.get("score")), "rationale": (d.get("rationale") or "").strip()}
    overall = _clamp(sum(dims[k]["score"] * w for k, w in DIMENSION_WEIGHTS.items()))

    matched = []
    for m in raw.get("matched_skills") or []:
        skill = (m.get("skill") or "").strip()
        if not skill:
            continue
        evidence = (m.get("evidence") or "").strip()
        verified = _evidence_is_real(evidence, skill, cv_norm)
        matched.append({"skill": skill, "evidence": evidence if verified else "", "verified": verified})

    rewrites = []
    for r in raw.get("bullet_rewrites") or []:
        if (r.get("improved") or "").strip():
            rewrites.append({
                "original": (r.get("original") or "").strip(),
                "improved": r["improved"].strip(),
                "reason": (r.get("reason") or "").strip(),
                "original_verified": _norm(r.get("original")) in cv_norm if r.get("original") else False,
            })

    courses = []
    for c in raw.get("courses") or []:
        if not c.get("title"):
            continue
        courses.append({
            "title": c["title"].strip(),
            "provider": c.get("provider", "Official Docs"),
            "skill": (c.get("skill") or "").strip(),
            "duration": (c.get("duration") or "").strip(),
            "level": c.get("level", "Beginner"),
            "match_boost": _clamp(c.get("match_boost"), 0, 20),
            "url": _course_url(c),
        })

    gaps = sorted(
        (g for g in (raw.get("skill_gaps") or []) if g.get("skill")),
        key=lambda g: {"high": 0, "medium": 1, "low": 2}.get(g.get("urgency"), 3),
    )
    weak = sorted(
        (w for w in (raw.get("weak_points") or []) if w.get("title")),
        key=lambda w: {"critical": 0, "major": 1, "minor": 2}.get(w.get("severity"), 3),
    )

    return {
        "ai": True,
        "job_title": (raw.get("job_title") or "").strip(),
        "company": (raw.get("company") or "").strip(),
        "overall_score": overall,
        "ats_pass_probability": _clamp(raw.get("ats_pass_probability")),
        "verdict": (raw.get("verdict") or "").strip(),
        "dimensions": dims,
        "dimension_weights": DIMENSION_WEIGHTS,
        "matched_skills": matched,
        "skill_gaps": gaps,
        "weak_points": weak,
        "bullet_rewrites": rewrites,
        "ats_checks": raw.get("ats_checks") or [],
        "courses": courses,
        "roadmap": (raw.get("roadmap") or [])[:3],
    }


def analyze_match(cv_text, job_text, cv_skills, job_skills, cv_score):
    """Full Gemini audit of a CV against a job. Raises GeminiError on failure."""
    prompt = (
        "=== CANDIDATE CV ===\n" + cv_text[:MAX_CV_CHARS] +
        "\n\n=== TARGET JOB ===\n" + job_text[:MAX_JOB_CHARS] +
        "\n\n=== PRE-COMPUTED SIGNALS (rule-based; verify against the text above) ===\n"
        f"CV skills detected: {', '.join(cv_skills) or 'none'}\n"
        f"Job skills detected: {', '.join(job_skills) or 'none'}\n"
        f"CV word count: {cv_score.get('word_count', 0)}; sections found: {', '.join(cv_score.get('sections_found', [])) or 'none'}; "
        f"quantified achievements present: {cv_score.get('has_quantified_achievements', False)}\n"
    )
    raw, model = gemini_client.generate_json(prompt, ANALYSIS_SCHEMA, system=ANALYSIS_SYSTEM, temperature=0.2, thinking="medium")
    analysis = _finalize(raw, cv_text)
    analysis["model"] = model
    return analysis


def fallback_analysis(match_result, cv_score):
    """Rule-based result used when Gemini is unavailable, in the same shape as the AI one."""
    pct = _clamp(match_result.get("match_percentage", 0))
    return {
        "ai": False,
        "job_title": "",
        "company": "",
        "overall_score": pct,
        "ats_pass_probability": min(pct, 95),
        "verdict": "AI analysis is temporarily unavailable, so this is a keyword-based result. Retry for the full audit.",
        "dimensions": {
            "technical_skills": {"score": pct, "rationale": "Keyword overlap between your CV and the job."},
            "experience_depth": {"score": 0, "rationale": "Requires AI analysis."},
            "education": {"score": 0, "rationale": "Requires AI analysis."},
            "role_alignment": {"score": 0, "rationale": "Requires AI analysis."},
        },
        "dimension_weights": DIMENSION_WEIGHTS,
        "matched_skills": [{"skill": s, "evidence": "", "verified": False} for s in match_result.get("matched_skills", [])],
        "skill_gaps": [{"skill": s, "urgency": "medium", "time_to_acquire": "", "why_it_matters": ""} for s in match_result.get("missing_skills", [])],
        "weak_points": [{"title": t, "severity": "minor", "diagnosis": ""} for t in cv_score.get("tips", [])],
        "bullet_rewrites": [],
        "ats_checks": [],
        "courses": [],
        "roadmap": [],
    }


TONES = {
    "professional": "Tone: professional, clear and encouraging. No slang, no emoji.",
    "genz": (
        "Tone: playful Gen Z career bestie — casual lowercase-friendly voice, light slang (\"lowkey\", \"no cap\", \"let's cook\"), "
        "and a few emoji. Stay genuinely helpful and accurate; never let the slang blur the advice or the facts."
    ),
}

CHAT_SYSTEM = """You are the CVision Career Match Co-Pilot. You help ONE candidate get hired for ONE target role, using their real CV and the job specification below.

Rules:
- Ground every answer in the CV and job text. Never invent experience, employers, metrics or skills the CV does not contain. If information is missing, say so and ask.
- For resume bullets, use Google's XYZ formula ("Accomplished [X] as measured by [Y], by doing [Z]") and mark unknown metrics with placeholders like [N%].
- For interview prep, tailor questions to gaps and claims in this CV and to this job; include what a strong answer covers.
- For cover letters, write a tailored draft under ~250 words using only facts from the CV; leave [brackets] for unknowns.
- Only discuss careers, CVs, job search and interviews. For anything else, politely steer back in one sentence.
- Keep answers focused; use Markdown (short lists, **bold** for key terms). Be concise unless asked for depth.
{tone}

=== CANDIDATE CV ===
{cv}

=== TARGET JOB ===
{job}

=== LATEST MATCH AUDIT (summary) ===
{audit}
"""


def _audit_summary(analysis):
    if not analysis:
        return "No audit has been run yet."
    gaps = ", ".join(g["skill"] for g in analysis.get("skill_gaps", [])[:8]) or "none"
    matched = ", ".join(m["skill"] for m in analysis.get("matched_skills", [])[:10]) or "none"
    weak = "; ".join(w["title"] for w in analysis.get("weak_points", [])[:5]) or "none"
    dims = ", ".join(f"{k.replace('_', ' ')} {v['score']}" for k, v in (analysis.get("dimensions") or {}).items())
    return (
        f"Target: {analysis.get('job_title') or 'unspecified role'} {('at ' + analysis['company']) if analysis.get('company') else ''}\n"
        f"Overall match {analysis.get('overall_score')}%, ATS pass probability {analysis.get('ats_pass_probability')}%\n"
        f"Dimensions: {dims}\nMatched skills: {matched}\nSkill gaps: {gaps}\nWeak points: {weak}"
    )


def build_chat_system(cv_text, job_text, analysis, tone):
    return CHAT_SYSTEM.format(
        tone=TONES.get(tone, TONES["professional"]),
        cv=(cv_text or "(no CV uploaded yet)")[:MAX_CV_CHARS],
        job=(job_text or "(no target job provided yet)")[:MAX_JOB_CHARS],
        audit=_audit_summary(analysis),
    )


def stream_chat(history, message, cv_text, job_text, analysis, tone):
    messages = [
        {"role": "model" if m.get("role") in ("assistant", "model") else "user", "text": m["content"]}
        for m in (history or [])[-12:]
        if isinstance(m.get("content"), str) and m["content"].strip()
    ]
    messages.append({"role": "user", "text": message})
    system = build_chat_system(cv_text, job_text, analysis, tone)
    return gemini_client.stream_text(messages, system=system, temperature=0.5)
