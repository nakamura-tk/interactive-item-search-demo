from pydantic import BaseModel
from typing import Literal
import uuid
from enum import Enum


class Item(BaseModel):
    id: str
    description: str
    image_url: str


class ChatMessageRequest(BaseModel):
    message: str


class ChatMessageResponse(BaseModel):
    message: str
    items: list[Item]


class Role(str, Enum):
    system = "system"
    assistant = "assistant"
    user = "user"


class ChatMessageHistory(BaseModel):
    session_id: uuid.UUID
    sent_at: int
    message_id: uuid.UUID
    role: Role
    message: str
