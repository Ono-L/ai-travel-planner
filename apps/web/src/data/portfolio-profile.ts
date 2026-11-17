// ポートフォリオ画面の表示データ定義 (docs/sdd-tracker/portfolio_spec.md 準拠)
// ※ 氏名・自己紹介・SNSリンク等は公開前にご自身の情報へ差し替えてください。

export interface PortfolioProfile {
  displayName: string;
  roleTitle: string;
  bio: string;
  githubUrl: string;
  contactLabel: string;
}

export interface ProjectShowcaseItem {
  id: string;
  name: string;
  statusLabel: string;
  statusColor: { bg: string; text: string };
  summary: string;
  architectureHighlights: string[];
  techBadges: string[];
  adrNote?: string;
}

export const PORTFOLIO_PROFILE: PortfolioProfile = {
  displayName: '開発者ポートフォリオ（表示名未設定）',
  roleTitle: 'Full-Stack / AI Spec-Driven Engineer',
  bio: 'Obsidian 仕様書を起点とした仕様駆動開発（SDD）と、Cloudflare エッジスタック・ハイブリッド AI（Gemini API / ローカル LLM）・Model Context Protocol (MCP) を組み合わせた実践的な Web システム開発に取り組んでいます。',
  githubUrl: '',
  contactLabel: 'GitHub・SNS リンクは設定ファイルで追加できます',
};

export const SKILL_CATEGORIES: Array<{ category: string; items: string[] }> = [
  {
    category: 'Frontend & Type Safety',
    items: ['TypeScript (strict)', 'React 18', 'Vite', 'TanStack Query v5', 'Zustand', 'Zod'],
  },
  {
    category: 'Backend & Edge Infrastructure',
    items: ['Hono v4 (RPC)', 'Cloudflare Workers', 'Cloudflare D1 (SQLite)', 'Cloudflare R2', 'Static Assets'],
  },
  {
    category: 'AI / Agent / DevOps',
    items: ['Gemini API', 'LM Studio / Ollama', 'Remote MCP (JSON-RPC 2.0)', 'DevContainer (Docker)', 'pnpm + Turborepo'],
  },
];

export const PROJECT_SHOWCASE: ProjectShowcaseItem[] = [
  {
    id: 'sdd-tracker',
    name: 'SDD Progress Tracker & Remote MCP',
    statusLabel: '開発中（ライブデモ公開）',
    statusColor: { bg: '#dcfce7', text: '#166534' },
    summary:
      'Obsidian の Markdown 仕様書（YAML フロントマター）を自動同期し、設計・実装レビュー進捗と工数予実を一元管理する Web アプリ兼リモート MCP サーバー。',
    architectureHighlights: [
      'Vite カスタムプラグインによる docs/ 配下フロントマターの自動監視・JSON マニフェスト生成',
      'Gemini API（無料枠）とローカル LLM（LM Studio / Ollama）を切り替えられるハイブリッド仕様監査ゲートウェイ',
      'POST /api/sdd/mcp による Claude Desktop / VS Code 向けリモート MCP ツール提供',
      'AUTH_MODE 環境変数によるローカル無認証／公開時 Bearer トークン検証のデュアルモード認証',
    ],
    techBadges: ['React', 'Vite', 'Hono', 'Cloudflare D1', 'Remote MCP', 'Hybrid LLM'],
  },
  {
    id: 'trip-splitter',
    name: 'Trip Splitter（旅行立替・最適精算システム）',
    statusLabel: 'Phase 1 完了（archive/trip-splitter-v1）',
    statusColor: { bg: '#e0e7ff', text: '#3730a3' },
    summary:
      'グループ旅行の立替支出とレシート画像を管理し、最小送金回数の精算ルートを算出するモノレポ基盤。',
    architectureHighlights: [
      'Expo Router v3 + Hono RPC によるエンドツーエンドの型安全通信と Expo Tunnel 実機検証を完了',
      'Cloudflare D1（6テーブル設計）および Cron Triggers + Gemini による夜間非同期レシート解析アーキテクチャを設計',
    ],
    techBadges: ['Expo', 'React Native', 'Hono RPC', 'Cloudflare R2', 'Workers Cron'],
    adrNote:
      'ADR-001: ストア公開の固定費（Apple $99/年等）と招待 UX 最適化の観点からモバイル公開を見送り、Web 無料公開路線へピボット（Git 履歴保全済み）。',
  },
];
