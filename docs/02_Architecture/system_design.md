---
title: System Architecture & Infrastructure Design
type: architecture
tags:
  - architecture/system
  - cloudflare/workers
  - cloudflare/r2
  - cloudflare/d1
  - gemini
created: 2026-09-15
status: active
related:
  - "[[database]]"
  - "[[tech_stack]]"
  - "[[coding_rules]]"
  - "[[user_stories]]"
  - "[[screen_spec]]"
---

# System Architecture & Infrastructure Specification

> [!info] 概要
> 本ドキュメントは、**Trip Splitter** アプリケーションのシステム全体像、Cloudflare エコシステムを中心としたインフラ構成、データフロー、および外部 API (Gemini 1.5 Flash) との連携アーキテクチャを定義します。
> AI エージェント (Antigravity) がインフラ連携コードや Workers の Bindings 構成を破綻なく実装できるように最適化されています。

---

## 1. 全体システム構成図 (Architecture Diagram)

```mermaid
graph TD
    subgraph Client ["Client Layer (Expo / React Native)"]
        iOS["iOS App"]
        Android["Android App"]
        Web["Web App (Expo Web / Pages)"]
    end

    subgraph Edge ["Cloudflare Edge Network"]
        Workers["Cloudflare Workers\n(Hono API Framework)"]
        CronWorker["Scheduled Worker\n(Daily Batch / Cron)"]
        Pages["Cloudflare Pages\n(Web Static Assets)"]
    end

    subgraph Storage ["Cloudflare Native Storage"]
        D1[("Cloudflare D1\n(Relational DB)")]
        R2[("Cloudflare R2\n(Object Storage / Images)")]
        Analytics["Cloudflare Analytics Engine\n(Event Logs)"]
    end

    subgraph AI ["External AI Services"]
        Gemini["Google AI Studio\n(Gemini 1.5 Flash API)"]
    end

    %% Client Interactions
    Client -->|HTTPS / Hono RPC| Workers
    Client -->|Static Assets| Pages
    Client -->|Direct Upload / Presigned URL| R2

    %% Worker Interactions
    Workers -->|SQL / D1 Binding| D1
    Workers -->|S3 Client / R2 Binding| R2
    Workers -->|Write Log Events| Analytics
    
    %% Cron Worker Interactions
    CronWorker -->|Fetch Pending Receipts| D1
    CronWorker -->|Read Receipt Images| R2
    CronWorker -->|Multimodal API Call| Gemini
    CronWorker -->|Update Analysis Summary| D1

    classDef client fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    classDef edge fill:#fff3e0,stroke:#f57c00,stroke-width:2px;
    classDef storage fill:#e8f5e9,stroke:#388e3c,stroke-width:2px;
    classDef ai fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;

    class iOS,Android,Web client;
    class Workers,CronWorker,Pages edge;
    class D1,R2,Analytics storage;
    class Gemini ai;
```

---

## 2. インフラコンポーネント詳細 & Cloudflare Bindings

> [!note] Bindings 構成 (`wrangler.jsonc` 規定)
> Cloudflare Workers では環境変数の代わりに Bindings を通じて各リソースへ極めて低いレイテンシでアクセスします。

| コンポーネント | 採用技術 / サービス | Binding 名 (`env`) | 役割・用途 |
| :--- | :--- | :--- | :--- |
| **API Server** | Cloudflare Workers (Hono) | - | バックエンド API。認証、CRUD、精算計算ロジックを提供 |
| **Database** | Cloudflare D1 (SQLite) | `DB` | ユーザー、トリップ、立替、精算データの永続化 (`[[database]]`) |
| **Object Storage** | Cloudflare R2 | `BUCKET` | プロフィール画像、トリップカバー、レシート画像の保存 |
| **Analytics Log** | Cloudflare Analytics Engine | `ANALYTICS` | ユーザー行動ログ、API パフォーマンス指標の非同期記録 |
| **Batch Job** | Scheduled Worker (Cron) | - | 夜間・定期実行によるレシート AI 解析タスク処理 |
| **AI Processing** | Gemini 1.5 Flash (Google AI) | `GEMINI_API_KEY` | レシート画像からの金額・店舗名抽出およびカテゴリ自動推定 |

---

## 3. 重要データフロー (Sequence Diagrams)

### 3.1 レシートアップロード & Gemini 1.5 Flash 非同期解析フロー

```mermaid
sequenceDiagram
    autonumber
    actor User as ユーザー (Expo)
    participant Worker as Hono API (Workers)
    participant R2 as Cloudflare R2
    participant D1 as Cloudflare D1
    participant Cron as Scheduled Worker
    participant Gemini as Gemini 1.5 Flash

    %% 支出登録
    User->>Worker: 支出登録 & レシート送信 (`POST /expenses`)
    Worker->>R2: レシート画像をアップロード (`receipts/{id}.jpg`)
    R2-->>Worker: R2 オブジェクト URL 返却
    Worker->>D1: 支出レコード作成 (`ai_analysis_status: 'pending'`)
    Worker-->>User: 登録完了レスポンス (即時表示)

    %% バッチ処理 (Cron)
    Note over Cron, Gemini: 定期バッチ実行 (Cron Trigger)
    Cron->>D1: 未解析レコード取得 (`status = 'pending'`)
    D1-->>Cron: 対象支出リスト返却
    
    loop 各未解析レシート
        Cron->>R2: 画像バイナリ取得
        R2-->>Cron: 画像データ
        Cron->>Gemini: マルチモーダル解析リクエスト (画像 + Prompt)
        Gemini-->>Cron: 解析結果 JSON (店舗名, 合計金額, 推定カテゴリ)
        Cron->>D1: 解析結果更新 (`ai_analysis_status: 'completed'`, `ai_summary: JSON`)
    end
```

### 3.2 イベントログ送信フロー (Analytics Engine)

```mermaid
sequenceDiagram
    autonumber
    actor User as クライアント (Expo)
    participant Worker as Hono API
    participant AE as Analytics Engine
    
    User->>Worker: アクション実行 (例: 精算完了ボタン押下)
    Worker->>AE: `ANALYTICS.writeDataPoint()` (非同期・非ブロック)
    Note over Worker, AE: DB (D1) トランザクションを阻害せずにイベント記録
    Worker-->>User: レスポンス返却
```

---

## 4. 環境変数 & Cloudflare Bindings 定義 (`wrangler.jsonc`)

AI エージェント (Antigravity) は以下の設定構造に従って `wrangler.jsonc` を生成すること。

```json
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "trip-splitter-api",
  "main": "src/index.ts",
  "compatibility_date": "2026-09-01",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "trip-splitter-db",
      "database_id": "YOUR_D1_DATABASE_ID"
    }
  ],
  "r2_buckets": [
    {
      "binding": "BUCKET",
      "bucket_name": "trip-splitter-assets"
    }
  ],
  "analytics_engine_datasets": [
    {
      "binding": "ANALYTICS",
      "dataset": "trip_splitter_logs"
    }
  ],
  "triggers": {
    "crons": ["0 3 * * *"] 
  }
}
```

---

## 5. セキュリティ & 通信設計規約

> [!warning] Antigravity 実装要件
> 1. **R2 アクセス制御**: 画像の直接パブリック公開は避け、Cloudflare Worker 経由またはカスタムドメイン (`assets.trip-splitter.app`) + Cache API を利用すること。
> 2. **Gemini API Key 秘匿**: API キーはクライアントアプリ（Expo）に埋め込まず、必ず Worker 側の環境変数 (`env.GEMINI_API_KEY`) として管理すること。
> 3. **D1 SQL インジェクション対策**: 生の SQL 文字列結合は一切禁止。Hono + D1 Prepared Statement (`c.env.DB.prepare(...)`) または Drizzle ORM を使用すること。
