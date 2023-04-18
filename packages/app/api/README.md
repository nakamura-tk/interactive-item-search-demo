## 環境構築

```
$ poetry

$ pyenv which python
/Users/~/.pyenv/versions/3.10.9/bin/python
$ poetry env use /Users/~/.pyenv/versions/3.10.9/bin/python
$ poetry shell

```

## Command

```
# フォーマッタをかける
$ poetry run task fmt

# Lintチェック
$ poetry run task lint

# テスト
$ <未整備>
```

## デプロイ

未整備

## ローカル実行

### 直接 ASGI サーバーを起動

```
$ poetry run task dev
```

### Docker イメージで起動

```
# イメージのビルド
$ poetry run task docker-build
# 起動
$ poetry run task docker-dev
```
