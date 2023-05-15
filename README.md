# 対話型ゆるふわ商品検索デモ

## 前提条件

以下がインストールされていること

- Node.js 18.x
- npm 9.x
- Volta
- poetry

## 環境構築

```
$ npm ci
```

## デプロイ方法

main への push で GitHubActions でデプロイします。

### 事前準備

#### SSM パラメーターストアの設定

| キー                                          | 値                  |
| --------------------------------------------- | ------------------- |
| /interactive-item-search-demo/OPEN_AI_API_KEY | <OPENAI の API KEY> |
| /interactive-item-search-demo/OPEN_AI_ORG_ID  | <OPENAI の組織 ID>  |

#### OIDC 用 IAM ロールのデプロイ

- GitHubActions で使用する OIDC 用のロールを手動デプロイ
  - `npm run deploy:oidc`

### バックエンド(手動)

```
npm run deploy:server
```

### フロントエンド(手動)

```
npm run build:web
npm run deploy:web
```
