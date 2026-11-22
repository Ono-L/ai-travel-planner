---
name: cloudflare-deploy-verify
description: ai-travel-planner の依存反映・型チェック・ビルド・Cloudflare Workers デプロイおよび /browser による認証・公開画面の動作確認を一貫して実行するスキル。
---

# Cloudflare デプロイ & 動作確認手順

このスキルは、ポートフォリオ公開および SDD トラッカー認証ロックを壊さずに Cloudflare Workers へ安全にデプロイし、動作検証まで完了させるための標準手順です。

## 1. ビルド前チェック
プロジェクトルートで以下を順に実行し、すべてエラー 0 で通ることを確認する。
1. `pnpm install`（Wrangler v4 を含む依存の反映）
2. `pnpm typecheck`
3. `pnpm build`

## 2. Cloudflare 認証・Secrets 確認（実行前にユーザーへ確認）
1. `.env` の `CLOUDFLARE_API_TOKEN` が **My Profile > API Tokens**（`Edit Cloudflare Workers` テンプレート）のユーザー API トークンであることを確認する（Account API Token のままだと `Authentication error [code: 10000]` になる）。
2. `apps/api` で以下の Secrets が登録済みか確認し、未登録であればユーザーに実行を案内する（平文の値をコードやログに残さないこと）：
   - `pnpm --filter @trip-splitter/api exec wrangler secret put ADMIN_PASSWORD`
   - `pnpm --filter @trip-splitter/api exec wrangler secret put SESSION_SECRET`

## 3. デプロイ実行
ルートで `.env` を読み込んでデプロイを実行する：
```bash
set -a && source .env && set +a && pnpm deploy:free
```
出力された公開 URL（`https://trip-splitter-api.<サブドメイン>.workers.dev`）を記録する。

## 4. `/browser` による動作確認チェックリスト
デプロイされた公開 URL を `/browser` で開き、以下の4点をすべて検証する：
1. **ポートフォリオ公開**: 未ログイン状態でポートフォリオ画面が表示され、コンソールエラーがないこと。
2. **API 401 ブロック**: 未ログイン状態で `GET /api/auth/me` が `{ authenticated: false }`、保護された `/api/sdd/tasks` 等が `401` を返すこと。
3. **トラッカーのログインロック**: 「SDD 進捗トラッカー」タブを開くとログインフォームが表示され、トラッカー本体が見えないこと。
4. **ログイン・ログアウト**: 正しいパスワードでログイン後にトラッカーが表示され、ログアウト操作で再びログイン画面へ戻ること。

## 5. コミット前チェック
- `git status` で `.env` や `docs/Daily_Research/` がステージに含まれていないことを確認する。
- コミットメッセージは Conventional Commits 形式＋日本語で記述する。
