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
    return {"message": "Fluent Assist API"}


@app.get("/alternatives/{word}")
async def get_alternatives(word: str):
    # 従来のシンプルな代替案API
    mock_alternatives = nlp_utils.get_mock_alternatives_database()

    return {
        "word": word,
        "alternatives": mock_alternatives.get(
            word.lower(), ["代替案1", "代替案2", "代替案3"]
        ),
    }


@app.post("/analyze", response_model=TextAnalysisResponse)
async def analyze_text(request: TextAnalysisRequest):
    """
    テキストを分析して発音が難しい単語を検出する
    """
    try:
        difficult_words = nlp_utils.get_difficult_words(
            request.text, request.difficulty_threshold, request.user_difficult_words
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
                request.text, request.target_word
            )
            alternatives.extend(mlm_alternatives)

        # 埋め込みベクトルによる代替案生成
        if request.method in ["embeddings", "both"]:
            # モックデータベースから単語候補を取得
            mock_db = nlp_utils.get_mock_alternatives_database()
            candidates = mock_db.get(request.target_word.lower(), [])

            # 候補がある場合のみ実行
            if candidates:
                embedding_alternatives = (
                    nlp_utils.generate_alternatives_with_similar_embeddings(
                        request.text, request.target_word, candidates
                    )
                )
                alternatives.extend(embedding_alternatives)

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
    """
    try:
        # 難しい単語を検出
        difficult_words = nlp_utils.get_difficult_words(
            request.text, request.difficulty_threshold, request.user_difficult_words
        )

        # 各難しい単語に対して代替案を生成
        words_with_alternatives = []

        for word_info in difficult_words:
            word = word_info["word"]

            # MLMによる代替案生成
            mlm_alternatives = nlp_utils.generate_alternatives_with_mlm(
                request.text, word
            )

            # モックデータベースから単語候補を取得
            mock_db = nlp_utils.get_mock_alternatives_database()
            candidates = mock_db.get(word.lower(), [])

            # 候補がある場合は埋め込みベクトルでも生成
            embedding_alternatives = []
            if candidates:
                embedding_alternatives = (
                    nlp_utils.generate_alternatives_with_similar_embeddings(
                        request.text, word, candidates
                    )
                )

            # 両方の結果を組み合わせ
            combined_alternatives = mlm_alternatives + embedding_alternatives

            # 発音のしやすさでフィルタリング
            filtered_alternatives = nlp_utils.filter_by_pronunciation_ease(
                combined_alternatives
            )

            # 結果を追加
            words_with_alternatives.append(
                {
                    "word": word,
                    "position": word_info["position"],
                    "difficulty": word_info["difficulty"],
                    "alternatives": filtered_alternatives[:5],  # 上位5件に制限
                }
            )

        return {"text": request.text, "words": words_with_alternatives}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"リアルタイム分析中にエラーが発生しました: {str(e)}",
        )
