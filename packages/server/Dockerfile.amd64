# Dockerfile for amd64
FROM --platform=linux/amd64 public.ecr.aws/docker/library/python:3.9.16-slim-buster

# Lambda Web Adapterをインストール
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.7.0-x86_64 /lambda-adapter /opt/extensions/lambda-adapter

ENV PORT=8000

# 作業ディレクトリの設定
WORKDIR /var/task

# 依存関係のファイルをコピー
COPY pyproject.toml poetry.lock ./

# Poetryのインストール
RUN apt-get update && apt-get install -y gcc python3-dev \
    && pip install --upgrade pip \
    && pip install poetry \
    && poetry config virtualenvs.create false \
    && poetry install --no-dev

# アプリケーションのソースコードをコピー
COPY ./api ./api

# アプリケーションを実行するコマンド
CMD exec uvicorn --host=0.0.0.0 --port=$PORT api.main:app
