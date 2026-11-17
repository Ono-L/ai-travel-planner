---
title: Coding Rules & Project Conventions
type: rules
tags:
  - rules/coding
  - typescript
  - expo
  - hono
created: 2026-09-15
status: active
related:
  - "[[tech_stack]]"
  - "[[database]]"
  - "[[system_design]]"
---

# Coding Rules & Project Conventions

> [!danger] AI Code Agent (Antigravity) 向け最重要注意事項
> 1. **ハルシネーションの禁止**: 定義されていない外部ライブラリや独自ユーティリティを勝手に `import` しないこと。パッケージの追加が必要な場合は提案にとどめること。
> 2. **`any` 型の禁止**: TypeScript の型安全性を厳密に維持すること。型が不明な場合は `unknown` を使用し、Zod 等で型ガードを行うこと。
> 3. **単一責任の原則**: 1ファイルあたり 200 行以内を目安とし、ロジックと UI 表現を分離すること。
> 4. 応答、コードの解説、およびコード内のコメントはすべて日本語で出力してください。
```

---

## 1. ディレクトリ構成ルール

本プロジェクトは **Expo (モバイルアプリ)** と **Hono (Cloudflare Workers)** を統合したモノレポ構造を採用します。

```text
trip-splitter/
├── apps/
│   ├── app/                      # Expo / React Native (フロントエンド)
│   │   ├── app/                  # Expo Router 画面ディレクトリ (ファイルベースルーティング)
│   │   ├── src/
│   │   │   ├── components/       # 再利用可能な UI コンポーネント (Atomic Design)
│   │   │   │   ├── ui/           # ボタン・入力フォーム等の最小要素
│   │   │   │   └── features/     # 画面固有機能コンポーネント (e.g. expenses/ExpenseCard.tsx)
│   │   │   ├── hooks/            # カスタムフック (React Query / Hono RPC 呼び出し等)
│   │   │   ├── lib/              # クライアント用設定 (Hono RPC クライアントなど)
│   │   │   └── utils/            # 通貨フォーマット等の共通関数
│   │   └── package.json
│   │
│   └── api/                      # Hono / Cloudflare Workers (バックエンド)
│       ├── src/
│       │   ├── routes/           # Hono エンドポイント設計 (e.g. trips.ts, expenses.ts)
│       │   ├── db/               # Cloudflare D1 データベースアクセス層 (スキーマ・クエリ)
│       │   ├── services/         # ビジネスロジック / R2・Analytics Engine 連携
│       │   ├── middleware/       # 認証・エラー処理ミドルウェア
│       │   └── index.ts          # Worker エントリポイント
│       ├── wrangler.jsonc        # Cloudflare バインディング設定 (D1, R2, Analytics Engine)
│       └── package.json
│
└── packages/
    └── shared/                   # フロント・バック共通型定義 & Zod スキーマ
        ├── src/
        │   ├── schemas/          # リクエスト/レスポンス用 Zod スキーマ
        │   └── types/            # 共通ドメイン型定義
        └── package.json
```

---

## 2. 命名規則 (Naming Conventions)

| 対象 | 規則 | 例 | 補足 |
| :--- | :--- | :--- | :--- |
| **ディレクトリ名** | `kebab-case` | `trip-participants`, `user-profile` | 小文字ハイフン区切り |
| **ファイル名 (UI)** | `PascalCase` | `ExpenseCard.tsx`, `TripList.tsx` | React コンポーネント |
| **ファイル名 (ロジック/設定)** | `kebab-case` | `use-expenses.ts`, `d1-client.ts` | フック、ユーティリティ、API |
| **型 / Interface** | `PascalCase` | `ExpenseSplit`, `UserRole` | `T` や `I` の接頭辞は不要 |
| **変数 / 関数** | `camelCase` | `calculateSettlement()`, `payerUserId` | 動詞から始める（関数の場合） |
| **定数** | `UPPER_SNAKE_CASE` | `MAX_RECEIPT_SIZE_MB`, `DEFAULT_CURRENCY` | グローバル定数 |
| **DB カラム名** | `snake_case` | `payer_user_id`, `receipt_image_url` | D1 (SQLite) スキーマ |

---

## 3. フロントエンド実装ルール (Expo / React Native)

> [!info] ガイドライン
> - **Expo Router**: 画面遷移には Expo Router (`app/` 内のディレクトリ構造) を使用する。
> - **Hono RPC Client**: バックエンドとの API 通信は Hono RPC (`@hono/rpc`) を介してエンドツーエンドの型安全性を保つ。
> - **スタイル定義**: インラインスタイルの直接記述は避け、共通テーマカラー・StyleSheet / NativeWind 規約に従う。

```typescript
// ✅ 良い例: カスタムフックと Hono RPC を活用したコンポーネント例
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Expense } from '@trip-splitter/shared';

interface ExpenseCardProps {
  expense: Expense;
  onPress?: () => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{expense.title}</Text>
      <Text style={styles.amount}>¥{expense.amount.toLocaleString()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, borderRadius: 8, backgroundColor: '#FFFFFF' },
  title: { fontSize: 16, fontWeight: '600' },
  amount: { fontSize: 18, fontWeight: '700', color: '#1A56DB' },
});
```

---

## 4. バックエンド実装ルール (Hono / Cloudflare Workers)

> [!info] ガイドライン
> - **Zod Validation**: リクエストパラメータ (`c.req.json()`, `c.req.param()`) は必ず Zod (`@hono/zod-validator`) で検証する。
> - **Cloudflare Bindings**: D1, R2, Analytics Engine は `c.env` から取得し、型定義 `Env` を厳格に適用する。
> - **D1 レスポンス**: D1 からデータを取得する際は、型キャストまたは Zod パースを行いレスポンス型を保証する。

```typescript
// ✅ 良い例: Hono エンドポイント実装例
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createExpenseSchema } from '@trip-splitter/shared';

type Bindings = {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  ANALYTICS: AnalyticsEngineDataset;
};

const app = new Hono<{ Bindings: Bindings }>();

app.post('/expenses', zValidator('json', createExpenseSchema), async (c) => {
  const data = c.req.valid('json');
  
  // D1 への挿入処理
  const result = await c.env.DB.prepare(
    `INSERT INTO expenses (trip_id, payer_user_id, title, amount, category) 
     VALUES (?, ?, ?, ?, ?) RETURNING id`
  ).bind(data.tripId, data.payerUserId, data.title, data.amount, data.category)
   .first<{ id: number }>();

  // Cloudflare Analytics Engine へのイベントログ送信
  c.env.ANALYTICS.writeDataPoint({
    blobs: ['expense_created', data.category ?? 'uncategorized'],
    doubles: [data.amount],
    indexes: [data.tripId.toString()],
  });

  return c.json({ success: true, expenseId: result?.id }, 201);
});

export default app;
```

---

## 5. エラーハンドリング & レスポンス規約

> [!warning] 統一エラーレスポンス構造
> 全ての API エラーは以下の JSON フォーマットに統一してください。

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "入力内容に不備があります",
    "details": [
      {
        "field": "amount",
        "message": "金額は 1 以上で入力してください"
      }
    ]
  }
}
```

---

## 6. Git / コミットメッセージ規約

AI エージェントおよび開発メンバーは Conventional Commits 規約に従ってください。

- `feat:` 新機能の追加 (`feat(app): 立替金額の割り勘自動計算機能を追加`)
- `fix:` バグ修正 (`fix(api): D1 トランザクション時の外部キー制約エラーを修正`)
- `docs:` ドキュメントの変更 (`docs(rules): coding_rules.md に Hono RPC 規約を追加`)
- `refactor:` リファクタリング (`refactor(shared): Zod スキーマの共通モジュール化`)
- `chore:` ビルド・ツール設定の変更
