---
tags:
  - rules/sdd
  - claude-v5
  - antigravity
---

# CLAUDE-v5: AI Spec-Driven Development (SDD) Master Directive

> [!danger] 最重要原則（Single Source of Truth）
> 本プロジェクトは **仕様駆動開発（SDD: Spec-Driven Development）** で運用される。コードの実装・変更を行う前に、必ず `docs/` 配下の仕様書を参照し、仕様書に定義されたアーキテクチャ・型制約・ビジネスロジックに厳密に従うこと。

## 1. 仕様書リファレンスマップ (`docs/`)
- **要件定義 (`docs/01_Requirements/` / `docs/01_Reqirements/`)**
  - `user_stories.md`: ペルソナ定義、エピック別ユーザーストーリー（US-101〜US-402）、受入条件（AC）
  - `screen_spec.md`: 画面遷移図（SCR-01〜SCR-07）、Expo Router パス対応表、各画面のUI/状態仕様
- **アーキテクチャ設計 (`docs/02_Architecture/`)**
  - `system_design.md`: Cloudflare Edge（Workers, D1, R2, Analytics Engine）構成図、シーケンス図、`wrangler.jsonc` 規定
  - `database.md`: Cloudflare D1（SQLite互換）ER図、6テーブル（`users`, `trips`, `trip_participants`, `expenses`, `expense_splits`, `settlements`）のDDL・インデックス定義
- **開発ルール・技術制約 (`docs/03_Rules/`)**
  - `tech_stack.md`: pnpm + Turborepo モノレポ構成、採用パッケージとバージョン制約、禁止ライブラリ規定
  - `coding_rules.md`: ディレクトリ構成、命名規則（kebab-case / PascalCase / camelCase / snake_case）、Hono RPC・Zodバリデーション実装規約、統一エラーJSON構造
- **デザイン・未決定事項 (`docs/design/`, `docs/04_Discussions/`)**
  - `design/ui_design.md`: UIデザイン原則、カラーパレット、Atomic Design コンポーネント設計
  - `04_Discussions/tbd_list.md`: 未決定事項（TBD-01〜05）と解決済み技術レビューログ

## 2. 厳守すべきコーディング・アーキテクチャ制約
1. **ハルシネーションの禁止**: `tech_stack.md` に定義されていない外部状態管理ライブラリ（Redux, MobX, Recoil等）やHTTPクライアント（axios等）、サーバーフレームワーク（Express, Fastify等）を勝手に導入しないこと。
2. **完全な型安全性 (`strict: true`)**: `any` 型の使用は一切禁止。フロントエンド（`apps/app`）とバックエンド（`apps/api`）間の通信は必ず `hono/client`（Hono RPC）と `@trip-splitter/shared`（Zodスキーマ）を介して型安全に行うこと。
3. **エッジランタイム制約**: `apps/api`（Cloudflare Workers）では `fs`, `path`, `child_process` 等のNode.js固有モジュールを使用しないこと。D1操作は必ず Prepared Statement（`c.env.DB.prepare(...)`）を使用し、生のSQL文字列結合は行わないこと。
4. **AI API コスト最適化**: レシート画像は即時同期解析せず、R2保存後に `ai_analysis_status = 'pending'` としてD1へ記録し、Scheduled Worker（Cron Triggers）でGemini 1.5 Flashによる非同期バッチ解析を行うこと。
5. **単一責任の原則と言語規約**: 1ファイルあたり200行以内を目安とし、UIとロジックを分離すること。応答、解説、コード内コメントはすべて日本語で記述し、コミットメッセージは Conventional Commits（`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`）に従うこと。
6. **TBD項目の独断実装禁止**: `04_Discussions/tbd_list.md` で `Open` となっている項目は独断で外部サービスを導入せず、仕様確定後にステータスを `Resolved` に更新してから実装すること。
