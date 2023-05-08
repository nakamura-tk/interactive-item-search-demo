from typing import List
from api.models.chat_message import ChatMessageRequest, ChatMessageResponse, Item, ChatMessageHistory, Role
from boto3.dynamodb.conditions import Key
import os
import openai


class ChatService:
    def __init__(self, chat_history_table: any):
        self.chat_history_table = chat_history_table
        OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
        OPENAI_ORG_ID = os.environ["OPENAI_ORG_ID"]
        openai.api_key = OPENAI_API_KEY
        openai.organization = OPENAI_ORG_ID
    
    def process_chat_message(self, session_id: str, request: ChatMessageRequest) -> ChatMessageResponse:
        chat_message_history: List[ChatMessageHistory] = self._get_chat_message_history(session_id)
        assistant_message = self._call_openai_api(chat_message_history=chat_message_history, user_message=request.message)
        items = [
            Item(id="1", description="Item 1", image_url="https://example.com/item1.jpg"),
            Item(id="2", description="Item 2", image_url="https://example.com/item2.jpg"),
        ]
        message = assistant_message
        response = ChatMessageResponse(message=message, items=items)
        return response
    
    def _get_chat_message_history(self, session_id: str) -> List[ChatMessageHistory]:
        response = self.chat_history_table.query(KeyConditionExpression=Key("session_id").eq(session_id))
        items = response["Items"]
        return [ChatMessageHistory(**item) for item in items]
    
    def _call_openai_api(self, chat_message_history: List[ChatMessageHistory], user_message: str) -> str:
        messages = self._format_messages(chat_message_history, user_message)
        response = openai.ChatCompletion.create(model="gpt-3.5-turbo", messages=messages)
        assistant_message = response.choices[0]["message"]["content"].strip()
        print(assistant_message)
        return assistant_message
    
    def _format_messages(self, chat_message_history: List[ChatMessageHistory], user_message: str) -> str:
        messages = [{"role": message.role, "content": message.message} for message in chat_message_history]
        messages.append({"role": Role.user, "content": user_message})
        return messages
