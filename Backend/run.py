import uvicorn
from dotenv import load_dotenv
import os

if __name__ == "__main__":
    # 環境変数の読み込み
    load_dotenv()

    # 環境変数から設定を取得
    host = os.getenv("HOST", "localhost")
    port = int(os.getenv("PORT", "8000"))
    env = os.getenv("API_ENV", "development")

    # uvicornの設定
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=env == "development",  # 開発環境の場合はホットリロードを有効化
    )
