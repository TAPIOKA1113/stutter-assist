from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import nlp_utils

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


# リクエスト/レスポンスモデル
class TextAnalysisRequest(BaseModel):
    text: str
    difficulty_threshold: Optional[float] = 0.5
    user_difficult_words: Optional[List[str]] = None
    difficult_sounds: Optional[List[str]] = None


class AlternativesRequest(BaseModel):
    text: str
    target_word: str
    method: Optional[str] = "both"  # "mlm", "embeddings", "both"


class DifficultWord(BaseModel):
    word: str
    position: int
    difficulty: float


class Alternative(BaseModel):
    word: str
    score: float
    original_score: float
    pronunciation_difficulty: int


class TextAnalysisResponse(BaseModel):
    text: str
    difficult_words: List[DifficultWord]


class AlternativesResponse(BaseModel):
    word: str
    alternatives: List[Alternative]


@app.get("/")
async def root():
    return {"message": "Fluent Assist API", "status": "ok"}


@app.get("/alternatives/{word}")
async def get_alternatives(word: str):
    # 従来のシンプルな代替案API
    # モックデータの代わりに基本的なレスポンスを返す
    return {
        "word": word,
        "alternatives": ["代替案1", "代替案2", "代替案3"],
    }


@app.post("/analyze", response_model=TextAnalysisResponse)
async def analyze_text(request: TextAnalysisRequest):
    """
    テキストを分析して発音が難しい単語を検出する
    """
    try:
        difficult_words = nlp_utils.get_difficult_words(
            request.text,
            request.difficulty_threshold,
            request.user_difficult_words,
            request.difficult_sounds,
        )

        return {"text": request.text, "difficult_words": difficult_words}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"テキスト解析中にエラーが発生しました: {str(e)}"
        )


@app.post("/smart-alternatives", response_model=AlternativesResponse)
async def get_smart_alternatives(request: AlternativesRequest):
    """
    BERTモデルを使用して文脈に基づいた代替案を生成する
    """
    try:
        alternatives = []

        # MLMによる代替案生成
        if request.method in ["mlm", "both"]:
            mlm_alternatives = nlp_utils.generate_alternatives_with_mlm(
                request.text, request.target_word, top_k=10
            )
            alternatives.extend(mlm_alternatives)

        # モックデータベースは使用せず、MLMの結果のみを使用
        # 代替案がない場合は空のリストを返す
        if not alternatives:
            return {"word": request.target_word, "alternatives": []}

        # 発音のしやすさでフィルタリング
        filtered_alternatives = nlp_utils.filter_by_pronunciation_ease(alternatives)

        return {"word": request.target_word, "alternatives": filtered_alternatives}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"代替案生成中にエラーが発生しました: {str(e)}"
        )


@app.post("/analyze-realtime")
async def analyze_realtime(request: TextAnalysisRequest):
    """
    リアルタイムにテキストを分析して難しい単語と代替案を一度に返す
    形態素解析の結果を利用して正確な単語の位置情報を返す
    """
    try:
        # 形態素解析と難しい単語を検出（苦手な音を含む）
        difficult_words = nlp_utils.get_difficult_words(
            request.text,
            request.difficulty_threshold,
            request.difficult_sounds,
        )

        # 各難しい単語に対して代替案を生成
        words = []

        for word_info in difficult_words:
            word = word_info["word"]

            # 結果を追加（文字位置情報を含む）
            words.append(
                {
                    "word": word,
                    "position": word_info["position"],
                    "difficulty": word_info["difficulty"],
                    "reason": word_info.get("reason", ""),
                    "start": word_info.get("start", 0),
                    "end": word_info.get("end", 0),
                    "reading": word_info.get("reading", ""),  # 読み情報も追加
                }
            )

        # テキスト全体の読みを取得（2つのバージョンを返す）
        text_pronunciation = nlp_utils.get_pronunciation(request.text)

        return {
            "text": request.text,  # 元のテキスト
            "pronunciation": text_pronunciation,  # 読み
            "words": words,  # 難しい単語とその代替案のオブ
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"リアルタイム分析中にエラーが発生しました: {str(e)}",
        )
