#!/usr/bin/env bash
# ayasky1118-cloud アカウントに roadflow リポジトリを作成して push する
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) が必要です: brew install gh"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub にログインしてください:"
  gh auth login
fi

echo "リポジトリを作成して push します..."
gh repo create roadflow \
  --public \
  --source=. \
  --remote=origin \
  --description "交通規制図作成・資機材調達プラットフォーム（RoadFlow）" \
  --push

echo "完了: https://github.com/ayasky1118-cloud/roadflow"
