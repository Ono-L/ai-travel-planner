// ポートフォリオ画面の表示データ定義 (docs/sdd-tracker/portfolio_spec.md 準拠)
// ※ 氏名・自己紹介・GitHub / SNS リンク等は就活・外部公開前にご自身の情報へ差し替えてください。

export interface PortfolioProfile {
  displayName: string;
  roleTitle: string;
  bio: string;
  githubUrl: string;
  contactLabel: string;
  careerHighlights: Array<{ label: string; value: string; note: string }>;
}

export interface EngineeringStrength {
  title: string;
  description: string;
}

export type ProjectCategory = 'web_ai' | 'rag_bot' | 'iot_python';

export interface ProjectShowcaseItem {
  id: string;
  repoName: string;
  repoUrl: string;
  category: ProjectCategory;
  categoryLabel: string;
  name: string;
  subtitle: string;
  statusLabel: string;
  statusColor: { bg: string; text: string };
  problemAndGoal: string;
  architectureHighlights: string[];
  qualityAndSecurity: string[];
  techBadges: string[];
  adrNote?: string;
  previewImage?: {
    src: string;
    alt: string;
    caption: string;
  };
  hasLiveDemo?: boolean;
}

export const PORTFOLIO_PROFILE: PortfolioProfile = {
  displayName: 'Ono-L',
  roleTitle: 'Full-Stack / AI & Edge Systems Engineer',
  bio: '仕様駆動開発（SDD）と技術的意思決定（ADR）を軸に、Cloudflare エッジスタックによる Web アプリ・RAG 搭載 Discord Bot・Raspberry Pi 向け電子ペーパー IoT ダッシュボードまで領域横断で設計・実装しています。運用コスト最適化と型安全・セキュリティ設計を最初から組み込む開発を重視しています。',
  githubUrl: 'https://github.com/Ono-L',
  contactLabel: 'GitHub にて公開リポジトリ・設計書・テストコードを閲覧できます',
  careerHighlights: [
    { label: '制作プロダクト', value: '4件 / 3リポジトリ', note: 'Web・RAG Bot・IoT/Python・Mobile' },
    { label: '主な得意領域', value: 'TypeScript / Python', note: 'strict 型安全 + Pydantic v2' },
    { label: 'クラウド & AI', value: 'Cloudflare + Gemini', note: 'Workers / D1 / Vectorize / MCP' },
    { label: '開発プロセス', value: 'SDD / ADR / 自動テスト', note: 'Vitest・pytest・Docker 環境再現' },
  ],
};

export const ENGINEERING_STRENGTHS: EngineeringStrength[] = [
  {
    title: '仕様駆動開発（SDD）と意思決定の言語化',
    description:
      '要件・設計・ADR（技術的意思決定記録）を Markdown で構造化してから実装するプロセスを実践。コストや UX の観点から方針転換した判断根拠も追跡可能に残しています。',
  },
  {
    title: '制約・コストを踏まえたエッジ／軽量設計',
    description:
      'Cloudflare Workers（Static Assets / D1 / Vectorize）の無料枠統合や、実機レスで検証できる Docker モックドライバ設計など、運用負荷と開発効率を両立する構成を選定しています。',
  },
  {
    title: 'セキュリティ・テストを初期設計から組み込む姿勢',
    description:
      'Ed25519 署名検証、HMAC 定数時間比較、HttpOnly Cookie セッション認証、OWASP LLM01（プロンプトインジェクション）対策、ハルシネーション抑制を実装段階から標準化しています。',
  },
];

export const SKILL_CATEGORIES: Array<{ category: string; items: string[] }> = [
  {
    category: 'Frontend & Type Safety',
    items: ['TypeScript (strict)', 'React 18', 'Vite', 'TanStack Query v5', 'Zustand', 'Zod', 'Expo / React Native'],
  },
  {
    category: 'Backend & Edge Infrastructure',
    items: [
      'Hono v4 (RPC)',
      'Cloudflare Workers',
      'Cloudflare D1 (SQLite)',
      'Cloudflare Vectorize',
      'Cloudflare R2',
      'Workers Static Assets',
    ],
  },
  {
    category: 'Python & IoT / Hardware',
    items: ['Python 3.12 (型ヒント)', 'FastAPI', 'Pydantic v2', 'Pillow (1bit モノクロ描画)', 'httpx', 'SQLite', 'Raspberry Pi / e-Paper'],
  },
  {
    category: 'AI / RAG / DevOps & Quality',
    items: [
      'Gemini API (2.5 Flash / Embedding)',
      'RAG 検索基盤設計',
      'LM Studio / Ollama',
      'Remote MCP (JSON-RPC 2.0)',
      'Docker / DevContainer',
      'pnpm + Turborepo',
      'Vitest / pytest',
    ],
  },
];

export const PROJECT_SHOWCASE: ProjectShowcaseItem[] = [
  {
    id: 'sdd-tracker',
    repoName: 'ai-travel-planner',
    repoUrl: 'https://github.com/Ono-L/ai-travel-planner',
    category: 'web_ai',
    categoryLabel: 'Web / AI・MCP',
    name: 'SDD Progress Tracker & Remote MCP',
    subtitle: '仕様書自動同期・ハイブリッド AI 監査・リモート MCP サーバー統合 Web アプリ',
    statusLabel: '稼働中（ライブデモあり）',
    statusColor: { bg: '#dcfce7', text: '#166534' },
    problemAndGoal:
      '個人・チーム開発で起きがちな「仕様書と実装の乖離」を解消するため、Obsidian の Markdown 仕様書を唯一の正本（Single Source of Truth）として進捗・工数予実・AI レビューを一元管理できる基盤を構築しました。',
    architectureHighlights: [
      'Vite カスタムプラグインを自作し、docs/ 配下の YAML フロントマターをファイル保存と同時に監視・解析して JSON マニフェストを自動生成',
      'Gemini API（クラウド無料枠）とローカル LLM（LM Studio / Ollama）を切り替えられるハイブリッド仕様監査ゲートウェイを実装',
      'POST /api/sdd/mcp に JSON-RPC 2.0 準拠のリモート MCP サーバーを実装し、Claude Desktop / VS Code 等の外部 AI エージェントから仕様書・タスクへ接続可能',
      'Cloudflare Workers Static Assets によりフロントエンド（React + Vite）と Hono API を 1 Worker に統合し、CORS 排除とランニングコスト $0 運用を実現',
    ],
    qualityAndSecurity: [
      'HttpOnly / SameSite=Lax の HMAC-SHA256 署名付きセッション Cookie 認証（/api/auth/*）＋パスワード・Bearer トークンの定数時間比較',
      'OWASP LLM01 対策（<spec_input> タグ隔離・サニタイズ）＋ Gemini API キーの x-goog-api-key ヘッダー送信とタイムアウト制御',
      'Zod 厳格バリデーション + Prepared Statement + TypeScript strict: true によるエンドツーエンド型安全性',
    ],
    techBadges: ['TypeScript', 'React 18', 'Vite', 'Hono v4', 'Cloudflare Workers', 'Cloudflare D1', 'Remote MCP', 'Hybrid LLM'],
    adrNote:
      '設計判断: フロントと API を別サービスに分けず Workers Static Assets で 1 Worker 配信に統合することで、構成の単純化・CORS 回避・無料枠での継続公開を両立。',
    hasLiveDemo: true,
  },
  {
    id: 'gbf-beginner-bot',
    repoName: 'gbf-beginner-bot',
    repoUrl: 'https://github.com/Ono-L/gbf-beginner-bot',
    category: 'rag_bot',
    categoryLabel: 'RAG / Discord Bot',
    name: 'gbf-beginner-bot（RAG 搭載 初心者支援 Discord Bot）',
    subtitle: 'Cloudflare Vectorize + D1 + Gemini API による出典付き RAG 質問応答 Bot',
    statusLabel: '開発完了・本番 D1 / Vectorize 構成済',
    statusColor: { bg: '#dbeafe', text: '#1e40af' },
    problemAndGoal:
      'システムが複雑なゲームにおいて初心者が専門用語や育成方針でつまずきやすい課題を解決するため、Discord 上のスラッシュコマンド（/ask, /guide, /word）から根拠付きで即座に回答を得られる RAG Bot を開発しました。',
    architectureHighlights: [
      '16 本の構造化 Markdown ナレッジ（knowledge/*.md）をチャンク分割し、gemini-embedding-001（768 次元・L2 正規化）で Cloudflare Vectorize と D1 へ投入する Ingest パイプラインを実装',
      '登録時（RETRIEVAL_DOCUMENT）と検索時（RETRIEVAL_QUERY）の taskType を使い分け、検索精度を最適化',
      'Discord の 3 秒応答制約に対し、/ask は即座に Deferred（type: 5）を返却し、Workers の waitUntil() で非同期 RAG 推論を実行して Webhook PATCH で回答を更新',
      'チャンネルを汚さないデフォルト Ephemeral（本人のみ表示）応答を採用し、共有したい場合のみ public オプションで全体表示できる UX 設計',
    ],
    qualityAndSecurity: [
      'Discord Interactions の Ed25519 署名検証を実装し、不正リクエストを 401 で遮断（ALLOWED_GUILD_IDS による許可サーバー制限対応）',
      '外部スクレイピング禁止の自前ナレッジ完結型・モデル自動フォールバック・<user_question> タグ隔離・3 重ハルシネーション抑制（出典見出し必須）',
      'TypeScript strict: true（any 禁止）+ Vitest 5 テストスイート（27 テスト）完備。Cloudflare 未ログインでもローカル JSON インデックスで検索検証が可能',
    ],
    techBadges: ['TypeScript', 'Cloudflare Workers', 'Hono', 'Cloudflare Vectorize', 'Cloudflare D1', 'Gemini 2.5 Flash', 'RAG', 'Vitest'],
    adrNote:
      '設計判断: Cloudflare Vectorize の次元上限と検索品質を両立するため 768 次元 + L2 正規化を採用し、ベクトル検索（Vectorize）と本文取得（D1）を責務分離。',
  },
  {
    id: 'epaper-dashboard',
    repoName: 'epaper-dashboard',
    repoUrl: 'https://github.com/Ono-L/epaper-dashboard',
    category: 'iot_python',
    categoryLabel: 'IoT / Python・FastAPI',
    name: 'epaper-dashboard（電子ペーパー ローカルダッシュボード）',
    subtitle: 'Raspberry Pi Zero 2 W + 4.2inch e-Paper 向け 天気・iPhone 通知表示システム',
    statusLabel: 'Phase 1 完了（Docker モック検証済）',
    statusColor: { bg: '#fef3c7', text: '#92400e' },
    problemAndGoal:
      'デスク上に常設して低消費電力で天気・時刻・iPhone 通知をひと目で確認できる電子ペーパー端末を目指し、実機（Raspberry Pi Zero 2 W + Waveshare 4.2inch SPI）への移行を前提とした Phase 1 プロトタイプを構築しました。',
    architectureHighlights: [
      '描画ロジック（Pillow による 400x300 / 1bit モノクロ PNG・日本語フォント折り返し描画）と出力ドライバ（base / mock / waveshare）を抽象基底クラス＋Factory パターンで完全分離',
      'DISPLAY_MODE 切替だけでローカルモック出力と実機 SPI 出力を切り替えられ、ハードウェア調達前でも Docker + ブラウザプレビュー（/preview）で画面確認とテスト通知送信が可能',
      'Open-Meteo API（API キー不要）による天気・気温・降水確率取得と、iPhone ショートカット等からの Webhook（POST /api/v1/notifications）受信・SQLite 永続化を FastAPI で実装',
    ],
    qualityAndSecurity: [
      'Python 3.12 全箇所型ヒント + Pydantic v2（BaseModel / BaseSettings）による厳格な入出力・環境設定バリデーション',
      'X-API-Key 認証に hmac.compare_digest を用いたタイミング攻撃対策と、API_KEY 未設定時のフェイルクローズ（401 拒否）を徹底',
      'pytest による通知 API・天気サービス・400x300 モノクロ画像生成の自動テストを Docker コンテナ内で完結実行可能',
    ],
    techBadges: ['Python 3.12', 'FastAPI', 'Pydantic v2', 'Pillow (1bit)', 'SQLite', 'httpx', 'Docker', 'pytest'],
    adrNote:
      '設計判断: 実機環境でのレイアウト調整コストを下げるため、ドライバ抽象化とブラウザプレビュー UI を Phase 1 で先行構築し、実機移行時に描画コード無修正で差し替えられる設計を採用。',
    previewImage: {
      src: '/images/epaper-preview.png',
      alt: 'epaper-dashboard 400x300 1bit モノクロ実出力プレビュー',
      caption: 'Pillow で実生成した 400×300px / 1bit モノクロ電子ペーパー出力プレビュー（日本語フォント・天気・通知表示）',
    },
  },
  {
    id: 'trip-splitter',
    repoName: 'ai-travel-planner',
    repoUrl: 'https://github.com/Ono-L/ai-travel-planner/tree/archive/trip-splitter-v1',
    category: 'web_ai',
    categoryLabel: 'Web / Mobile モノレポ',
    name: 'Trip Splitter（旅行立替・最適精算システム）',
    subtitle: 'モノレポ基盤でのモバイルプロトタイプ検証と Web 移行ピボットの設計実績',
    statusLabel: 'Phase 1 完了（archive/trip-splitter-v1 保全）',
    statusColor: { bg: '#e0e7ff', text: '#3730a3' },
    problemAndGoal:
      'グループ旅行時の煩雑な立替記録と精算計算を効率化するため、レシート解析と最小送金回数ルート算出を行うフルスタック・モノレポ基盤を仕様駆動で設計・検証しました。',
    architectureHighlights: [
      'DevContainer（Docker）+ pnpm Workspaces + Turborepo v2 により、ホスト環境を汚染しない再現性の高いモノレポ開発環境を構築',
      'packages/shared（Zod スキーマ・共通型）を中心に、Expo Router v3（apps/app）と Hono v4 RPC（apps/api）のエンドツーエンド型安全通信を実装し、Expo Tunnel 実機検証を完了',
      'Cloudflare D1（6 テーブル正規化スキーマ）・R2 レシート保管・Workers Cron + Gemini による夜間非同期レシート解析アーキテクチャを設計',
    ],
    qualityAndSecurity: [
      'フロント・バック間でスキーマ定義を単一ソース化し、API 契約不整合をコンパイル時に検知',
      '設計変更・ピボット経緯を ADR および Git ブランチ履歴として完全に保全',
    ],
    techBadges: ['pnpm + Turborepo', 'Expo / React Native', 'Hono RPC', 'Zod', 'Cloudflare D1', 'Cloudflare R2', 'DevContainer'],
    adrNote:
      'ADR-001: アプリストア公開の固定費（Apple Developer Program 年額 $99 等）と「URL 共有だけで同行者がアプリ不要で即参加できる UX」の観点から、モバイル公開を見送り Cloudflare Web 無料公開路線へ戦略ピボット。',
  },
];

export const SECURITY_QUALITY_SUMMARY: Array<{ title: string; detail: string }> = [
  {
    title: '認証・署名検証とフェイルクローズ設計',
    detail:
      'Discord Ed25519 署名検証、HttpOnly / SameSite=Lax セッション Cookie 認証、X-API-Key の hmac.compare_digest 定数時間比較、シークレット未設定時の 401/503 拒否を各システムで徹底。',
  },
  {
    title: 'AI・RAG 安全性とコンプライアンス配慮',
    detail:
      'OWASP LLM01 対策（XML タグ隔離・サニタイズ）、外部スクレイピングを行わない自前ナレッジ完結設計、根拠不足時の推測回答防止と出典明記により、実用上安全な AI 活用を実現。',
  },
  {
    title: '型安全・自動テスト・再現可能な開発環境',
    detail:
      'TypeScript strict: true（any 禁止）と Python 3.12 型ヒント + Pydantic v2、Vitest / pytest による自動テスト、Docker / DevContainer による環境差異のない開発基盤を標準採用。',
  },
];
