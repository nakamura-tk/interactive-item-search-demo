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

| キー                                         | 値  |
| -------------------------------------------- | --- |
| INTERACTIVE_ITEM_SEARCH_DEMO_OPEN_AI_API_KEY | TBD |
| INTERACTIVE_ITEM_SEARCH_DEMO_OPEN_AI_ORG_KEY | TBD |

#### OIDC 用 IAM ロールのデプロイ

- GitHubACtions で使用する OIDC 用のロールを手動デプロイ
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
