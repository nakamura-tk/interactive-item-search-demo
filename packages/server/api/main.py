from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def read_root():
    return {"root": "dayo"}


@app.get("/hello")
def read_root():
    return {"Hello": "World"}
