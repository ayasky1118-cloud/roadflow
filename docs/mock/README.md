# 高速規制図作成システム クリックスルーモック（Phase 1）

交通規制図作成・資機材調達プラットフォームの画面遷移・UI確認用モックです。データは保存されず、リロードでリセットされます。

## 技術スタック

- Vue 3 + Vite + TypeScript
- Vue Router（Hash モード）
- plain CSS（看板アプリ `signage` と同様の設計）

## 起動方法

```bash
cd docs/mock
npm install
npm run dev
```

ブラウザで表示された URL（通常 `http://localhost:5173`）を開きます。

## 画面ルート

| パス | 画面 |
|------|------|
| `#/` | 発注受付（OrderCreate） |
| `#/customer` | 顧客登録（CustomerCreate） |
| `#/site` | 現場情報入力（SiteInfo） |
| `#/map` | 地図加工（MapEditor） |

## フロー

1. **発注受付** … 顧客選択モーダル → 発注情報入力 → 「次へ」で現場情報へ
2. **現場情報** … 必須項目入力 → 「次へ」で地図加工へ
3. **地図加工** … 左パネルでアイテム配置（カウント）→ BOM表示・CSVエクスポート → 「保存して完了」

## CSS構成

- `src/assets/styles/common.css` … ブランドカラー・リセット
- `src/assets/styles/shared.css` … モーダル・ボタン・フォーム共通
- `src/assets/styles/order.css` / `customer.css` / `site.css` / `map.css` … 画面別

## ビルド

```bash
npm run build
```

`dist/` に静的ファイルが出力されます。
