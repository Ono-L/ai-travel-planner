# CLAUDE.md - AI Spec-Driven Development (SDD) Common Rules

本プロジェクトは **仕様駆動開発（SDD: Spec-Driven Development）** で開発・運用されます。
AI エージェント（Claude / Antigravity / Gemini）は、コードの設計・実装・変更・レビューを行う際、必ず以下のマスター仕様ディレクティブおよび `docs/` 配下の仕様書群を唯一の情報源（Single Source of Truth）として参照・厳守してください。

## 1. マスター仕様ディレクティブの参照
- **マスターディレクティブ**: [`docs/CLAUDE-v5.md`](./docs/CLAUDE-v5.md)

## 2. 仕様書ディレクトリ構成 (`docs/`)
- **要件定義 (`docs/01_Requirements/` / `docs/01_Reqirements/`)**
  - [`docs/01_Requirements/user_stories.md`](./docs/01_Requirements/user_stories.md): ペルソナ定義、エピック別ユーザーストーリー（US-101〜US-402）、受入条件（AC）
  - [`docs/01_Requirements/screen_spec.md`](./docs/01_Requirements/screen_spec.md): 画面遷移図（SCR-01〜SCR-07）、Expo Router パス対応表、各画面仕様
- **アーキテクチャ設計 (`docs/02_Architecture/`)**
  - [`docs/02_Architecture/system_design.md`](./docs/02_Architecture/system_design.md): Cloudflare Edge（Workers, D1, R2, Analytics Engine）全体構成、シーケンス図、`wrangler.jsonc` 規定
  - [`docs/02_Architecture/database.md`](./docs/02_Architecture/database.md): Cloudflare D1（SQLite互換）ER図・DDL定義
- **開発ルール・技術制約 (`docs/03_Rules/`)**
  - [`docs/03_Rules/tech_stack.md`](./docs/03_Rules/tech_stack.md): 採用技術スタック、バージョン制約、禁止ライブラリ規定
  - [`docs/03_Rules/coding_rules.md`](./docs/03_Rules/coding_rules.md): ディレクトリ構成、命名規則、Hono RPC・Zodバリデーション実装規約、統一エラーレスポンス構造
- **デザイン・未決定事項 (`docs/design/`, `docs/04_Discussions/`)**
  - [`docs/design/ui_design.md`](./docs/design/ui_design.md): UI/UXデザイン原則、カラーパレット、Atomic Design 構成
  - [`docs/04_Discussions/tbd_list.md`](./docs/04_Discussions/tbd_list.md): 未決定事項（TBD-01〜05）と技術決定ログ

## 3. 最重要ルール（抜粋）
1. **ハルシネーションの禁止**: `docs/03_Rules/tech_stack.md` に定義されていない外部ライブラリ（Redux, axios, Express 等）や Node.js 固有モジュール（`fs`, `path` 等）をバックエンド（Cloudflare Workers）に導入しないこと。
2. **`any` 型の全面禁止**: TypeScript `strict: true` を遵守し、`@trip-splitter/shared` の Zod スキーマと `hono/client`（Hono RPC）でエンドツーエンドの型安全性を維持すること。
3. **単一責任と言語規約**: 1ファイル200行以内を目安に UI とロジックを分離し、応答・解説・コード内コメントはすべて日本語で記述すること。
4. **コミット規約**: Conventional Commits（`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`）に従い、**メッセージ本文は必ず日本語で記述すること**（例: `feat(web): SDD進捗ボードの初期画面を追加`）。
