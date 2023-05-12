from typing import List
from api.models.chat_message import (
    ChatMessageRequest,
    ChatMessageResponse,
    Item,
    ChatMessageHistory,
    Role,
)
from boto3.dynamodb.conditions import Key
import os
import openai
import logging
import uuid
from api.utils.date import get_current_datetime_iso_string
from fastapi import HTTPException
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR
import traceback


class ChatService:
    def __init__(self, chat_history_table: any):
        self.chat_history_table = chat_history_table
        OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
        OPENAI_ORG_ID = os.environ["OPENAI_ORG_ID"]
        openai.api_key = OPENAI_API_KEY
        openai.organization = OPENAI_ORG_ID

    def process_chat_message(
        self, session_id: str, request: ChatMessageRequest
    ) -> ChatMessageResponse:
        try:
            logging.info(request)

            chat_message_history: List[
                ChatMessageHistory
            ] = self._get_chat_message_histories(session_id)
            assistant_message = self._call_openai_api(
                chat_message_history=chat_message_history, user_message=request.message
            )
            items = [
                Item(
                    id="1",
                    description="Item 1",
                    image_url="https://example.com/item1.jpg",
                ),
                Item(
                    id="2",
                    description="Item 2",
                    image_url="https://example.com/item2.jpg",
                ),
            ]

            self._save_conversations(
                session_id=session_id,
                user_message=request.message,
                assistant_message=assistant_message,
            )

            response = ChatMessageResponse(message=assistant_message, items=items)

            logging.info(response)
            return response
        except Exception:
            traceback.print_exc()
            raise HTTPException(
                status_code=HTTP_500_INTERNAL_SERVER_ERROR, detail="エラーが発生しました。"
            )

    def _get_chat_message_histories(self, session_id: str) -> List[ChatMessageHistory]:
        response = self.chat_history_table.query(
            KeyConditionExpression=Key("session_id").eq(session_id)
        )
        items = response["Items"]
        return [ChatMessageHistory(**item) for item in items]

    def _save_conversations(
        self, session_id: str, user_message: str, assistant_message: str
    ) -> None:
        for message in [
            {"role": Role.user, "message": user_message},
            {"role": Role.assistant, "message": assistant_message},
        ]:
            logging.info(message)
            self._save_chat_message_history(
                chat_message_history=ChatMessageHistory(
                    role=message["role"],
                    message=message["message"],
                    session_id=session_id,
                    sent_at=get_current_datetime_iso_string(),
                    message_id=str(uuid.uuid4()),
                )
            )

    def _save_chat_message_history(
        self, chat_message_history: ChatMessageHistory
    ) -> None:
        self.chat_history_table.put_item(Item=chat_message_history.dict())

    def _call_openai_api(
        self, chat_message_history: List[ChatMessageHistory], user_message: str
    ) -> str:
        messages = self._format_messages(chat_message_history, user_message)
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo", messages=messages
        )
        assistant_message = response.choices[0]["message"]["content"].strip()
        logging.info(assistant_message)
        return assistant_message

    def _format_messages(
        self, chat_message_history: List[ChatMessageHistory], user_message: str
    ) -> str:
        messages = [
            {"role": message.role, "content": message.message}
            for message in chat_message_history
        ]
        messages.append({"role": Role.user, "content": user_message})
        return messages
