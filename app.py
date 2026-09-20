import json
import os
from collections import OrderedDict

from dotenv import load_dotenv
from flask import Flask, Response, jsonify, request, stream_with_context
from flask_cors import CORS
from werkzeug.utils import secure_filename

load_dotenv()

from agents import career_ai, gemini_client  # noqa: E402  (needs env loaded first)
from agents.cv_parser import process_cv  # noqa: E402
from agents.gemini_client import GeminiError  # noqa: E402
from agents.job_parser import extract_job_skills  # noqa: E402
from agents.matcher_agent import match_skills, recommend_jobs  # noqa: E402
from utils import auth, db  # noqa: E402

app = Flask(__name__)
CORS(app, expose_headers=["Content-Type"])

UPLOAD_FOLDER = "uploads"
ALLOWED_CV_EXTENSIONS = {"pdf", "docx"}
MAX_SESSIONS = 200

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10 MB CV uploads
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
db.init_db()

# Per-browser working state (uploaded CV, target job, latest analysis), keyed by the
# X-Session-Id header so two people using the backend never see each other's CV.
SESSIONS = OrderedDict()


def state():
    sid = request.headers.get("X-Session-Id", "anonymous")[:64]
    if sid not in SESSIONS:
        SESSIONS[sid] = {"cv_text": "", "cv_filename": "", "skills": [], "cv_score": {}, "job_text": "", "analysis": None}
        while len(SESSIONS) > MAX_SESSIONS:
            SESSIONS.popitem(last=False)
    SESSIONS.move_to_end(sid)
    return SESSIONS[sid]


def allowed_cv_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_CV_EXTENSIONS


@app.route("/")
def home():
    return "Backend is running!"


@app.route("/api/ai/status")
def ai_status():
    return jsonify({
        "configured": gemini_client.is_configured(),
        "model": os.environ.get("GEMINI_MODEL", gemini_client.DEFAULT_MODEL),
    })


# --------------------------------------------------------------------------- CV + job

@app.route("/upload_cv", methods=["POST"])
def upload_cv():
    if "cv" not in request.files:
        return jsonify({"error": "No CV uploaded"}), 400

    file = request.files["cv"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_cv_file(file.filename):
        return jsonify({"error": "Only PDF or DOCX CV files are allowed"}), 400

    safe_filename = secure_filename(file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], safe_filename)

    try:
        file.save(filepath)
        result = process_cv(filepath)
        skills = result.get("skills", [])
        cv_score = result.get("cv_score", {})
        cv_text = result.get("full_text", "")
    except Exception:
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({"error": "That file could not be read as a valid CV. Please upload a real PDF or DOCX resume."}), 400

    if not skills:
        return jsonify({"error": "No CV skills were detected. Please upload a clearer resume PDF or DOCX."}), 400

    s = state()
    s.update({"cv_text": cv_text, "cv_filename": safe_filename, "skills": skills, "cv_score": cv_score,
              "job_text": "", "analysis": None})

    return jsonify({
        "message": "CV uploaded successfully",
        "filename": safe_filename,
        "skills": skills,
        "cv_score": cv_score,
    })


@app.route("/cv_score", methods=["GET"])
def cv_score():
    s = state()
    if not s["skills"]:
        return jsonify({"error": "Upload CV first"}), 400
    score = s["cv_score"]
    return jsonify({
        "score": score.get("score", 0),
        "tips": score.get("tips", []),
        "word_count": score.get("word_count", 0),
        "skill_count": score.get("skill_count", 0),
        "sections_found": score.get("sections_found", []),
        "has_quantified_achievements": score.get("has_quantified_achievements", False),
    })


@app.route("/compare_jobs", methods=["POST"])
def compare_jobs():
    s = state()
    if not s["skills"]:
        return jsonify({"error": "Upload CV first"}), 400

    data = request.get_json(silent=True)
    if not data or "jobs" not in data:
        return jsonify({"error": "No jobs provided"}), 400

    results = []
    for job in data["jobs"]:
        parsed = extract_job_skills(job.get("description", ""))
        match = match_skills(s["skills"], parsed["skills"])
        results.append({
            "label": job.get("label") or f"Job {len(results) + 1}",
            "match_percentage": match["match_percentage"],
            "matched_skills": match["matched_skills"],
            "missing_skills": match["missing_skills"],
        })

    return jsonify({"comparisons": results})


@app.route("/analyze_job", methods=["POST"])
def analyze_job():
    s = state()

    job_input = (request.form.get("job_description") or "").strip()
    if not job_input:
        return jsonify({"error": "No job description provided"}), 400
    if not s["skills"]:
        return jsonify({"error": "Upload CV first"}), 400

    parsed = extract_job_skills(job_input)
    job_text = parsed["text"] or ""
    if len(job_text.strip()) < 40:
        msg = ("We couldn't read that job page (many sites block automated access). Paste the job description text instead."
               if job_input.startswith("http") else "That job description is too short to analyse. Paste the full posting.")
        return jsonify({"error": msg}), 400

    match_result = match_skills(s["skills"], parsed["skills"])

    analysis, ai_error = None, None
    if gemini_client.is_configured():
        try:
            analysis = career_ai.analyze_match(s["cv_text"], job_text, s["skills"], parsed["skills"], s["cv_score"])
        except GeminiError as exc:
            ai_error = str(exc)
    else:
        ai_error = "GEMINI_API_KEY is not configured on the backend."

    if analysis is None:
        analysis = career_ai.fallback_analysis(match_result, s["cv_score"])

    s["job_text"] = job_text
    s["analysis"] = analysis

    scan_id = None
    user = auth.optional_user()
    if user and analysis["ai"]:
        scan_id = db.save_scan(
            user["id"], cv_filename=s["cv_filename"], cv_text=s["cv_text"], job_text=job_text,
            skills=s["skills"], cv_score=s["cv_score"], analysis=analysis,
        )

    return jsonify({
        "job_skills": parsed["skills"],
        "scraped_preview": parsed.get("scraped_text"),
        "match_result": match_result,
        "analysis": analysis,
        "ai_error": ai_error,
        "scan_id": scan_id,
    })


@app.route("/recommend_jobs", methods=["GET"])
def get_job_recommendations():
    s = state()
    if not s["skills"]:
        return jsonify({"error": "Upload CV first"}), 400
    return jsonify({"recommendations": recommend_jobs(s["skills"])})


# --------------------------------------------------------------------------- Co-Pilot chat

def _sse(payload):
    return f"data: {json.dumps(payload)}\n\n"


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify({"error": "Empty message"}), 400
    if len(message) > 4000:
        return jsonify({"error": "Message is too long (4000 characters max)."}), 400
    if not gemini_client.is_configured():
        return jsonify({"error": "The AI co-pilot is not configured (missing GEMINI_API_KEY)."}), 503

    s = state()
    tone = data.get("tone") if data.get("tone") in career_ai.TONES else "professional"
    history = data.get("history") if isinstance(data.get("history"), list) else []

    def generate():
        try:
            for event in career_ai.stream_chat(history, message, s["cv_text"], s["job_text"], s["analysis"], tone):
                yield _sse(event)
        except GeminiError as exc:
            yield _sse({"error": str(exc)})
        yield _sse({"done": True})

    return Response(
        stream_with_context(generate()),
        mimetype="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# --------------------------------------------------------------------------- auth

def _auth_response(row):
    return jsonify({"token": auth.issue_token(row["id"]), "user": auth.public_user(row)})


@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    row, error = auth.register(data.get("email"), data.get("name"), data.get("password"))
    if error:
        return jsonify({"error": error}), 400
    return _auth_response(row), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    row, error = auth.login(data.get("email"), data.get("password"))
    if error:
        return jsonify({"error": error}), 401
    return _auth_response(row)


@app.route("/api/auth/demo", methods=["POST"])
def demo_login():
    data = request.get_json(silent=True) or {}
    row = auth.demo_login(data.get("candidate"))
    if not row:
        return jsonify({"error": "Unknown demo candidate."}), 404
    return _auth_response(row)


@app.route("/api/auth/demo_candidates")
def demo_candidates():
    return jsonify({"candidates": [{"key": k, "name": v["name"], "role": v["role"]} for k, v in auth.DEMO_CANDIDATES.items()]})


@app.route("/api/auth/me")
@auth.login_required
def me():
    return jsonify({"user": auth.public_user(auth.optional_user())})


# --------------------------------------------------------------------------- scan history

@app.route("/api/history")
@auth.login_required
def history():
    return jsonify({"scans": db.list_scans(auth.optional_user()["id"])})


@app.route("/api/history/<int:scan_id>")
@auth.login_required
def history_item(scan_id):
    scan = db.get_scan(auth.optional_user()["id"], scan_id)
    if not scan:
        return jsonify({"error": "Scan not found"}), 404
    # Restore the working state so the Co-Pilot has this scan's CV + job as context.
    state().update({"cv_text": scan["cv_text"], "cv_filename": scan["cv_filename"], "skills": scan["skills"],
                    "cv_score": scan["cv_score"], "job_text": scan["job_text"], "analysis": scan["analysis"]})
    return jsonify({
        "scan": {k: scan[k] for k in ("id", "created_at", "job_title", "company", "cv_filename")},
        "skills": scan["skills"],
        "cv_score": scan["cv_score"],
        "analysis": scan["analysis"],
    })


@app.route("/api/history/<int:scan_id>", methods=["DELETE"])
@auth.login_required
def history_delete(scan_id):
    if not db.delete_scan(auth.optional_user()["id"], scan_id):
        return jsonify({"error": "Scan not found"}), 404
    return jsonify({"ok": True})


if __name__ == "__main__":
    app.run(debug=True)
