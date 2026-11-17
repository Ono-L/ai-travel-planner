# Trip Splitter (`ai-travel-planner`)

**仕様駆動開発（SDD: Spec-Driven Development）** と **Cloudflare フルスタックエコシステム** で構築する、旅行立替・最適精算ルート算出プラットフォーム。

---

## 1. プロジェクト概要 & アーキテクチャ変遷（ポートフォリオ記録）

本リポジトリは、Obsidian Vault（`docs/`）で管理された仕様書を唯一の情報源（Single Source of Truth）として駆動するモノレポプロジェクトです。

- **Phase 1（モバイルプロトタイプ検証・完了）**:
  - DevContainer（Node.js 20 LTS / pnpm v9 / Turborepo v2）上に、`apps/app`（Expo / React Native）+ `apps/api`（Hono / Cloudflare Workers）+ `packages/shared`（Zod スキーマ）を構築し、Expo Tunnel 実機検証まで完了。
- **Phase 2（Web アプリケーションへのピボット・進行中）**:
  - アプリストア公開の固定費（Apple Developer Program 年額 $99 USD 等）の削減、および「旅行同行者がアプリをインストールせずに URL 共有だけで即座に参加できる UX（US-102）」を実現するため、クライアント層を **Cloudflare Pages（Web / PWA）** へ移行。
  - 意思決定の詳細と履歴は [`docs/04_Discussions/portfolio_history.md`](./docs/04_Discussions/portfolio_history.md) および [`docs/04_Discussions/tbd_list.md`](./docs/04_Discussions/tbd_list.md) に記録されています。

---

## 2. ディレクトリ構成

```text
ai-travel-planner/
├── .devcontainer/          # Docker / VS Code DevContainer 環境定義
├── CLAUDE.md               # AI エージェント共通ルール (docs/CLAUDE-v5.md 参照)
├── docs/                   # SDD 仕様書群 (Obsidian Vault)
│   ├── 01_Requirements/    # ユーザーストーリー・画面仕様書
│   ├── 02_Architecture/    # システム設計・Cloudflare D1 DBスキーマ
│   ├── 03_Rules/           # 技術スタック・コーディング規約
│   ├── 04_Discussions/     # ADR（技術意思決定記録）・ポートフォリオ履歴・TBD
│   └── design/             # UI/UX デザイン・カラーパレット定義
├── apps/
│   ├── api/                # バックエンド (Hono v4 / Cloudflare Workers / D1 / R2 / Gemini 1.5 Flash)
│   └── app/                # フロントエンド
└── packages/
    └── shared/             # フロント・バック共通 Zod スキーマ & TypeScript 型定義
```

---

## 3. 技術スタック

| レイヤー | 技術スタック |
| :--- | :--- |
| **Monorepo / 環境** | DevContainer (Docker) / Node.js 20 LTS / TypeScript v5 (`strict: true`) / pnpm v9 / Turborepo v2 |
| **Frontend** | React / TypeScript / TanStack Query v5 / Zustand v4 / Hono RPC Client (`hono/client`) |
| **Backend (`apps/api`)** | Hono v4 on Cloudflare Workers / Zod Validator (`@hono/zod-validator`) |
| **DB / Storage / AI** | Cloudflare D1 (SQLite) / Cloudflare R2 / Cloudflare Analytics Engine / Gemini 1.5 Flash (`@google/genai`) |
