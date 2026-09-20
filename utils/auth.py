"""Candidate authentication: password hashing, signed bearer tokens, demo candidates."""
import os
import re
import secrets
from functools import wraps

from flask import g, jsonify, request
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from werkzeug.security import check_password_hash, generate_password_hash

from utils import db

TOKEN_MAX_AGE = 60 * 60 * 24 * 30  # 30 days
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

# One-click demo candidates (no password; cannot be signed into via the login form).
DEMO_CANDIDATES = {
    "alex": {"email": "alex.rivera@demo.cvision", "name": "Alex Rivera", "role": "Backend engineer"},
    "priya": {"email": "priya.shah@demo.cvision", "name": "Priya Shah", "role": "Data analyst"},
    "jordan": {"email": "jordan.lee@demo.cvision", "name": "Jordan Lee", "role": "Product designer"},
}

_secret = os.environ.get("SECRET_KEY") or secrets.token_hex(32)  # random per-boot if unset
_serializer = URLSafeTimedSerializer(_secret, salt="cvision-auth")


def public_user(row):
    return {"id": row["id"], "name": row["name"], "email": row["email"], "is_demo": bool(row["is_demo"])}


def issue_token(user_id):
    return _serializer.dumps({"uid": user_id})


def _user_from_request():
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    try:
        data = _serializer.loads(header[7:], max_age=TOKEN_MAX_AGE)
    except (BadSignature, SignatureExpired):
        return None
    return db.get_user(data.get("uid"))


def optional_user():
    """The signed-in user for this request, or None (cached per request)."""
    if "user" not in g:
        g.user = _user_from_request()
    return g.user


def login_required(view):
    @wraps(view)
    def wrapper(*args, **kwargs):
        if optional_user() is None:
            return jsonify({"error": "Please sign in to continue."}), 401
        return view(*args, **kwargs)
    return wrapper


def register(email, name, password):
    email = (email or "").strip().lower()
    name = (name or "").strip()
    if not EMAIL_RE.match(email):
        return None, "Enter a valid email address."
    if not name:
        return None, "Enter your name."
    if len(password or "") < 8:
        return None, "Password must be at least 8 characters."
    if db.get_user_by_email(email):
        return None, "An account with that email already exists."
    user_id = db.create_user(email, name, generate_password_hash(password))
    return db.get_user(user_id), None


def login(email, password):
    row = db.get_user_by_email((email or "").strip().lower())
    if not row or row["is_demo"] or not check_password_hash(row["password_hash"], password or ""):
        return None, "Incorrect email or password."
    return row, None


def demo_login(key):
    profile = DEMO_CANDIDATES.get(key)
    if not profile:
        return None
    row = db.get_user_by_email(profile["email"])
    if not row:
        # Unusable random password: demo accounts are only reachable through demo_login.
        db.create_user(profile["email"], profile["name"], generate_password_hash(secrets.token_hex(16)), is_demo=True)
        row = db.get_user_by_email(profile["email"])
    return row
