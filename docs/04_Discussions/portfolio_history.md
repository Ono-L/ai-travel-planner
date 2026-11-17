---
tags:
  - portfolio/history
  - architecture/adr
---

---
title: Portfolio & Architecture Evolution Log
type: documentation
tags:
  - portfolio/history
  - architecture/adr
  - sdd
created: 2026-11-18
status: active
related:
  - "[[03_Rules/tech_stack]]"
  - "[[02_Architecture/system_design]]"
  - "[[04_Discussions/tbd_list]]"
---

# Project Evolution & Portfolio Log (開発履歴・意思決定記録)

本ドキュメントは、**Trip Splitter (`ai-travel-planner`)** における仕様駆動開発（SDD）の歩みと、技術的意思決定（ADR）をポートフォリオ用エビデンスとして記録したものです。

---

## Phase 1: DevContainer 基盤構築 & モバイル版プロトタイプ検証 (完了)

### 達成内容
1. **仕様駆動開発（SDD）ドキュメント体系の整備**
   - 要件定義（`user_stories.md`, `screen_spec.md`）、アーキテクチャ設計（`system_design.md`, `database.md`）、開発規約（`tech_stack.md`, `coding_rules.md`, `CLAUDE-v5.md`）を Obsidian Vault（`docs/`）として構造化。
2. **ホスト環境を汚染しない DevContainer 環境の構築**
   - Node.js 20 LTS、pnpm v9 Workspaces、Turborepo v2、Wrangler CLI、GitHub CLI (`gh`) を統合した Docker コンテナ環境（`.devcontainer/`）を構築。
3. **モノレポ初期実装と実機トンネル検証**
   - `packages/shared`（Zod スキーマ・共通型）、`apps/api`（Hono v4 + Cloudflare D1/R2/Analytics Engine）、`apps/app`（Expo Router v3）を実装し、Expo Tunnel 経由での疎通確認まで完了。

---

## Phase 2: Web アプリケーション（Cloudflare Pages）へのピボット

### 意思決定の理由（Why Web App?）
- **ストア公開コストの最適化**: iOS / Android ネイティブアプリのストア公開に伴うランニングコスト（Apple Developer Program 年額 $99 USD 等）を排し、Cloudflare エコシステム（Pages + Workers + D1 + R2）の無料枠内でフルスタック運用を実現するため。
- **ユーザー体験（UX）の向上**: 旅行メンバーへの招待時（US-102）にアプリインストールの手間をなくし、LINE 等で共有された URL を開くだけで即座に立替登録・精算確認ができる Web（PWA 対応）形態へ移行。

### Phase 2 機能拡充ログ (2026-11-18)
- **ポートフォリオ画面強化 (`apps/web/src/components/PortfolioView.tsx`)**: SDD パイプライン（Obsidian → Vite 同期 → ハイブリッド AI 監査 → Remote MCP & Edge）の視覚化と、OWASP LLM01 / Zod / AUTH_MODE のセキュリティ設計サマリーを追加。
- **SDD 進捗トラッカー強化 (`apps/web/src/App.tsx`, `McpPlayground.tsx`)**: タスク新規追加フォーム、実装ステータス動的変更、仕様書ステータスフィルタ、および `POST /api/sdd/mcp` ライブ疎通テストパネルを実装。
