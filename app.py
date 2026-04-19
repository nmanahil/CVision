from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename

from agents.cv_parser import process_cv
from agents.job_parser import extract_job_skills
from agents.matcher_agent import match_skills, recommend_jobs

app = Flask(__name__)
CORS(app)

CURRENT_CV_SKILLS = []
CURRENT_CV_SCORE = {}

UPLOAD_FOLDER = "uploads"
ALLOWED_CV_EXTENSIONS = {"pdf", "docx"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_cv_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_CV_EXTENSIONS


@app.route("/")
def home():
    return "Backend is running!"


@app.route("/upload_cv", methods=["POST"])
def upload_cv():
    global CURRENT_CV_SKILLS

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
        CURRENT_CV_SKILLS = result.get("skills", [])
        cv_score = result.get("cv_score", {})
        CURRENT_CV_SCORE = cv_score
    except Exception:
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({"error": "That file could not be read as a valid CV. Please upload a real PDF or DOCX resume."}), 400

    if not CURRENT_CV_SKILLS:
        return jsonify({"error": "No CV skills were detected. Please upload a clearer resume PDF or DOCX."}), 400

    return jsonify({
        "message": "CV uploaded successfully",
        "skills": CURRENT_CV_SKILLS,
        "cv_score": cv_score,
    })


@app.route("/roast_cv", methods=["GET"])
def roast_cv():
    global CURRENT_CV_SKILLS, CURRENT_CV_SCORE
    if not CURRENT_CV_SKILLS:
        return jsonify({"error": "Upload CV first"}), 400
    return jsonify({
        "score": CURRENT_CV_SCORE.get("score", 0),
        "tips": CURRENT_CV_SCORE.get("tips", []),
        "word_count": CURRENT_CV_SCORE.get("word_count", 0),
        "skill_count": CURRENT_CV_SCORE.get("skill_count", 0),
        "sections_found": CURRENT_CV_SCORE.get("sections_found", []),
        "has_quantified_achievements": CURRENT_CV_SCORE.get("has_quantified_achievements", False),
    })


@app.route("/compare_jobs", methods=["POST"])
def compare_jobs():
    global CURRENT_CV_SKILLS
    if not CURRENT_CV_SKILLS:
        return jsonify({"error": "Upload CV first"}), 400

    data = request.get_json()
    if not data or "jobs" not in data:
        return jsonify({"error": "No jobs provided"}), 400

    results = []
    for job in data["jobs"]:
        parsed = extract_job_skills(job.get("description", ""))
        match = match_skills(CURRENT_CV_SKILLS, parsed["skills"])
        results.append({
            "label": job.get("label", f"Job {len(results)+1}"),
            "match_percentage": match["match_percentage"],
            "matched_skills": match["matched_skills"],
            "missing_skills": match["missing_skills"],
        })

    return jsonify({"comparisons": results})


@app.route("/analyze_job", methods=["POST"])
def analyze_job():
    global CURRENT_CV_SKILLS

    job_input = request.form.get("job_description")
    if not job_input:
        return jsonify({"error": "No job description provided"}), 400
    if not CURRENT_CV_SKILLS:
        return jsonify({"error": "Upload CV first"}), 400

    parsed = extract_job_skills(job_input)
    job_skills = parsed["skills"]
    scraped_preview = parsed.get("scraped_text")

    match_result = match_skills(CURRENT_CV_SKILLS, job_skills)

    return jsonify({
        "job_skills": job_skills,
        "scraped_preview": scraped_preview,
        "match_result": match_result
    })


@app.route("/recommend_jobs", methods=["GET"])
def get_job_recommendations():
    global CURRENT_CV_SKILLS

    if not CURRENT_CV_SKILLS:
        return jsonify({"error": "Upload CV first"}), 400

    recommendations = recommend_jobs(CURRENT_CV_SKILLS)
    return jsonify({"recommendations": recommendations})


if __name__ == "__main__":
    app.run(debug=True)
