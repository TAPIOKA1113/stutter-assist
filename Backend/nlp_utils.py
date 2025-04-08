import torch
from transformers import AutoTokenizer, AutoModelForMaskedLM
import MeCab
import fugashi
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import os
import logging
import unicodedata
import string
import jaconv  # jaconvライブラリを使用してひらがな⇔カタカナ変換


# ロガーのセットアップ
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# グローバル変数としてモデルとトークナイザ、形態素解析器を初期化
bert_model_name = "cl-tohoku/bert-base-japanese-v3"


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
    テキストを形態素解析し、単語と品詞情報、読み情報を返す（MeCabを使用）
    """
    if mecab_tagger is None:
        logger.warning("MeCab形態素解析器が無効なため、形態素解析をスキップします")
        return []

    raw_mecab_output = mecab_tagger.parse(text)
    logger.info(f"MeCab生出力: {raw_mecab_output}")

    words = []
    temp_words = []  # 一時的な形態素情報を保持
    node = mecab_tagger.parseToNode(text)
    position = 0
    char_position = 0

    while node:
        if node.surface:
            surface = node.surface
            feature = node.feature.split(",")
            pos = feature[0] if len(feature) > 0 else "UNK"
            reading = feature[6] if len(feature) >= 8 else ""

            current_word = {
                "surface": surface,
                "pos": pos,
                "position": position,
                "start": text.find(surface, char_position),
                "end": text.find(surface, char_position) + len(surface),
                "reading": reading,
                "feature": feature,
            }

            # 接尾辞との結合処理
            if pos == "接尾辞" and temp_words:
                # 直前の単語と結合
                prev_word = temp_words[-1]
                combined_word = {
                    "surface": prev_word["surface"] + surface,
                    "pos": prev_word["pos"],  # 元の品詞を保持
                    "position": prev_word["position"],
                    "start": prev_word["start"],
                    "end": current_word["end"],
                    "reading": (
                        (prev_word["reading"] + reading)
                        if prev_word["reading"] and reading
                        else ""
                    ),
                    "feature": prev_word["feature"],  # 元の品詞情報を保持
                }
                temp_words[-1] = combined_word
            else:
                temp_words.append(current_word)
                position += 1

            char_position = current_word["end"]

        node = node.next

    # 結合された形態素情報を最終的なリストに追加
    words = temp_words

    return words


def get_pronunciation(text, keep_unknown=False):
    """
    テキストの発音をカタカナで取得する関数
    例：「今日はよく寝ました」→「キョウワヨクネマシタ」

    Parameters:
    - text: 変換するテキスト
    - keep_unknown: 読みが不明な文字をそのまま残すかどうか
    """
    # MeCabを使用して形態素解析
    words_info = analyze_morphology(text)

    # 発音の結果を構築
    pronunciation = ""

    for word_info in words_info:
        surface = word_info["surface"]
        reading = word_info.get("reading", "")

    # 区切り文字や記号を削除（keep_unknownがTrueの場合は保持）
    if not keep_unknown:
        table = str.maketrans("", "", string.punctuation + "「」、。・")
        pronunciation = pronunciation.translate(table)

    # 最終結果のログ出力
    logger.info(f"テキスト '{text}' の発音結果: {pronunciation}")

    return pronunciation


def is_kana(char):
    """
    文字がひらがなまたはカタカナかどうかを判定する関数
    """
    return (
        "\u3040" <= char <= "\u309f"  # ひらがな
        or "\u30a0" <= char <= "\u30ff"  # カタカナ
    )


def format_text(text):
    """
    記号を削除する関数
    """
    text = unicodedata.normalize("NFKC", text)  # 全角記号をざっくり半角へ置換
    table = str.maketrans("", "", string.punctuation + "「」、。・")
    text = text.translate(table)
    return text


def check_difficult_sounds(word, difficult_sounds, reading=None):
    """
    単語が苦手な音で始まるか、苦手な音を含むかを確認

    Parameters:
    - word: 確認する単語
    - difficult_sounds: 苦手な音のリスト (例: ['し', 'は', 'き'])
    - reading: 単語の読み（形態素解析から取得）

    Returns:
    - (boolean, float): 苦手かどうかのフラグと、難易度スコア
    """
    if not word or not difficult_sounds:
        return False, 0.0

    # 読みが存在する場合
    if reading:
        # 単語の先頭が苦手な音から始まるか（カタカナに変換してから比較
        for sound in difficult_sounds:
            katakana_sound = jaconv.hira2kata(sound)  # ひらがなをカタカナに変換
            if reading.startswith(katakana_sound):
                logger.info(
                    f"苦手な音 '{sound}'(カタカナ: {katakana_sound}) が読み '{reading}' の先頭にマッチしました"
                )
                return True, 0.9

    return False, 0.0


def get_difficult_words(text, difficulty_threshold=0.5, difficult_sounds=None):
    """
    テキスト内の難しい単語を特定する
    difficulty_threshold: 難しさの閾値
    difficult_sounds: ユーザーが苦手とする音のリスト (例: ['し', 'は', 'き'])
    """
    words = analyze_morphology(text)
    difficult_words = []

    # ハイライトから除外する品詞リスト
    exclude_pos = ["助詞", "助動詞", "接尾辞"]

    for word_info in words:
        word = word_info["surface"]
        pos = word_info["pos"]  # 　品詞
        position = word_info["position"]
        start = word_info.get("start", 0)
        end = word_info.get("end", 0)
        reading = word_info.get("reading", "")  # 読み情報を取得

        # 助詞、助動詞、接尾辞はスキップ
        if any(excluded in pos for excluded in exclude_pos):
            continue

        difficulty = 0.0
        reason = ""

        # 苦手な音を含むか確認
        if difficult_sounds:
            is_difficult, sound_difficulty = check_difficult_sounds(
                word, difficult_sounds, reading
            )
            if is_difficult:
                difficulty = max(difficulty, sound_difficulty)
                reason = "difficult_sound"

        # 閾値以上の難易度を持つ単語を追加
        if difficulty >= difficulty_threshold:
            difficult_words.append(
                {
                    "word": word,
                    "position": position,
                    "difficulty": difficulty,
                    "reason": reason,
                    "start": start,
                    "end": end,
                    "reading": reading,  # 読み情報も結果に含める
                    "pos": pos,  # 品詞情報も追加
                }
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
