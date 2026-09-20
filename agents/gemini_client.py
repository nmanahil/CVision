"""Thin Gemini client (REST) with retry + model fallback and SSE streaming.

Uses `requests` (already a dependency) so no extra SDK is needed. The API key
and model are read from the environment (GEMINI_API_KEY / GEMINI_MODEL) — the
key must never be hard-coded or committed.
"""
import json
import os
import time

import requests

API_ROOT = "https://generativelanguage.googleapis.com/v1beta/models"
DEFAULT_MODEL = "gemini-3.8-flash"
# Tried in order when the primary model is overloaded (503) or rate limited (429).
FALLBACK_MODELS = [
    "gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest",
]
OVERLOADED = {500, 502, 503, 504}  # transient: retry the model once, then move on
QUOTA = 429  # per-model quota: no point retrying, move to the next model


class GeminiError(Exception):
    """Raised when Gemini is unconfigured, unreachable, or returns unusable output."""


def is_configured():
    return bool(os.environ.get("GEMINI_API_KEY"))


def _model_chain():
    primary = os.environ.get("GEMINI_MODEL", DEFAULT_MODEL)
    return [primary] + [m for m in FALLBACK_MODELS if m != primary]


def _headers():
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        raise GeminiError("GEMINI_API_KEY is not set on the backend.")
    return {"x-goog-api-key": key, "Content-Type": "application/json"}


def _body(contents, system, temperature, schema, max_tokens, thinking):
    config = {"temperature": temperature, "maxOutputTokens": max_tokens}
    if thinking:
        config["thinkingConfig"] = {"thinkingLevel": thinking}
    if schema:
        config["responseMimeType"] = "application/json"
        config["responseSchema"] = schema
    body = {"contents": contents, "generationConfig": config}
    if system:
        body["systemInstruction"] = {"parts": [{"text": system}]}
    return body


def _post(method, model, body, stream=False, timeout=90):
    url = f"{API_ROOT}/{model}:{method}"
    if stream:
        url += "?alt=sse"
    return requests.post(url, headers=_headers(), json=body, stream=stream, timeout=timeout)


def _error_message(resp):
    try:
        return resp.json()["error"]["message"]
    except Exception:
        return f"HTTP {resp.status_code}"


def pretty(model):
    """gemini-3.8-flash -> Gemini 3.8 Flash"""
    return " ".join(p if p[:1].isdigit() else p.capitalize() for p in model.split("-"))


def _open_iter(method, body, stream):
    """POST with retries, falling back through the model chain.

    Yields ("status", message) while a model is failing over, then a final
    ("ok", response, model_used). Raises GeminiError when every model fails.
    """
    chain = _model_chain()
    last = "unknown error"
    for index, model in enumerate(chain):
        attempts = 2 if index == 0 else 1  # the configured model gets a second try
        for attempt in range(attempts):
            try:
                resp = _post(method, model, body, stream=stream)
            except requests.RequestException as exc:
                last = str(exc)
                time.sleep(0.6)
                continue
            if resp.status_code == 200:
                yield "ok", resp, model
                return
            last = _error_message(resp)
            if resp.status_code == QUOTA:
                break
            if resp.status_code in OVERLOADED:
                if attempt + 1 < attempts:
                    time.sleep(1.0)
                continue
            if resp.status_code in (400, 404) and index + 1 < len(chain):
                break  # this model rejects the request; try the next one
            raise GeminiError(last)
        if index + 1 < len(chain):
            yield "status", f"{pretty(model)} is busy — trying {pretty(chain[index + 1])}…"
    raise GeminiError(f"Gemini is unavailable right now: {last}")


def _open(method, body, stream):
    """Like _open_iter but returns (response, model_used), ignoring status events."""
    for event in _open_iter(method, body, stream):
        if event[0] == "ok":
            return event[1], event[2]


def _text_of(candidate):
    parts = (candidate.get("content") or {}).get("parts") or []
    return "".join(p.get("text", "") for p in parts if not p.get("thought"))


def generate_json(prompt, schema, system=None, temperature=0.2, max_tokens=8192, thinking="low"):
    body = _body([{"role": "user", "parts": [{"text": prompt}]}], system, temperature, schema, max_tokens, thinking)
    resp, model = _open("generateContent", body, stream=False)
    data = resp.json()
    candidates = data.get("candidates") or []
    if not candidates:
        raise GeminiError("Gemini returned no candidates (the request may have been blocked).")
    try:
        return json.loads(_text_of(candidates[0])), model
    except json.JSONDecodeError as exc:
        raise GeminiError("Gemini returned malformed JSON.") from exc


def stream_text(messages, system=None, temperature=0.5, max_tokens=2048, thinking="low"):
    """Yield events: {"status": str} while failing over, {"model": str} once, then {"delta": str} chunks.

    `messages` is a list of {role: user|model, text}.
    """
    contents = [{"role": m["role"], "parts": [{"text": m["text"]}]} for m in messages]
    body = _body(contents, system, temperature, None, max_tokens, thinking)
    resp = None
    for event in _open_iter("streamGenerateContent", body, stream=True):
        if event[0] == "status":
            yield {"status": event[1]}
        else:
            _, resp, model = event
            yield {"model": model}
    try:
        for raw in resp.iter_lines():  # bytes: SSE has no charset header, so decode as UTF-8 ourselves
            line = raw.decode("utf-8", errors="replace") if raw else ""
            if not line.startswith("data:"):
                continue
            payload = line[5:].strip()
            if not payload or payload == "[DONE]":
                continue
            try:
                chunk = json.loads(payload)
            except json.JSONDecodeError:
                continue
            for cand in chunk.get("candidates") or []:
                text = _text_of(cand)
                if text:
                    yield {"delta": text}
    finally:
        resp.close()
