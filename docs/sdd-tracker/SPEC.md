---
tags:
  - sdd/spec
  - mcp/remote-server
  - ai/hybrid-llm
---

---
title: SDD Progress Tracker - Requirements & Architecture Specification
type: specification
tags:
  - sdd/spec
  - architecture/cloudflare
  - mcp/remote-server
  - ai/hybrid-llm
created: 2026-11-18
status: active
related:
  - "[[04_Discussions/portfolio_history]]"
  - "[[CLAUDE-v5]]"
---

# SDD Progress Tracker (個人開発・SDD 進捗 & AI レビュートラッカー) 仕様書

## 1. プロダクト概要 & 目的
仕様駆動開発（SDD: Spec-Driven Development）における **「仕様書ステータス」「機能別・担当者別の設計/実装レビュー進捗」「見積・実績工数（予実分析）」「AI 仕様整合性レビュー」** を一元管理する Web アプリケーション兼 リモート MCP サーバー。

## 2. コア機能要件 (User Stories)
- **US-01: 設計・実装タスク & レビュー進捗ボード**
  - 機能項目ごとに「設計ステータス（未着手/進行中/レビュー提出済/完了）」「実装ステータス」「見積工数(h) vs 実績工数(h)」「相談スタンプ・メモ」を一覧・カンバン表示し、ボトルネックを可視化する。
- **US-02: ハイブリッド AI 仕様レビュー（Gemini API / ローカル LLM 切替）**
  - 仕様書（Markdown）やタスク内容に対し、クラウドの **Gemini API（無料枠）** とローカルの **LM Studio / Ollama（OpenAI 互換エンドポイント）** を設定1つで切り替えて AI レビュー・タスク分解を実行する。
- **US-03: リモート MCP サーバー連携 (`/mcp`)**
  - Hono API 上に Streamable HTTP 対応の MCP エンドポイント（`POST /mcp`）を搭載し、Claude Desktop や Cursor / VS Code 内の AI エージェントから直接タスク一覧取得（`list_sdd_tasks`）や進捗更新（`update_task_status`）を実行可能にする。
- **US-04: デュアルモード認証（ローカル完結モード / 公開 JWT・Bearer 保護モード）**
  - 環境変数 `AUTH_MODE=none`（自分専用のローカル開発時は認証スキップ）と `AUTH_MODE=token`（外部公開時は Bearer Token / JWT 検証を強制）をシームレスに切り替えられる設計とする。

## 3. データベーススキーマ (`sdd_tasks` テーブル - Cloudflare D1)
```sql
CREATE TABLE IF NOT EXISTS sdd_tasks (
    id TEXT PRIMARY KEY,               -- 例: 'T-1001', 'SPEC-01'
    project_name TEXT NOT NULL,        -- プロジェクト名
    feature_name TEXT NOT NULL,        -- 機能・仕様名
    assignee TEXT NOT NULL,            -- 担当者名
    spec_doc_path TEXT,                -- Obsidian 仕様書パス (例: 'docs/sdd-tracker/SPEC.md')
    design_status TEXT NOT NULL CHECK(design_status IN ('todo', 'in_progress', 'review_submitted', 'approved')) DEFAULT 'todo',
    impl_status TEXT NOT NULL CHECK(impl_status IN ('todo', 'in_progress', 'review_submitted', 'completed', 'blocked')) DEFAULT 'todo',
    estimated_hours DECIMAL(5, 1) NOT NULL DEFAULT 0,
    actual_hours DECIMAL(5, 1) NOT NULL DEFAULT 0,
    blocker_tag TEXT,                  -- 相談スタンプ・タグ
    ai_review_summary TEXT,            -- Gemini / Local LLM による仕様レビュー結果
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
