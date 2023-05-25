from typing import List
from api.models.chat_message import (
    ChatMessageRequest,
    ChatMessageResponse,
    Item,
    ChatMessageHistory,
    Role,
)
from boto3.session import Session
from boto3.dynamodb.conditions import Key
import os
import openai
import logging
import uuid
from api.utils.date import get_current_datetime_iso_string
from fastapi import HTTPException
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR
import traceback
import json
import re
from opensearchpy import OpenSearch, RequestsHttpConnection, AWSV4SignerAuth

logger = logging.getLogger("uvicorn")


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
            logger.info(request)

            chat_message_history: List[
                ChatMessageHistory
            ] = self._get_chat_message_histories(session_id)
            openai_response_str = self._call_openai_api(
                chat_message_history=chat_message_history, user_message=request.message
            )

            # JSON形式の文字列のassistant_messageをdictに変換する
            openai_response = self._extract_json(openai_response_str)
            logger.info(f"openai_response: {openai_response}")
            if openai_response is None:
                raise Exception("Uninformed JSON format from OPENAI response.")
            assistant_message = openai_response["message"]
            keywords = openai_response["keywords"]

            # keywordsが存在する場合、商品DBを検索する
            items: List[Item] = (
                self._search_items(keywords=keywords) if len(keywords) != 0 else []
            )

            search_result_message = ""
            if len(keywords) != 0 and len(items) != 0:
                search_result_message = f"\n{keywords}で検索し、{len(items)}件のアイテムが見つかりました。"
            elif len(keywords) != 0 and len(items) == 0:
                search_result_message = f"\n{keywords}で検索し、合致する商品は見つかりませんでした。"

            # keywordsが存在するが商品が見つからなかった場合
            assistant_response = assistant_message + search_result_message

            self._save_conversations(
                session_id=session_id,
                user_message=request.message,
                assistant_message=assistant_response,
            )

            response = ChatMessageResponse(message=assistant_response, items=items)

            logger.info(response)
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
            logger.info(message)
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

        logger.info("messages send to OpenAI API")
        logger.info(messages)
        response = openai.ChatCompletion.create(model="gpt-4", messages=messages)
        assistant_message = response.choices[0]["message"]["content"].strip()
        logger.info("message from assistant:")
        logger.info(assistant_message)
        return assistant_message

    def _format_messages(
        self, chat_message_history: List[ChatMessageHistory], user_message: str
    ) -> str:
        messages = [
            {"role": message.role, "content": message.message}
            for message in chat_message_history
        ]
        messages.append({"role": Role.user, "content": user_message})

        # 一番最初にシステムメッセージを挿入する(Roleはsystemよりuserの方が効くように感じる)
        messages.insert(0, {"role": Role.user, "content": self._get_initial_prompt()})

        # 念押しで出力形式をリマインド
        messages.append(
            {
                "role": Role.system,
                "content": "AIアシスタントの応答は最初に指定した「出力形式」に従いJSONで応答してください",
            }
        )

        return messages

    def _get_initial_prompt(self):
        # 商品検索アシスタントとしての役割を与えるプロンプト
        return """
### 背景 ###
あなたは家具用品のECストアのAIチャットアシスタントです。ユーザーの曖昧な要求から商品を探す役割を果たします。

### 指示 ###
1. ユーザーからの検索要求が曖昧な場合、明確な情報を得るためにユーザーに追加質問をします。
2. ユーザーの要求が明確になったら、それを元に最適な商品を思い浮かべ、その商品を表す検索キーワードを決定します。このキーワードを使ってOpenSearchを通じて商品の存在を確認します。

### 出力形式 ###
以下に示すJSON形式に従って応答を作成してください。返却する出力はJSON文字列でなければなりません。
その文字列はJSON.loadsを使用して直接解析可能であるべきです。このフォーマットの遵守は重要です。出力形式は次のとおりです：

```json
{
    "message": "<ユーザーに対する応答メッセージの文字列>",
    "keywords": <文字列の検索キーワードを格納した配列>
}
```

それでは始めます。

ユーザーの質問:
家具探しを手伝ってくれますか？

AIチャットアシスタントの回答: 
{
    "message": "もちろんです！何をお探しですか？",
    "keywords": []
}

"""

    def _search_items(self, keywords: List[str]) -> List[Item]:
        """
        商品検索の仮実装
        """

        OPENSEARCH_ENDPOINT = os.environ["OPENSEARCH_ENDPOINT"]
        credentials = Session().get_credentials()
        auth = AWSV4SignerAuth(credentials, "ap-northeast-1")
        client = OpenSearch(
            hosts=[{"host": OPENSEARCH_ENDPOINT, "port": 9200}],
            http_compress=True,
            use_ssl=False,
            http_auth=auth,
            connection_class=RequestsHttpConnection,
        )

        query = {
            "size": 5,
            "_source": ["product_id", "title", "image_url"],
            "query": {
                "multi_match": {
                    "query": " ".join(keywords),
                    "fields": ["title", "description", "feature", "brand"],
                }
            },
        }
        logger.info(f"request opensearch. query = {query}")
        response = client.search(body=query, index="items")

        items = []
        for result in response["hits"]["hits"]:
            items.append(
                Item(
                    id=result["_source"]["product_id"],
                    description=result["_source"]["title"],
                    image_url=result["_source"]["image_url"],
                )
            )
        return items

    def _extract_json(self, str_contains_json: str):
        """
        OPENAIの応答の揺れを吸収し、JSONのみ抽出する
        """

        json_str = re.search(r"{.*}", str_contains_json, re.DOTALL)

        if json_str is None:
            return None

        json_obj = json.loads(json_str.group())

        return json_obj
