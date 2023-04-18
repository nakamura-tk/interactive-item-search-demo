# ベースイメージとして公式のPythonイメージを使用
FROM python:3.10

# 作業ディレクトリの設定
WORKDIR /api

# 依存関係のファイルをコピー
COPY pyproject.toml poetry.lock ./

# Poetryのインストール
RUN pip install --upgrade pip \
    && pip install poetry \
    && poetry config virtualenvs.create false \
    && poetry install --no-dev

# アプリケーションのソースコードをコピー
COPY ./api /api

# アプリケーションを実行するコマンド
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
