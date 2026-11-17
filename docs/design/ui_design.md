---
tags:
  - design/ui-ux
  - expo
---

# Design & UI/UX Specifications

## 1. デザインコンセプト
- **アプリケーション名**: Trip Splitter（旅行立替・精算管理アプリ）
- **ターゲット環境**: iOS / Android (Expo / React Native) & Web
- **デザイン原則**:
  - 旅行先でも片手で直感的に素早く立替入力・レシート撮影が完了できるミニマルUI
  - 精算ステータス（貸し・借り・清算完了）が一目で判別できるカラーコントラスト設計

## 2. カラーパレット & タイポグラフィ
- **Primary**: `#1A56DB`（メインアクション・送金ボタン・強調金額）
- **Success**: `#16A34A`（受取プラス残高・AI解析完了・精算完了）
- **Danger**: `#DC2626`（支払マイナス残高・エラー表示）
- **Warning**: `#D97706`（AI解析中 `pending` ステータス・未精算アラート）
- **Background**: `#F9FAFB`（画面背景） / `#FFFFFF`（カード背景）
- **Text**: `#111827`（見出し） / `#4B5563`（本文・補足）

## 3. コンポーネント設計指針（Atomic Design）
- `apps/app/src/components/ui/`: Button, Input, Badge, Card, Modal 等の汎用プリミティブ
- `apps/app/src/components/features/`:
  - `trips/TripCard.tsx`: 旅行一覧カード（カバー画像・期間・個人収支バッジ）
  - `expenses/ExpenseCard.tsx`: 支出履歴アイテム（カテゴリ・支払者・AIステータスアイコン）
  - `settlements/SettlementRouteCard.tsx`: 最小送金ルート表示カード
