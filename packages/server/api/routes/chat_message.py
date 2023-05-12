from fastapi import APIRouter
from api.models.chat_message import ChatMessageRequest, ChatMessageResponse
from api.services.chat_message import ChatService
import boto3
import os

router = APIRouter()
dynamodb = boto3.resource("dynamodb")
CHAT_MESSAGE_HISTORY_TABLE_NAME = os.environ["CHAT_MESSAGE_HISTORY_TABLE_NAME"]
chat_history_table = dynamodb.Table(CHAT_MESSAGE_HISTORY_TABLE_NAME)

chat_service = ChatService(chat_history_table=chat_history_table)


@router.post("/chat-messages/{session_id}", response_model=ChatMessageResponse)
def post_chat_message(session_id: str, request: ChatMessageRequest):
    return chat_service.process_chat_message(session_id, request)
