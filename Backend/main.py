from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Fluent Assist API",
    description="吃音支援アプリケーションのバックエンドAPI",
    version="1.0.0",
)

# CORSミドルウェアの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Viteのデフォルトポート
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Fluent Assist API "}


@app.get("/alternatives/{word}")
async def get_alternatives(word: str):
    # モックデータ（後で実際のロジックに置き換え）
    mock_alternatives = {
        "stuttering": ["どもり", "言葉の詰まり", "吃音", "発話障害"],
        "presentation": ["発表", "説明", "講演", "スピーチ"],
        "professional": ["専門的", "職業的", "熟練した", "上級"],
        "country": ["国", "国家", "地域", "領土", "土地"],
        "organization": ["組織", "団体", "機関", "協会", "連合"],
        "吃音症": ["言葉の詰まり", "どもり", "発話障害", "発語障害"],
        "職業的": ["仕事の", "専門的", "業務上の", "職務的"],
        "言語障害": ["話し方の問題", "発語障害", "発話困難", "会話障害"],
        "戦略": ["手法", "方法", "対策", "手段", "やり方"],
        "置き換え": ["交換", "代替", "入れ替え", "差し替え"],
    }

    return {
        "word": word,
        "alternatives": mock_alternatives.get(
            word.lower(), ["代替案1", "代替案2", "代替案3"]
        ),
    }
