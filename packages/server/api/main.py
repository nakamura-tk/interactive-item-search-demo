from fastapi import FastAPI
from api.routes import chat_message, hello

app = FastAPI()

app = FastAPI()

app.include_router(chat_message.router)
app.include_router(hello.router)
