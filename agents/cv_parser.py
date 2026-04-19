import pdfplumber
from docx import Document
import os
import re
from utils.skills import extract_skills

SECTION_KEYWORDS = [
    "experience", "education", "skills", "summary", "objective", "profile",
    "projects", "certifications", "achievements", "awards", "languages",
    "volunteering", "publications", "references", "interests", "hobbies",
]

CV_TIPS = [
    (lambda t, s, w: w < 200,  "Your CV looks very short — aim for at least 400 words to give recruiters enough to work with."),
    (lambda t, s, w: w < 400,  "Your CV is a bit brief. Consider expanding your experience descriptions with more detail."),
    (lambda t, s, w: len(s) < 5, "Only a few skills detected — make sure your skills section is clearly listed and not buried in paragraphs."),
    (lambda t, s, w: not re.search(r'summary|profile|objective|about me', t, re.I), "No summary/profile section detected — a 2–3 line personal statement at the top can significantly boost your CV."),
    (lambda t, s, w: not re.search(r'experience|work history|employment', t, re.I), "No work experience section detected — make sure it's clearly labelled."),
    (lambda t, s, w: not re.search(r'education|degree|university|college|school', t, re.I), "No education section detected — even if you're experienced, include your qualifications."),
    (lambda t, s, w: not re.search(r'\d+%|\d+ percent|increased|decreased|reduced|improved|grew|saved|delivered|managed \d+|\$[\d,]+|£[\d,]+', t, re.I), "No quantified achievements found — add numbers (e.g. 'increased sales by 30%', 'managed a team of 8') to stand out."),
    (lambda t, s, w: not re.search(r'certif|qualification|diploma|award|licence|license', t, re.I), "No certifications or qualifications detected — if you have any, make sure they're listed."),
    (lambda t, s, w: len(re.findall(r'\b(responsible for|duties included|helped with|assisted in)\b', t, re.I)) > 2, "Too many passive phrases like 'responsible for' — replace with strong action verbs like 'led', 'built', 'delivered', 'managed'."),
]


def score_cv(text, skills):
    words = text.split()
    word_count = len(words)
    skill_count = len(skills)
    sections_found = [kw for kw in SECTION_KEYWORDS if re.search(rf'\b{kw}\b', text, re.I)]
    has_numbers = bool(re.search(r'\d+%|increased|reduced|managed \d+|\$[\d,]+|£[\d,]+', text, re.I))

    score = 0
    score += min(word_count / 600 * 30, 30)   # up to 30pts for length
    score += min(skill_count / 15 * 30, 30)    # up to 30pts for skills
    score += min(len(sections_found) / 6 * 25, 25)  # up to 25pts for sections
    score += 15 if has_numbers else 0           # 15pts for quantified achievements

    tips = [msg for check, msg in CV_TIPS if check(text, skills, word_count)]

    return {
        "score": round(score),
        "word_count": word_count,
        "skill_count": skill_count,
        "sections_found": sections_found,
        "has_quantified_achievements": has_numbers,
        "tips": tips,
    }


def extract_text_from_pdf(file_path):
    text = ""

    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

    return text


def extract_text_from_docx(file_path):
    doc = Document(file_path)
    text = "\n".join([para.text for para in doc.paragraphs])
    return text


def process_cv(file_path):
    """
    Reads CV file and extracts raw text.
    """

    print(f"Processing CV: {file_path}")

    extension = os.path.splitext(file_path)[1].lower()

    if extension == ".pdf":
        text = extract_text_from_pdf(file_path)

    elif extension == ".docx":
        text = extract_text_from_docx(file_path)

    else:
        return {"error": "Unsupported file format"}

    # show preview
    print("\n--- CV TEXT PREVIEW ---")
    print(text[:500])
    print("-----------------------\n")

    # 🔥 Extract skills using NLP (NO AI)
    skills = extract_skills(text)
    cv_score = score_cv(text, skills)

    return {
        "full_text": text,
        "preview": text[:300],
        "skills": skills,
        "cv_score": cv_score,
    }