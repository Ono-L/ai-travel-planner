import { z } from 'zod';

// US-101: 旅行グループの新規作成スキーマ (1文字以上50文字以内)
export const createTripSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(50, 'タイトルは50文字以内で入力してください'),
  destination: z.string().optional(),
  coverImageUrl: z.string().url().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  currency: z.string().default('JPY'),
});

// US-201 & SCR-04: 立替支出の登録スキーマ (負担額合計 = 支払金額の完全一致検証を含む)
export const expenseSplitInputSchema = z.object({
  userId: z.number().int().positive(),
  amount: z.number().nonnegative(),
});

export const createExpenseSchema = z
  .object({
    tripId: z.number().int().positive(),
    payerUserId: z.number().int().positive(),
    title: z.string().min(1, '項目名は必須です'),
    amount: z.number().positive('金額は 1 以上で入力してください'),
    category: z.string().optional(),
    receiptImageUrl: z.string().url().optional(),
    splits: z.array(expenseSplitInputSchema).min(1, '負担者を1名以上指定してください'),
  })
  .refine(
    (data) => {
      const splitSum = data.splits.reduce((acc, cur) => acc + cur.amount, 0);
      return Math.abs(splitSum - data.amount) === 0;
    },
    {
      message: '各負担者の負担額合計が支払金額と一致していません',
      path: ['splits'],
    }
  );

// US-402 & SCR-05: 精算完了（送金完了）の記録スキーマ
export const createSettlementSchema = z.object({
  tripId: z.number().int().positive(),
  payerUserId: z.number().int().positive(),
  payeeUserId: z.number().int().positive(),
  amount: z.number().positive('精算金額は 1 以上で入力してください'),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type CreateSettlementInput = z.infer<typeof createSettlementSchema>;
