// 共通ドメイン型定義 (docs/02_Architecture/database.md & docs/03_Rules/coding_rules.md 準拠)

export type UserRole = 'admin' | 'member' | 'guest';

export type AiAnalysisStatus = 'pending' | 'completed' | 'failed' | null;

export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: number;
  title: string;
  destination: string | null;
  coverImageUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  currency: string;
  createdAt: string;
}

export interface TripParticipant {
  id: number;
  tripId: number;
  userId: number;
  role: UserRole;
  joinedAt: string;
}

export interface Expense {
  id: number;
  tripId: number;
  payerUserId: number;
  title: string;
  amount: number;
  category: string | null;
  receiptImageUrl: string | null;
  aiAnalysisStatus: AiAnalysisStatus;
  aiSummary: string | null;
  paidAt: string;
  createdAt: string;
}

export interface ExpenseSplit {
  id: number;
  expenseId: number;
  userId: number;
  amount: number;
  createdAt: string;
}

export interface Settlement {
  id: number;
  tripId: number;
  payerUserId: number;
  payeeUserId: number;
  amount: number;
  settledAt: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}
