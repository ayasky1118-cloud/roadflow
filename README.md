# 交通規制図作成システム

交通規制図作成・資機材調達プラットフォーム。

## リポジトリ構成

| パス | 内容 |
|------|------|
| `docs/mock/` | Phase 1 クリックスルーモック（Vue 3 + Vite） |

## モックの起動

```bash
cd docs/mock
npm install
npm run dev
```

詳細は [docs/mock/README.md](docs/mock/README.md) を参照してください。

## GitHub へ push（初回のみ）

ターミナルで以下を実行してください。

```bash
cd /Users/hosokawa/project/roadflow

# 1. GitHub CLI にログイン（ブラウザで認証）
gh auth login

# 2. リポジトリ作成 & push（アカウント: ayasky1118-cloud）
gh repo create roadflow --public --source=. --remote=origin --push
```

手動でリポジトリを作った場合:

```bash
git remote add origin https://github.com/ayasky1118-cloud/roadflow.git
git push -u origin main
```
