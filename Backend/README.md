# Fluent Assist Backend

FastAPIを使用した吃音支援アプリケーションのバックエンドAPIです。

## 環境構築

1. Python 3.8以上がインストールされていることを確認してください。

2. 依存関係のインストール:
```bash
pip install -r requirements.txt
```

## 開発サーバーの起動

以下のコマンドで開発サーバーを起動できます：

```bash
python run.py
```

サーバーは以下のURLで起動します：
- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 環境変数

`.env`ファイルで以下の環境変数を設定できます：

- `API_ENV`: 環境設定（development/production）
- `HOST`: ホスト名
- `PORT`: ポート番号
- `CORS_ORIGINS`: CORSで許可するオリジン

## APIエンドポイント

### GET /
- 説明: APIのウェルカムメッセージを返します
- レスポンス: `{"message": "Fluent Assist API へようこそ"}`

### GET /alternatives/{word}
- 説明: 指定された単語の代替案を返します
- パラメータ: `word` (string) - 代替案を取得したい単語
- レスポンス: 
```json
{
    "word": "入力された単語",
    "alternatives": ["代替案1", "代替案2", "代替案3"]
}
``` 