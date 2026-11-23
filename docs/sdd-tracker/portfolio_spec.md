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
updated: 2026-11-23
status: active
related:
  - "[[sdd-tracker/SPEC]]"
  - "[[04_Discussions/portfolio_history]]"
---

# エンジニア・ポートフォリオ画面 仕様書

## 1. 概要・目的
就職活動における採用担当者・面接官向けに、仕様駆動開発（SDD）の実践プロセス・技術選定の意思決定（ADR）・ローカルワークスペース配下で構築した全制作プロダクト（**SDD Progress Tracker & Remote MCP** / **gbf-beginner-bot** / **epaper-dashboard** / **Trip Splitter**）を、スマホ・PC のブラウザから直感的に閲覧できる Web ポートフォリオ画面を定義する。

## 2. 画面要件 & UI 構成
`apps/web`（React + Vite SPA）の上部ナビゲーションで以下の 2 ビューをシームレスに切り替えられる構成とする。
- **View 1: ポートフォリオ（`/portfolio` 相当・初期表示）**
  1. **プロフィール・ヒーロー & サマリー指標**:
     - 表示項目は `apps/web/src/data/portfolio-profile.ts` で一元管理し、氏名・肩書き・自己紹介・SNS/GitHub リンクは未設定時にクリーンなプレースホルダーで表示する（架空情報の埋め込み禁止）。
     - 制作プロダクト数・主要技術・クラウド/AI・開発プロセスの 4 指標をカード表示する。
  2. **エンジニアとしての強み・開発スタンス**:
     - SDD & ADR、制約・コストを踏まえたエッジ／軽量設計、セキュリティ・テスト標準の 3 軸を採用担当者向けに要約する。
  3. **制作プロダクト & アーキテクチャ意思決定（ADR）ショーケース（カテゴリフィルタ付き）**:
     - **Project 1: SDD Progress Tracker & Remote MCP（`ai-travel-planner`・稼働中／ライブデモあり）**
       - Obsidian `docs/` 自動同期、ハイブリッド LLM 仕様監査、`/api/sdd/mcp` リモート MCP サーバー、Workers Static Assets 一括無料配信。
     - **Project 2: gbf-beginner-bot（`gbf-beginner-bot`・RAG 搭載 Discord Bot）**
       - 16 本の自前ナレッジ + `gemini-embedding-001`（768 次元 L2 正規化）+ Cloudflare Vectorize & D1、Ed25519 署名検証、`waitUntil()` 非同期 RAG 応答、Ephemeral デフォルト応答、Vitest 5 スイート。
     - **Project 3: epaper-dashboard（`epaper-dashboard`・Raspberry Pi 向け電子ペーパーダッシュボード）**
       - Python 3.12 / FastAPI / Pydantic v2 / Pillow 1bit モノクロ描画、ドライバ抽象化（`mock` / `waveshare`）、Open-Meteo 連携、通知 Webhook + `hmac.compare_digest` 認証、実出力プレビュー画像掲載。
     - **Project 4: Trip Splitter（`ai-travel-planner`・Phase 1 完了・`archive/trip-splitter-v1`）**
       - Expo + Hono RPC モノレポ検証から、公開コスト最適化（$0）と招待 UX 向上を目的とした Web 移行の意思決定（ADR-001）を明記。
  4. **技術スタック・スキルマトリクス & セキュリティ・品質設計サマリー**:
     - TypeScript / React / Hono / Cloudflare Workers・D1・Vectorize・R2 / Python・FastAPI・Pillow / Gemini API・RAG・MCP・Docker・Vitest/pytest を 4 カテゴリで整理。
     - 全プロジェクト共通の認証・署名検証、AI 安全性、型安全・テスト方針をまとめる。
  5. **スマホ対応（レスポンシブ設計）**:
     - モバイル端末（幅 375px〜）でもカードが縦積みになり、横スクロール崩れなく閲覧可能であること。
- **View 2: SDD 進捗トラッカー（実働デモ画面）**
  - セッション認証（`LoginGate`）を経由して、Obsidian `docs/` 自動同期テーブル・ハイブリッド AI 仕様監査・MCP Playground を操作可能にする。

## 3. 無料枠デプロイ構成（Cloudflare Workers Static Assets）
- Cloudflare Workers の Static Assets 機能により、**1つの Worker（無料枠）でフロントエンド（`apps/web/dist`）とバックエンド API（`apps/api`）を一括配信**する（CORS 問題・複数サービス管理を排除し、コスト $0 で外からアクセス可能にする）。
