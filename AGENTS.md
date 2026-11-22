# AGENTS.md - Google Antigravity / AI エージェント共通開発ルール

本プロジェクト（`ai-travel-planner` / SDD Progress Tracker & Portfolio）は **仕様駆動開発（SDD: Spec-Driven Development）** で開発・運用されます。
Google Antigravity・Claude Code・Gemini を含むすべての AI エージェントは、設計・実装・テスト・デプロイを行う際、以下のルールと `docs/` 配下の仕様書群を唯一の情報源（Single Source of Truth）として厳守してください。

## 1. 参照すべき仕様書・規約
- **マスターディレクティブ**: [`docs/CLAUDE-v5.md`](./docs/CLAUDE-v5.md)（既存の [`CLAUDE.md`](./CLAUDE.md) と同一方針）
- **要件定義**: [`docs/01_Requirements/user_stories.md`](./docs/01_Requirements/user_stories.md), [`docs/01_Requirements/screen_spec.md`](./docs/01_Requirements/screen_spec.md)
- **アーキテクチャ・DB**: [`docs/02_Architecture/system_design.md`](./docs/02_Architecture/system_design.md), [`docs/02_Architecture/database.md`](./docs/02_Architecture/database.md)
- **技術制約・コーディング規約**: [`docs/03_Rules/tech_stack.md`](./docs/03_Rules/tech_stack.md), [`docs/03_Rules/coding_rules.md`](./docs/03_Rules/coding_rules.md)
- **デザイン・未決定事項**: [`docs/design/ui_design.md`](./docs/design/ui_design.md), [`docs/04_Discussions/tbd_list.md`](./docs/04_Discussions/tbd_list.md)

## 2. 実装・セキュリティの厳守事項
1. **外部ライブラリとランタイム制約**: `docs/03_Rules/tech_stack.md` に定義されていないライブラリ（Redux, axios, Express 等）や Node.js 固有モジュール（`fs`, `path`, `crypto` 等）を Cloudflare Workers（`apps/api`）へ導入しないこと。暗号処理は必ず標準の Web Crypto API（`crypto.subtle`）を使用する。
2. **型安全性**: TypeScript `strict: true`、`any` 型の全面禁止を遵守し、`@trip-splitter/shared` と Hono RPC でエンドツーエンドの型安全性を維持する。
3. **モジュール分割**: 1ファイル200行以内を目安に UI コンポーネント・認証ロジック・API ルートを分離する。
4. **公開・非公開の境界**:
   - ポートフォリオ画面（`PortfolioView`）は未ログインでも公開閲覧可能とする。
   - SDD 進捗トラッカーおよび `/api/auth/*` 以外のすべての `/api/*` エンドポイントはログイン必須（未認証時は `401 Unauthorized`）とする。
5. **秘密情報の保護**: パスワード・API トークン・シークレット（`ADMIN_PASSWORD`, `SESSION_SECRET`, `CLOUDFLARE_API_TOKEN`）をコードや Git 履歴に絶対にコミットしないこと。本番秘密情報は必ず `wrangler secret put` で登録する。
6. **未追跡リサーチファイルの除外**: `docs/Daily_Research/` 配下のデイリー調査ノートは開発コミットに巻き込まないこと。

## 3. コミット・コミュニケーション規約
- 応答・計画・コード内コメントはすべて **日本語** で記述する。
- Git コミットは Conventional Commits（`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`）に従い、**メッセージ本文は必ず日本語** にする（例: `feat(auth): Cookie署名ベースの認証APIとログイン画面を追加`）。

## 4. 主要コマンド
- 依存反映: `pnpm install`
- 型チェック: `pnpm typecheck`
- 全体ビルド: `pnpm build`
- 無料枠デプロイ（Web ビルド + Workers デプロイ）: `pnpm deploy:free`
- Cloudflare デプロイ時の `code: 10000` 回避: Account API Token ではなく、Cloudflare ダッシュボード右上の **My Profile > API Tokens**（`Edit Cloudflare Workers` テンプレート）で発行したユーザー API トークンを `.env` に設定する。
