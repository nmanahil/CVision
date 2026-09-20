"""SQLite storage for candidate accounts and saved match scans."""
import json
import os
import sqlite3
from contextlib import closing
from datetime import datetime, timezone

DB_PATH = os.environ.get(
    "DB_PATH",
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "cvision.db"),
)

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    is_demo INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL,
    job_title TEXT NOT NULL DEFAULT '',
    company TEXT NOT NULL DEFAULT '',
    overall_score INTEGER NOT NULL DEFAULT 0,
    ats_probability INTEGER NOT NULL DEFAULT 0,
    cv_filename TEXT NOT NULL DEFAULT '',
    cv_text TEXT NOT NULL DEFAULT '',
    job_text TEXT NOT NULL DEFAULT '',
    skills_json TEXT NOT NULL DEFAULT '[]',
    cv_score_json TEXT NOT NULL DEFAULT '{}',
    analysis_json TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_scans_user ON scans(user_id, created_at DESC);
"""


def _connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def _now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with closing(_connect()) as conn:
        conn.executescript(SCHEMA)
        conn.commit()


def create_user(email, name, password_hash, is_demo=False):
    with closing(_connect()) as conn:
        cur = conn.execute(
            "INSERT INTO users (email, name, password_hash, is_demo, created_at) VALUES (?, ?, ?, ?, ?)",
            (email, name, password_hash, int(is_demo), _now()),
        )
        conn.commit()
        return cur.lastrowid


def get_user_by_email(email):
    with closing(_connect()) as conn:
        return conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()


def get_user(user_id):
    with closing(_connect()) as conn:
        return conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()


def save_scan(user_id, *, cv_filename, cv_text, job_text, skills, cv_score, analysis):
    with closing(_connect()) as conn:
        cur = conn.execute(
            """INSERT INTO scans (user_id, created_at, job_title, company, overall_score, ats_probability,
                                  cv_filename, cv_text, job_text, skills_json, cv_score_json, analysis_json)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                user_id, _now(), analysis.get("job_title", ""), analysis.get("company", ""),
                analysis.get("overall_score", 0), analysis.get("ats_pass_probability", 0),
                cv_filename, cv_text, job_text, json.dumps(skills), json.dumps(cv_score), json.dumps(analysis),
            ),
        )
        conn.commit()
        return cur.lastrowid


def list_scans(user_id):
    with closing(_connect()) as conn:
        rows = conn.execute(
            """SELECT id, created_at, job_title, company, overall_score, ats_probability, cv_filename
               FROM scans WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT 100""",
            (user_id,),
        ).fetchall()
    return [dict(r) for r in rows]


def get_scan(user_id, scan_id):
    with closing(_connect()) as conn:
        row = conn.execute("SELECT * FROM scans WHERE id = ? AND user_id = ?", (scan_id, user_id)).fetchone()
    if not row:
        return None
    scan = dict(row)
    scan["skills"] = json.loads(scan.pop("skills_json"))
    scan["cv_score"] = json.loads(scan.pop("cv_score_json"))
    scan["analysis"] = json.loads(scan.pop("analysis_json"))
    return scan


def delete_scan(user_id, scan_id):
    with closing(_connect()) as conn:
        cur = conn.execute("DELETE FROM scans WHERE id = ? AND user_id = ?", (scan_id, user_id))
        conn.commit()
        return cur.rowcount > 0
