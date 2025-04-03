#!/bin/bash

# 色の設定
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Fluent Assist Backend Docker環境構築${NC}"
echo -e "${GREEN}Dockerイメージのビルドを開始します...${NC}"

# Dockerイメージをビルド
docker-compose build

echo -e "${GREEN}Dockerコンテナを起動します...${NC}"

# Dockerコンテナを起動
docker-compose up -d

echo -e "${GREEN}セットアップが完了しました！${NC}"
echo -e "API: http://localhost:8000"
echo -e "API ドキュメント: http://localhost:8000/docs"

echo -e "${BLUE}ログを確認するには: ${GREEN}docker-compose logs -f${NC}"
echo -e "${BLUE}停止するには: ${GREEN}docker-compose down${NC}" 