---
tags:
  - sdd/spec
  - portfolio/web
---

---
title: Engineer Portfolio Web App Specification
type: specification
tags:
  - sdd/spec
  - portfolio/web
  - cloudflare/workers-assets
created: 2026-11-18
status: active
related:
  - "[[sdd-tracker/SPEC]]"
  - "[[04_Discussions/portfolio_history]]"
---

# エンジニア・ポートフォリオ画面 仕様書

## 1. 概要・目的
仕様駆動開発（SDD）の実践プロセス・技術選定の意思決定（ADR）・構築したプロダクト（**SDD Progress Tracker** / **Trip Splitter**）を、採用担当者や外部の閲覧者がスマホ・PC のブラウザから直感的に閲覧できる Web ポートフォリオ画面を定義する。

## 2. 画面要件 & UI 構成
`apps/web`（React + Vite SPA）の上部ナビゲーションで以下の 2 ビューをシームレスに切り替えられる構成とする。
- **View 1: ポートフォリオ（`/portfolio` 相当・初期表示またはタブ切替）**
  1. **プロフィール・サマリーヘッダー**:
     - 表示項目は `apps/web/src/data/portfolio-profile.ts` で一元管理し、氏名・肩書き・自己紹介・SNS/GitHub リンクは未設定時にクリーンなロールラベルで表示する（架空情報の埋め込み禁止）。
  2. **技術スタック・スキルマトリクス**:
     - TypeScript (`strict: true`) / React (Vite) / Hono v4 / Cloudflare Workers・D1・R2 / Model Context Protocol (MCP) / Gemini API & ローカル LLM（LM Studio・Ollama）をバッジ・カード形式で整理。
  3. **制作プロダクト & アーキテクチャ意思決定（ADR）ショーケース**:
     - **Project 1: SDD Progress Tracker（進行中・Web アプリ + Remote MCP）**
       - Obsidian `docs/` 自動同期、ハイブリッド LLM 仕様監査、`/api/sdd/mcp` リモート MCP サーバー連携。
     - **Project 2: Trip Splitter（Phase 1 完了・`archive/trip-splitter-v1`）**
       - Expo + Hono RPC によるモバイルプロトタイプ構築から、公開コスト最適化（$0）と招待 UX 向上を目的とした Web 移行の意思決定（ADR-001）を明記。
  4. **スマホ対応（レスポンシブ設計）**:
     - モバイル端末（幅 375px〜）でもカードが縦積みになり、横スクロール崩れなく閲覧可能であること。
- **View 2: SDD 進捗トラッカー（実働デモ画面）**
  - 既存の Obsidian `docs/` 自動同期テーブル & ハイブリッド AI 仕様監査パネルをそのままライブデモとして操作可能にする。

## 3. 無料枠デプロイ構成（Cloudflare Workers Static Assets）
- Cloudflare Workers の Static Assets 機能により、**1つの Worker（無料枠）でフロントエンド（`apps/web/dist`）とバックエンド API（`apps/api`）を一括配信**する（CORS 問題・複数サービス管理を排除し、コスト $0 で外からアクセス可能にする）。
