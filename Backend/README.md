# Fluent Assist Backend

FastAPIを使用した吃音支援アプリケーションのバックエンドAPIです。

## 特徴

- 日本語BERTモデル（cl-tohoku/bert-base-japanese-v2）を使用した文脈に基づく代替案生成
- 形態素解析（fugashi）による日本語テキストの解析
- マスク言語モデリングと単語埋め込み類似度による代替案生成
- 発音しやすさに基づくフィルタリング機能
- リアルタイム分析とレスポンス

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
- 説明: 指定された単語の基本的な代替案を返します（辞書ベース）
- パラメータ: `word` (string) - 代替案を取得したい単語
- レスポンス: 
```json
{
    "word": "入力された単語",
    "alternatives": ["代替案1", "代替案2", "代替案3"]
}
```

### POST /analyze
- 説明: テキストを分析して発音が難しい単語を検出します
- リクエスト:
```json
{
    "text": "分析するテキスト",
    "difficulty_threshold": 0.5,
    "user_difficult_words": ["追加の難しい単語リスト"]
}
```
- レスポンス:
```json
{
    "text": "入力されたテキスト",
    "difficult_words": [
        {
            "word": "難しい単語",
            "position": 3,
            "difficulty": 0.7
        }
    ]
}
```

### POST /smart-alternatives
- 説明: BERTモデルを使用して文脈に基づいた代替案を生成します
- リクエスト:
```json
{
    "text": "単語を含むテキスト",
    "target_word": "代替案を生成したい単語",
    "method": "both"  // "mlm", "embeddings", "both"のいずれか
}
```
- レスポンス:
```json
{
    "word": "入力された単語",
    "alternatives": [
        {
            "word": "代替案",
            "score": 0.85,
            "original_score": 0.9,
            "pronunciation_difficulty": 1
        }
    ]
}
```

### POST /analyze-realtime
- 説明: リアルタイムにテキストを分析して難しい単語と代替案を一度に返します
- リクエスト:
```json
{
    "text": "分析するテキスト",
    "difficulty_threshold": 0.5,
    "user_difficult_words": ["追加の難しい単語リスト"]
}
```
- レスポンス:
```json
{
    "text": "入力されたテキスト",
    "words": [
        {
            "word": "難しい単語",
            "position": 3,
            "difficulty": 0.7,
            "alternatives": [
                {
                    "word": "代替案",
                    "score": 0.85,
                    "original_score": 0.9,
                    "pronunciation_difficulty": 1
                }
            ]
        }
    ]
}
```

## テスト

APIのテストを実行するには、サーバーを起動した状態で以下のコマンドを実行します：

```bash
python test_api.py
```

## テクニカルノート

- 日本語BERTモデル：単語の文脈を理解し、適切な代替案を提案するための深層学習モデル
- 形態素解析：日本語テキストを単語単位に分割して品詞情報を取得
- マスク言語モデリング：文中の単語をマスクし、文脈から適切な単語を予測
- 発音しやすさフィルタリング：吃音者が発音しにくいパターンを含む単語を低ランク化 