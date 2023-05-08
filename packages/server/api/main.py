# ローカルでの動作確認用、本番はLambdaの環境変数から読み込む
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI  # noqa: E402
from api.routes import chat_message  # noqa: E402


app = FastAPI(
    title="ゆるふわ商品検索Demo API",
    description="ChatGPTをインタフェースにした、対話型の商品検索デモツールのAPIです。",
    version="1.0.0",
)

app.include_router(chat_message.router)
# app.include_router(hello.router)
