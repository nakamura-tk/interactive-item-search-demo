from pydantic import BaseModel


class Item(BaseModel):
    id: str
    description: str
    image_url: str


class ChatMessageRequest(BaseModel):
    message: str


class ChatMessageResponse(BaseModel):
    message: str
    items: list[Item]
