# CVision

AI CV analyzer: upload a CV, add a target job, and get a Gemini-powered compatibility audit
(match gauge, 4-dimension breakdown, evidence-backed skills matrix, weak points, XYZ bullet rewrites,
ATS screen, upskilling roadmap) plus a streaming Career Co-Pilot chat.

## Backend (Flask)

```bash
pip install -r requirements.txt
cp .env.example .env        # then put your key in GEMINI_API_KEY (https://aistudio.google.com/apikey)
python app.py               # http://127.0.0.1:5000
```

- `GEMINI_MODEL` defaults to `gemini-3.8-flash`. If it is overloaded or over quota the backend automatically
  falls back to other Flash models and tells the UI which one answered.
- Accounts and scan history are stored in SQLite (`data/cvision.db`, git-ignored). On hosts with an
  ephemeral disk (e.g. Render free tier) this resets on redeploy — set `DB_PATH` to a persistent disk.
- `.env` is git-ignored. Never commit your API key.

## Frontend (React + Vite)

```bash
cd frontend
cp .env.example .env        # VITE_API_URL=http://127.0.0.1:5000
npm install && npm run dev
```

Theme: **Professional** (default) or **Gen Z** voice, each in light/dark, from the Theme menu.
