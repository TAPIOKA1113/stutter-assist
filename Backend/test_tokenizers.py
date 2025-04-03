import MeCab
import fugashi
import os
import sys
from transformers import AutoTokenizer


def test_mecab():
    """MeCabの動作確認"""
    print("=== MeCab動作テスト ===")

    try:
        tagger = MeCab.Tagger()
        test_text = "吃音症は言語障害の一種です。"
        print(f"テスト文: {test_text}")

        print("\nMeCab解析結果:")
        print(tagger.parse(test_text))

        print("\n成功!")
        return True
    except Exception as e:
        print(f"MeCabエラー: {e}")
        return False


def test_fugashi():
    """Fugashiの動作確認"""
    print("\n=== Fugashi動作テスト ===")

    try:
        tagger = fugashi.Tagger()
        test_text = "吃音症は言語障害の一種です。"
        print(f"テスト文: {test_text}")

        print("\nFugashi解析結果:")
        words = tagger(test_text)
        for word in words:
            print(f"表層形: {word.surface}, 品詞: {word.feature.pos}")

        print("\n成功!")
        return True
    except Exception as e:
        print(f"Fugashiエラー: {e}")
        return False


def test_tokenizer():
    """BERTトークナイザの動作確認"""
    print("\n=== BERTトークナイザ動作テスト ===")

    try:
        tokenizer = AutoTokenizer.from_pretrained("cl-tohoku/bert-base-japanese-v2")
        test_text = "吃音症は言語障害の一種です。"
        print(f"テスト文: {test_text}")

        print("\nトークナイズ結果:")
        tokens = tokenizer.tokenize(test_text)
        print(tokens)

        print("\nエンコード結果:")
        encoding = tokenizer(test_text, return_tensors="pt")
        print(encoding)

        print("\n成功!")
        return True
    except Exception as e:
        print(f"トークナイザエラー: {e}")
        return False


def test_environment():
    """環境変数の表示"""
    print("\n=== 環境変数 ===")
    for key, value in sorted(os.environ.items()):
        if key in ["MECABRC", "LANG", "PYTHONIOENCODING"]:
            print(f"{key}: {value}")


if __name__ == "__main__":
    print("形態素解析とトークナイザのテスト")

    mecab_success = test_mecab()
    fugashi_success = test_fugashi()
    tokenizer_success = test_tokenizer()

    test_environment()

    print("\n=== テスト結果まとめ ===")
    print(f"MeCab: {'成功' if mecab_success else '失敗'}")
    print(f"Fugashi: {'成功' if fugashi_success else '失敗'}")
    print(f"BERTトークナイザ: {'成功' if tokenizer_success else '失敗'}")

    if mecab_success and fugashi_success and tokenizer_success:
        print("\nすべてのテストに成功しました！")
        sys.exit(0)
    else:
        print("\n一部のテストに失敗しました。")
        sys.exit(1)
