# routers/chat_router.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.ai_service import generate_chat_reply

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    context: str = ""

class ChatResponse(BaseModel):
    reply: str

@router.post("/chat", response_model=ChatResponse, summary="Chat with Ducky (Mistral)")
async def chat(body: ChatRequest):
    if not body.message.strip():
        raise HTTPException(status_code=422, detail="Message cannot be empty.")
    try:
        reply = await generate_chat_reply(message=body.message, context=body.context)
        return ChatResponse(reply=reply)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Chat error: {exc}")