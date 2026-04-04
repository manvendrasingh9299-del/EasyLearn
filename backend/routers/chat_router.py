# routers/chat_router.py
#
# Single endpoint: POST /api/v1/chat
# Receives a message + optional notes context, returns Ducky's reply.

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.ai_service import generate_chat_reply

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    context: str = ""   # the student's notes, sent from the frontend


class ChatResponse(BaseModel):
    reply: str


@router.post("/chat", response_model=ChatResponse, summary="Chat with Ducky AI")
async def chat(body: ChatRequest):
    """
    Send a message to Ducky. Ducky answers from:
    1. The student's uploaded notes (if context is provided)
    2. Llama 3's own general knowledge (for anything not in the notes)
    """
    if not body.message.strip():
        raise HTTPException(status_code=422, detail="Message cannot be empty.")

    try:
        reply = await generate_chat_reply(
            message=body.message.strip(),
            context=body.context,
        )
        return ChatResponse(reply=reply)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Chat failed: {exc}",
        )