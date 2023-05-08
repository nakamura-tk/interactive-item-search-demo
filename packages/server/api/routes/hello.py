from fastapi import APIRouter
from api.models.hello import HelloResponse
from api.services.hello import hello

router = APIRouter()


@router.get("/hello", response_model=HelloResponse)
def get_hello():
    return hello()
