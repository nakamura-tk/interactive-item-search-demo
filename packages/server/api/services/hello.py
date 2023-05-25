import os
from api.models.hello import HelloResponse
from boto3.session import Session
from opensearchpy import OpenSearch, RequestsHttpConnection, AWSV4SignerAuth


def hello() -> HelloResponse:
    credentials = Session().get_credentials()
    auth = AWSV4SignerAuth(credentials, "ap-northeast-1")
    client = OpenSearch(
        hosts=[{"host": os.environ["OPENSEARCH_ENDPOINT"], "port": 9200}],
        http_compress=True,
        use_ssl=False,
        http_auth=auth,
        connection_class=RequestsHttpConnection,
    )
    indices = client.cat.indices()
    return {f'message": "Hello!!!!, indices: {indices}'}
