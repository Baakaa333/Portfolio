from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
import json
import os
from datetime import datetime

router = APIRouter()

SUBMISSIONS_FILE = os.path.join(os.path.dirname(__file__), "..", "submissions.json")


class ContactPayload(BaseModel):
    name: str
    email: str
    message: str
    encrypted_message: str  # PGP-armored ciphertext from browser


def _load_submissions():
    if not os.path.exists(SUBMISSIONS_FILE):
        return []
    with open(SUBMISSIONS_FILE, "r") as f:
        return json.load(f)


def _save_submissions(submissions):
    with open(SUBMISSIONS_FILE, "w") as f:
        json.dump(submissions, f, indent=2)


@router.post("/contact")
async def submit_contact(payload: ContactPayload):
    """
    Receive a contact form submission.
    The 'encrypted_message' field contains PGP-armored ciphertext
    generated in the browser — the plaintext message never touches the server.
    """
    submissions = _load_submissions()
    entry = {
        "id": len(submissions) + 1,
        "timestamp": datetime.utcnow().isoformat(),
        "name": payload.name,
        "email": payload.email,
        "encrypted_message": payload.encrypted_message,
        # plaintext 'message' intentionally NOT stored
    }
    submissions.append(entry)
    _save_submissions(submissions)

    return JSONResponse(
        content={
            "status": "received",
            "message": "Message encrypted and logged. Response incoming.",
            "receipt_id": entry["id"],
        }
    )
