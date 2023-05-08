from fastapi import APIRouter
from api.models.chat_message import ChatMessageRequest, ChatMessageResponse
from api.services.chat_message import process_chat_message

router = APIRouter()


@router.post("/chat-messages/{session_id}", response_model=ChatMessageResponse)
def post_chat_message(session_id: str, request: ChatMessageRequest):
    return process_chat_message(session_id, request)
