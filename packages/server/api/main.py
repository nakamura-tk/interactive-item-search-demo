from fastapi import FastAPI
from api.routes import chat_message, hello

app = FastAPI(
    title="ゆるふわ商品検索Demo API",
    description="ChatGPTをインタフェースにした、対話型の商品検索デモツールのAPIです。",
    version="1.0.0",
)

app.include_router(chat_message.router)
# app.include_router(hello.router)
