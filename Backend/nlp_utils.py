import torch
from transformers import AutoTokenizer, AutoModelForMaskedLM
import MeCab
import fugashi
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import os
import logging

# ロガーのセットアップ
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# グローバル変数としてモデルとトークナイザ、形態素解析器を初期化
bert_model_name = "cl-tohoku/bert-base-japanese-v2"

# MeCab形態素解析器の初期化
try:
    # Docker環境ではmecabrcのパスが異なる可能性があるため、環境変数から取得するか複数のパスをチェック
    mecab_rc_path = os.environ.get("MECABRC", "")

    if not mecab_rc_path:
        potential_mecabrc_paths = [
            "/etc/mecabrc",
            "/usr/local/etc/mecabrc",
            "/usr/share/mecab/mecabrc",
            "/usr/local/lib/mecab/dic/ipadic/dicrc",
        ]

        for path in potential_mecabrc_paths:
            if os.path.exists(path):
                mecab_rc_path = path
                logger.info(f"MeCab設定ファイルを見つけました: {path}")
                break

    # MeCabの初期化
    if mecab_rc_path:
        mecab_tagger = MeCab.Tagger(f"-r {mecab_rc_path}")
    else:
        mecab_tagger = MeCab.Tagger()

    # 初期化テスト
    result = mecab_tagger.parse("テスト")
    logger.info("MeCab形態素解析器の初期化に成功しました")
except Exception as e:
    logger.error(f"MeCab形態素解析器の初期化中にエラーが発生しました: {e}")
    # フォールバックとして、オプションなしで初期化を試みる
    try:
        mecab_tagger = MeCab.Tagger("")
        logger.warning("オプションなしでMeCab形態素解析器を初期化しました")
    except Exception as e2:
        logger.error(f"MeCabフォールバック初期化も失敗しました: {e2}")
        mecab_tagger = None
        logger.warning("MeCab形態素解析機能は無効になります")

# Fugashi形態素解析器の初期化（BERTトークナイザー用）
try:
    # Fugashiの初期化
    fugashi_tagger = fugashi.Tagger()
    logger.info("Fugashi形態素解析器の初期化に成功しました")
except Exception as e:
    logger.error(f"Fugashi形態素解析器の初期化中にエラーが発生しました: {e}")
    fugashi_tagger = None
    logger.warning("Fugashi形態素解析機能は無効になります")


def load_model():
    """BERTモデルとトークナイザをロードする関数"""
    try:
        logger.info(f"日本語BERTモデル '{bert_model_name}' をロード中...")
        # fugashiが必要なので、明示的に辞書のパスを指定しない
        tokenizer = AutoTokenizer.from_pretrained(bert_model_name)
        model = AutoModelForMaskedLM.from_pretrained(bert_model_name)
        logger.info("日本語BERTモデルのロードに成功しました")
        return model, tokenizer
    except Exception as e:
        logger.error(f"モデルのロード中にエラーが発生しました: {e}")
        return None, None


# モデルとトークナイザをグローバル変数として一度だけロード
bert_model, bert_tokenizer = load_model()


def analyze_morphology(text):
    """
    テキストを形態素解析し、単語と品詞情報を返す（MeCabを使用）
    """
    if mecab_tagger is None:
        logger.warning("MeCab形態素解析器が無効なため、形態素解析をスキップします")
        return []

    words = []
    node = mecab_tagger.parseToNode(text)
    position = 0

    while node:
        if node.surface:  # 表層形が存在する場合のみ処理
            # 単語と品詞情報を取得
            surface = node.surface
            feature = node.feature.split(",")
            pos = feature[0] if len(feature) > 0 else "UNK"

            words.append({"surface": surface, "pos": pos, "position": position})
            position += 1

        node = node.next

    return words


def get_difficult_words(text, difficulty_threshold=0.5, user_difficult_words=None):
    """
    テキスト内の難しい単語を特定する
    difficulty_threshold: 難しさの閾値
    user_difficult_words: ユーザーが定義した難しい単語のリスト
    """
    # 簡単な実装: 名詞、動詞、形容詞で4文字以上の単語を「難しい」と判定
    # 実際のアプリでは、より複雑なロジックやモデルを使用する
    words = analyze_morphology(text)
    difficult_words = []

    for word_info in words:
        word = word_info["surface"]
        pos = word_info["pos"]
        position = word_info["position"]

        # ユーザー定義の難しい単語リストに含まれるか確認
        if user_difficult_words and word in user_difficult_words:
            difficult_words.append(
                {"word": word, "position": position, "difficulty": 1.0}
            )
            continue

        # 品詞と長さによる簡易判定
        if pos in ["名詞", "動詞", "形容詞"] and len(word) >= 4:
            # 実際のアプリでは、単語の頻度や発音の複雑さなどに基づいて難しさを計算
            difficulty = 0.7 if len(word) >= 5 else 0.6

            if difficulty >= difficulty_threshold:
                difficult_words.append(
                    {"word": word, "position": position, "difficulty": difficulty}
                )

    return difficult_words


def get_word_embedding(text, target_word):
    """
    文章内の特定の単語の埋め込みベクトルを取得
    """
    if bert_model is None or bert_tokenizer is None:
        return None

    inputs = bert_tokenizer(text, return_tensors="pt")

    # モデルの出力を取得
    with torch.no_grad():
        outputs = bert_model(**inputs, output_hidden_states=True)

    # 最後の隠れ層の出力を取得
    hidden_states = outputs.hidden_states[-1][0]

    # 単語のトークン位置を特定
    tokens = bert_tokenizer.tokenize(text)
    target_tokens = bert_tokenizer.tokenize(target_word)

    # 単語が複数のトークンに分割されている場合は、最初のトークンの位置を使用
    target_token = target_tokens[0]
    target_positions = [i for i, t in enumerate(tokens) if t == target_token]

    if not target_positions:
        return None

    # 単語の埋め込みを取得（複数位置ある場合は最初の位置を使用）
    token_idx = target_positions[0] + 1  # CLS分の+1
    word_embedding = hidden_states[token_idx].numpy()

    return word_embedding


def generate_alternatives_with_mlm(text, target_word, top_k=5):
    """
    マスク言語モデリングを使用して代替案を生成
    """
    if bert_model is None or bert_tokenizer is None:
        return []

    # ターゲット単語をマスクに置き換える
    masked_text = text.replace(target_word, bert_tokenizer.mask_token)

    inputs = bert_tokenizer(masked_text, return_tensors="pt")

    # マスクトークンの位置を取得
    mask_idx = torch.where(inputs["input_ids"][0] == bert_tokenizer.mask_token_id)[0]

    if len(mask_idx) == 0:
        return []

    # モデルの予測を取得
    with torch.no_grad():
        outputs = bert_model(**inputs)

    # マスク位置での予測確率
    logits = outputs.logits[0, mask_idx[0]]

    # Top-k予測を取得
    topk_probs, topk_indices = torch.topk(torch.softmax(logits, dim=-1), k=top_k)

    alternatives = []
    for prob, idx in zip(topk_probs.tolist(), topk_indices.tolist()):
        token = bert_tokenizer.convert_ids_to_tokens([idx])[0]
        # サブワードトークンから元の単語を復元（##を削除）
        if token.startswith("##"):
            token = token[2:]
        alternatives.append({"word": token, "probability": prob})

    return alternatives


def generate_alternatives_with_similar_embeddings(
    text, target_word, candidates, top_k=5
):
    """
    単語埋め込みの類似度に基づいて代替案を生成
    """
    if bert_model is None or bert_tokenizer is None:
        return []

    # ターゲット単語の埋め込みを取得
    target_embedding = get_word_embedding(text, target_word)

    if target_embedding is None:
        return []

    # 候補単語の埋め込みを取得
    candidate_embeddings = []
    for candidate in candidates:
        # 候補単語を元のテキストに埋め込んだ文を作成
        candidate_text = text.replace(target_word, candidate)
        candidate_embedding = get_word_embedding(candidate_text, candidate)

        if candidate_embedding is not None:
            candidate_embeddings.append((candidate, candidate_embedding))

    # コサイン類似度を計算して順位付け
    similarities = []
    for candidate, embedding in candidate_embeddings:
        sim = cosine_similarity([target_embedding], [embedding])[0][0]
        similarities.append((candidate, sim))

    # 類似度でソート
    similarities.sort(key=lambda x: x[1], reverse=True)

    # 上位k個の候補を返す
    alternatives = []
    for candidate, sim in similarities[:top_k]:
        alternatives.append({"word": candidate, "similarity": float(sim)})

    return alternatives


def filter_by_pronunciation_ease(alternatives, difficult_patterns=None):
    """
    発音のしやすさに基づいて代替案をフィルタリング
    """
    if difficult_patterns is None:
        # 吃音者が発音しにくい可能性のあるパターン（例示）
        difficult_patterns = ["sp", "st", "pr", "tr", "kr", "き", "か", "た", "は"]

    filtered_alts = []
    for alt in alternatives:
        word = alt["word"]
        # 単語の発音しやすさスコアを計算
        difficulty_score = 0
        for pattern in difficult_patterns:
            if pattern in word:
                difficulty_score += 1

        # 発音の難しさと意味的な類似度を組み合わせたスコア
        ease_score = 1.0
        if "similarity" in alt:
            ease_score = alt["similarity"] * (1.0 - 0.2 * difficulty_score)
        elif "probability" in alt:
            ease_score = alt["probability"] * (1.0 - 0.2 * difficulty_score)

        filtered_alts.append(
            {
                "word": word,
                "score": ease_score,
                "original_score": alt.get("similarity", alt.get("probability", 0)),
                "pronunciation_difficulty": difficulty_score,
            }
        )

    # スコアでソート
    filtered_alts.sort(key=lambda x: x["score"], reverse=True)

    return filtered_alts



