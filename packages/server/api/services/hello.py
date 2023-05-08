from api.models.hello import HelloResponse


def hello() -> HelloResponse:
    return {"message": "Hello!!!!"}
