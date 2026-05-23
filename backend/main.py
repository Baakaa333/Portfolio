from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routers import profile, contact, nodes
import re

app = FastAPI(title="Portfolio API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profile.router, prefix="/api")
app.include_router(contact.router, prefix="/api")
app.include_router(nodes.router, prefix="/api")

# ── Honeypot catch-all for fuzzing/crawling ──────────────────────────────────
HONEYPOT_PATTERNS = re.compile(
    r"(/admin|/\.env|/wp-|/phpmyadmin|/config|/\.git|/etc/passwd|/api/v[0-9])",
    re.IGNORECASE,
)

@app.middleware("http")
async def honeypot_guard(request: Request, call_next):
    path = request.url.path
    if HONEYPOT_PATTERNS.search(path):
        ua = request.headers.get("user-agent", "UNKNOWN")
        ip = request.client.host if request.client else "UNKNOWN"
        return JSONResponse(
            status_code=403,
            content={
                "status": "BREACH_DETECTED",
                "code": "403-MAINFRAME-LOCKOUT",
                "message": "⚠ UNAUTHORIZED ACCESS ATTEMPT LOGGED ⚠",
                "details": {
                    "target_path": path,
                    "origin_ip": ip,
                    "user_agent": ua,
                    "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
                    "action": "CREDENTIALS FLAGGED — INCIDENT REPORT FILED",
                },
            },
        )
    return await call_next(request)

@app.get("/")
async def root():
    return {"status": "online", "system": "portfolio-api", "version": "1.0.0"}
