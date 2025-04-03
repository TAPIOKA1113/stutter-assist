# Docker環境でのFluent Assist Backend実行方法

## 概要

この環境は、以下のコンポーネントで構成されています：

- **FastAPI**: RESTful APIフレームワーク
- **MeCab**: 日本語形態素解析エンジン
- **Transformers/BERT**: 文脈を考慮した代替案生成のための深層学習モデル
- **Docker**: 環境の統一化とポータビリティの確保

## 前提条件

以下のソフトウェアがインストールされていることを確認してください：

- Docker
- Docker Compose

## セットアップと起動

### 方法1: スクリプトを使用する（推奨）

提供されたスクリプトを使用して、環境を簡単にセットアップできます：

```bash
# スクリプトを実行可能にする（初回のみ）
chmod +x docker_build.sh

# スクリプトを実行
./docker_build.sh
```

### 方法2: 手動コマンド

スクリプトを使用せずに手動でコマンドを実行する場合：

```bash
# Dockerイメージをビルド
docker-compose build

# コンテナを起動
docker-compose up -d
```

## 使用方法

### APIアクセス

- API: http://localhost:8000
- Swagger UI（APIドキュメント）: http://localhost:8000/docs
- ReDoc（代替APIドキュメント）: http://localhost:8000/redoc

### ログの確認

コンテナのログを確認するには：

```bash
docker-compose logs -f
```

### コンテナの停止

環境を停止するには：

```bash
docker-compose down
```

データやキャッシュを含むボリュームも削除する場合：

```bash
docker-compose down -v
```

## 開発と変更

コードを変更した場合、FastAPIのホットリロード機能により自動的に変更が反映されます。
変更がすぐに反映されない場合は、コンテナを再起動してください：

```bash
docker-compose restart
```

## トラブルシューティング

### MeCab初期化エラー

もしMeCabの初期化に関するエラーが発生した場合：

1. ログを確認：
```bash
docker-compose logs -f
```

2. コンテナ内でMeCabの設定を確認：
```bash
docker-compose exec api bash
echo $MECABRC
ls -la /etc/mecabrc /usr/local/etc/mecabrc
```

### BERTモデルのダウンロード失敗

初回起動時には、BERTモデルのダウンロードが自動的に行われます。ネットワークの問題でダウンロードに失敗した場合：

1. ログを確認して問題を特定
2. コンテナ内で手動ダウンロードを試行：
```bash
docker-compose exec api python -c "from transformers import AutoModel; AutoModel.from_pretrained('cl-tohoku/bert-base-japanese-v2')"
```

### メモリ不足エラー

BERTモデルは比較的大きなメモリを消費します。メモリ不足エラーが発生した場合：

1. Docker設定でコンテナに割り当てるメモリを増やす
2. `docker-compose.yml`に`mem_limit`を追加してメモリ制限を設定 