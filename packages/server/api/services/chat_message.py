from api.models.chat_message import ChatMessageRequest, ChatMessageResponse, Item


def process_chat_message(
    session_id: str, request: ChatMessageRequest
) -> ChatMessageResponse:
    items = [
        Item(id="1", description="Item 1", image_url="https://example.com/item1.jpg"),
        Item(id="2", description="Item 2", image_url="https://example.com/item2.jpg"),
    ]

    message = "お求めの商品を検索してみました"

    response = ChatMessageResponse(message=message, items=items)
    return response
