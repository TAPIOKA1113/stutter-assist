import requests
import json

BASE_URL = "http://localhost:8000"


def test_api_root():
    """ルートエンドポイントのテスト"""
    response = requests.get(f"{BASE_URL}/")
    data = response.json()
    print("Root endpoint response:", data)
    assert response.status_code == 200
    assert "message" in data
    assert "status" in data
    assert data["status"] == "ok"


def test_old_alternatives():
    """従来の代替案APIのテスト"""
    word = "吃音症"
    response = requests.get(f"{BASE_URL}/alternatives/{word}")
    data = response.json()
    print(f"Old alternatives for '{word}':", data)
    assert response.status_code == 200
    assert "alternatives" in data
    assert isinstance(data["alternatives"], list)


def test_analyze_text():
    """テキスト分析APIのテスト"""
    payload = {
        "text": "吃音症は何百万人もの人々の個人的および職業的生活に影響を与える言語障害です。",
        "difficulty_threshold": 0.5,
        "user_difficult_words": ["吃音症", "言語障害"],
    }
    response = requests.post(f"{BASE_URL}/analyze", json=payload)
    data = response.json()
    print("Text analysis response:", json.dumps(data, indent=2, ensure_ascii=False))
    assert response.status_code == 200
    assert "difficult_words" in data
    assert isinstance(data["difficult_words"], list)


def test_smart_alternatives():
    """BERTモデルを使用した代替案生成APIのテスト（モックなし）"""
    payload = {
        "text": "吃音症は何百万人もの人々の個人的および職業的生活に影響を与える言語障害です。",
        "target_word": "言語障害",
        "method": "mlm",  # モックデータを使用しないので埋め込みは使わない
    }
    response = requests.post(f"{BASE_URL}/smart-alternatives", json=payload)
    data = response.json()
    print(
        "Smart alternatives response:", json.dumps(data, indent=2, ensure_ascii=False)
    )
    assert response.status_code == 200
    assert "word" in data
    assert data["word"] == payload["target_word"]
    assert "alternatives" in data
    assert isinstance(data["alternatives"], list)

    # 代替案のテスト（実際のBERTモデルの出力によるため、結果の内容は保証できないが、
    # score, original_score, pronunciation_difficultyフィールドがあることを確認）
    if data["alternatives"]:
        assert "word" in data["alternatives"][0]
        assert "score" in data["alternatives"][0]
        assert "original_score" in data["alternatives"][0]
        assert "pronunciation_difficulty" in data["alternatives"][0]


def test_realtime_analysis():
    """リアルタイムテキスト分析APIのテスト（モックなし）"""
    payload = {
        "text": "吃音症は何百万人もの人々の個人的および職業的生活に影響を与える言語障害です。",
        "difficulty_threshold": 0.5,
    }
    response = requests.post(f"{BASE_URL}/analyze-realtime", json=payload)
    data = response.json()
    print("Realtime analysis response:", json.dumps(data, indent=2, ensure_ascii=False))
    assert response.status_code == 200
    assert "text" in data
    assert data["text"] == payload["text"]
    assert "words" in data
    assert isinstance(data["words"], list)

    # 検出された難しい単語と代替案のテスト
    if data["words"]:
        word_info = data["words"][0]
        assert "word" in word_info
        assert "position" in word_info
        assert "difficulty" in word_info
        assert "alternatives" in word_info
        assert isinstance(word_info["alternatives"], list)


if __name__ == "__main__":
    print("=== Testing Fluent Assist API ===")

    try:
        # 各テスト関数を実行
        print("\n>>> Testing root endpoint:")
        test_api_root()

        print("\n>>> Testing old alternatives endpoint:")
        test_old_alternatives()

        print("\n>>> Testing text analysis endpoint:")
        test_analyze_text()

        print("\n>>> Testing smart alternatives endpoint:")
        test_smart_alternatives()

        print("\n>>> Testing realtime analysis endpoint:")
        test_realtime_analysis()

        print("\n=== All tests passed! ===")
    except Exception as e:
        print(f"\n!!! Test failed: {str(e)}")
        raise
