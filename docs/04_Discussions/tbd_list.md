---
title: TBD List & Discussions Log
type: discussion
tags:
  - discussion/tbd
  - decision-log
created: 2026-09-15
status: active
related:
  - "[[user_stories]]"
  - "[[system_design]]"
  - "[[database]]"
  - "[[coding_rules]]"
---

# 未決定事項 & 議論ログ (TBD List)

> [!info] 概要
> 本ドキュメントは、**Trip Splitter** の開発にあたり未確定となっている仕様、今後の検討課題（TBD: To Be Determined）、および Gemini Notebook での技術レビュー結果ログを記録するトラッキングメモです。
> AI エージェント（Antigravity）が未決定事項を勝手に確定仕様として実装しないよう防ぐ役割を果たします。

---

## 1. 優先検討事項 (High Priority TBDs)

### TBD-01: トリップへのユーザー招待方式
- **ステータス**: `Open`
- **概要**: 既存ユーザーおよび未登録ユーザーを「旅行（Trip）」グループに招待する具体的手順。
- **選択肢案**:
  1. **ディープリンク (URL)**: `https://tripsplitter.app/join?code=XXXX` 形式のリンクを発行（LINEやメールで共有）。
  2. **QRコード表示**: `SCR-02` グループ詳細画面でQRコードを表示し、対面で読み取り。
  3. **招待コード手動入力**: 6桁のアルファベット/数字コードを手動入力。
- **影響範囲**: `apps/app/app/trips/[id]/join.tsx`, `apps/api/src/routes/trips.ts`
- **次回アクション**: MVPではディープリンク + QRコード表示の併用案で決定するか検討。

### TBD-02: ユーザー認証プロバイダの選定
- **ステータス**: `Open`
- **概要**: 認証基盤として Clerk / Supabase Auth を採用するか、Cloudflare D1 + Custom JWT / Magic Link で自作するか。
- **選択肢案**:
  1. **Clerk**: Expo サポートが手厚く、ソーシャルログイン（Google/Apple）が数分で組み込めるが、無料枠制限に注意。
  2. **Custom JWT (D1 + Hono)**: ベンダーロックインがなくCloudflareで完結するが、セキュリティ実装コスト（リフレッシュトークン管理等）が増大。
- **影響範囲**: `02_Architecture/system_design.md`, `apps/api/src/middleware/auth.ts`

### TBD-03: オフライン操作 & 同期ポリシー
- **ステータス**: `Open`
- **概要**: 電波の届かない観光地・海外での立替入力時にどう挙動するか。
- **選択肢案**:
  1. **MVPはオンライン必須**: 電波がない場合はエラーメッセージを表示し、通信復活時に再試行を促す。
  2. **TanStack Query 永続化（Persister）**: ローカルストレージにキャッシュし、バックグラウンド復帰時に自動リトライ。
- **決定方針**: 開発工数を抑えるため MVP では「オンライン必須 + エラーハンドリング」とし、v2でオフライン対応。

---

## 2. 中・長期検討事項 (Medium/Low Priority)

### TBD-04: 多通貨（海外旅行）対応と為替レート取得 API
- **ステータス**: `Deferred`
- **概要**: JPY 以外の通貨（USD, EUR, KRW 等）での立替入力と、清算時の為替変換ルール。
- **課題**: 無料で利用可能な為替レート API（Open Exchange Rates, Frankfurter 等）の選定と、レート取得タイミング（立替日時点 vs 清算日時点）。

### TBD-05: ゲストユーザー（アカウント未登録）のアカウント昇格フロー
- **ステータス**: `Open`
- **概要**: 一時的に「名前だけ」で参加させた `guest` ユーザーが、後から本アカウントを作成して割り当てを引き継ぐ手順。
- **DB設計上の考慮**: `trip_participants.role = 'guest'` から `users` レコードとのマッピング付け替え処理。

---

## 3. Gemini Notebook 技術レビュー＆決定ログ (Resolved Logs)

> [!success] 解決済み課題ログ
> 
> #### 1. ログストレージ設計の不整合解消 (2026-09-15 解決)
> - **問題点**: `tech_stack.md` に Cloudflare Analytics Engine が指定されていたにもかかわらず、`database.md` に D1 リレーショナル DB 用の `logs` テーブルが存在していた。
> - **決定事項**: D1 の `logs` テーブルを完全に削除し、アクセスログやボタンイベントはすべて Analytics Engine へ非同期送信する設計に一律変更。
> 
> #### 2. コア機能（立替・分配・精算）テーブルの欠落補正 (2026-09-15 解決)
> - **問題点**: 初期スキーマに `expenses` や `settlements` テーブルがなく、立替計算・精算アプリとして機能しない状態だった。
> - **決定事項**: `expenses`（支出）, `expense_splits`（個人負担額）, `settlements`（精算履歴）テーブルを新設。
> 
> #### 3. Gemini 1.5 Flash レシート解析連携フィールドの定義 (2026-09-15 解決)
> - **問題点**: AI バッチ処理がどのようにレシート解析結果を保持するか不透明だった。
> - **決定事項**: `expenses` テーブルに `ai_analysis_status` と `ai_summary` カラムを追加。Cloudflare R2 に保存されたレシート画像を Cron Worker 経由で非同期解析するフローを確定。

---

## 4. Antigravity (AIエージェント) 向け実装ディレクティブ

> [!warning] 実装時の制約注意事項
> 1. 上記 **1. 優先検討事項** に挙がっている TBD 項目について、勝手に独断で外部サービス（Clerk 等）を導入したり、未決定の API エンドポイントを生やすことは**禁止**します。
> 2. TBD 項目の実装が必要になった場合は、事前にユーザー（人間）に選択肢を確認の上、本ドキュメントのステータスを `Resolved` に更新してからコード作成を開始してください。
