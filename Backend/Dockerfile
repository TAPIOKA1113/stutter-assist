FROM python:3.9-slim

# 必要なパッケージをインストール
RUN apt-get update && apt-get install -y \
  mecab \
  libmecab-dev \
  mecab-ipadic-utf8 \
  git \
  build-essential \
  swig \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# 作業ディレクトリの設定
WORKDIR /app

# 環境変数の設定（MeCabの設定ファイルのパスを明示的に指定）
ENV MECABRC=/etc/mecabrc
ENV PYTHONIOENCODING=utf-8
ENV LANG=C.UTF-8

# 必要なファイルをコピー
COPY requirements.txt .

# Pythonパッケージのインストール
RUN pip install --no-cache-dir -r requirements.txt && \
  pip install --no-cache-dir unidic-lite

# アプリケーションコードをコピー
COPY . .

# ポートの公開
EXPOSE 8000

# アプリケーションの実行
CMD ["python", "run.py"] 