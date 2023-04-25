# 商品検索デモの処理フロー設計

## キーワード検索の場合

```mermaid
sequenceDiagram
	actor user as ユーザー
	participant chat as 商品検索アシスタント
	participant api as API
	participant gpt as GPT
	participant items as 商品DB
	participant conversations as 会話履歴DB

	user ->> chat: 初めての一人暮らしで必要なもの
	chat ->> api: POST /chatMessages

	note right of api: [初期設定]<br>・あなたは商品検索アシスタントである<br>・ユーザーから曖昧な検索要求がくる<br>・要求が曖昧な場合深掘りする質問を返す<br>・要求が固まったら、要求を「検索キーワード」に落とし込む
	api ->> gpt: 「初めての一人暮らしで必要なもの」

	loop ユーザーの要求が具体的になるまで
			gpt ->> api:{"message": "「部屋の間取りはなんですか？<br>どういった生活をしたいですか？」", "キーワード": []}
			api ->> chat: {"message":省略}
			chat ->> user: 「部屋の間取りはなんですか？<br>どういった生活をしたいですか？」

			user ->> chat: 部屋は1LDKです。<br>一人暮らしを始めたら料理を頑張りたいです。<br>でも家事は楽をしたい。
			chat ->> api: POST /chatMessages
			api ->> gpt: 少し具体的な商品要求
  end

	gpt ->> api: {"message": "料理を楽にするキッチン用品を探してみますね。",<br> "キーワード": [フードプロセッサー,電子レンジ,炊飯器,<br>電気ケトル,調理鍋,フライパン,調理バサミ,キッチンスケール,タイマー]}
	api ->> items: 商品検索 POST /query/item/_search
  note right of api: キーワードによる全文検索の場合、<br>商品DBで持つ具体的な商品名や文言と合致するかの懸念がある<br>ベクトルDBでセマンティック検索する方法を別途考える必要あり
  items ->> api: {"items": [{},{},{}]}
  api ->> gpt: 検索結果の提供
  gpt ->> api: 取得結果を元に回答の再生成
	api ->> chat: {"messages":"省略", "items": [省略]}
	api ->> user: 「料理を楽にするキッチン用品を探してみますね。」<br>・商品情報リスト: <画像,タイトル、説明、リンク>
```

## ベクトルサーチの場合

上記シーケンスをもとに以下の修正を入れる

- [ ] LlamaIndex を用いたインデック作成部分
- [ ] ES へのクエリをベクトル DB へ変更
  - [ ] LlamaIndex で隠蔽されるが埋め込み API の部分をシーケンスに明記しておく
- [ ] ベクトル DB の情報をもとに、商品情報(画像やリンクなど)を ES に再取得しに行く

```mermaid
sequenceDiagram
	actor user as ユーザー
	participant chat as 商品検索アシスタント
	participant api as API
	participant gpt as GPT
	participant items as 商品DB(ベクトル)
	participant conversations as 会話履歴DB

	user ->> chat: 初めての一人暮らしで必要なもの
	chat ->> api: POST /chatMessages

	note right of api: [初期設定]<br>・あなたは商品検索アシスタントである<br>・ユーザーから曖昧な検索要求がくる<br>・要求が曖昧な場合深掘りする質問を返す<br>・要求が固まったら、要求を「検索キーワード」に落とし込む
	api ->> gpt: 「初めての一人暮らしで必要なもの」

	loop ユーザーの要求が具体的になるまで
			gpt ->> api:{"message": "「部屋の間取りはなんですか？<br>どういった生活をしたいですか？」", "キーワード": []}
			api ->> chat: {"message":省略}
			chat ->> user: 「部屋の間取りはなんですか？<br>どういった生活をしたいですか？」

			user ->> chat: 部屋は1LDKです。<br>一人暮らしを始めたら料理を頑張りたいです。<br>でも家事は楽をしたい。
			chat ->> api: POST /chatMessages
			api ->> gpt: 少し具体的な商品要求
  end

	gpt ->> api: {"message": "料理を楽にするキッチン用品を探してみますね。",<br> "キーワード": [フードプロセッサー,電子レンジ,炊飯器,<br>電気ケトル,調理鍋,フライパン,調理バサミ,キッチンスケール,タイマー]}
	api ->> items: 商品検索 POST /query/item/_search
  note right of api: キーワードによる全文検索の場合、<br>商品DBで持つ具体的な商品名や文言と合致するかの懸念がある<br>ベクトルDBでセマンティック検索する方法を別途考える必要あり
  items ->> api: {"items": [{},{},{}]}
  api ->> gpt: 検索結果の提供
  gpt ->> api: 取得結果を元に回答の再生成
	api ->> chat: {"messages":"省略", "items": [省略]}
	api ->> user: 「料理を楽にするキッチン用品を探してみますね。」<br>・商品情報リスト: <画像,タイトル、説明、リンク>
```
