from fastapi import APIRouter
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from data.profile_data import PROFILE
import asyncio
import json
import random
import datetime

router = APIRouter()


@router.get("/nodes")
async def get_nodes():
    """Return project node metadata for the globe components."""
    nodes = [
        {
            "id": p["id"],
            "title": p["title"],
            "subtitle": p["subtitle"],
            "ip": p["ip"],
            "position": p["globe_position"],
            "tech": p["tech"],
            "status": p["status"],
            "color": p["color"],
        }
        for p in PROFILE["projects"]
    ]
    return JSONResponse(content={"nodes": nodes})


class TargetRequest(BaseModel):
    node_id: str


@router.post("/nodes/target")
async def target_node(req: TargetRequest):
    """
    Return simulated syslog stream for a targeted project node.
    Used by the Hacker Mode CLI 'target <ip>' command.
    """
    project = next(
        (p for p in PROFILE["projects"] if p["id"] == req.node_id or p["ip"] == req.node_id),
        None,
    )

    if not project:
        return JSONResponse(status_code=404, content={"error": "Node not found in registry."})

    now = datetime.datetime.utcnow()
    ts = now.strftime("%Y-%m-%dT%H:%M:%S")

    logs = [
        f"[{ts}] SYS >> Initiating connection to {project['ip']}...",
        f"[{ts}] NET >> Handshake complete. Node online.",
        f"[{ts}] SYS >> Target: {project['title'].upper()} — {project['subtitle']}",
        f"[{ts}] SYS >> Stack fingerprint: {', '.join(project['tech'])}",
        f"[{ts}] SEC >> Security posture: {project['status']}",
        f"[{ts}] SYS >> Description: {project['description']}",
        f"[{ts}] SYS >> Impact assessment: {project['impact']}",
        f"[{ts}] NET >> Exfiltration complete. {random.randint(128,512)} KB transferred.",
        f"[{ts}] SYS >> Closing connection. Node archived.",
    ]

    return JSONResponse(content={"node": project["id"], "logs": logs})
