import React, { useState } from 'react';
import {
  ENGINEERING_STRENGTHS,
  PORTFOLIO_PROFILE,
  PROJECT_SHOWCASE,
  SECURITY_QUALITY_SUMMARY,
  SKILL_CATEGORIES,
  type ProjectCategory,
} from '../data/portfolio-profile.js';

interface PortfolioViewProps {
  onOpenDemo: () => void;
  specCount: number;
}

const SDD_ARCHITECTURE_STEPS = [
  { step: '01', title: 'Obsidian 仕様書', detail: 'docs/ 配下の Markdown (YAML) を唯一の正本として管理' },
  { step: '02', title: 'Vite 自動同期', detail: '保存と同時にフロントマターを解析し JSON マニフェスト生成' },
  { step: '03', title: 'ハイブリッド AI 監査', detail: 'Gemini 無料枠 / ローカル LLM を切り替えて仕様の抜け漏れ検証' },
  { step: '04', title: 'Remote MCP & Edge', detail: 'Hono + Cloudflare Workers Static Assets で無料枠一括配信' },
];

const CATEGORY_FILTERS: Array<{ key: 'all' | ProjectCategory; label: string }> = [
  { key: 'all', label: 'すべて' },
  { key: 'web_ai', label: 'Web / AI・MCP' },
  { key: 'rag_bot', label: 'RAG / Bot' },
  { key: 'iot_python', label: 'IoT / Python' },
];

export const PortfolioView: React.FC<PortfolioViewProps> = ({ onOpenDemo, specCount }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | ProjectCategory>('all');

  const visibleProjects =
    selectedCategory === 'all'
      ? PROJECT_SHOWCASE
      : PROJECT_SHOWCASE.filter((p) => p.category === selectedCategory);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* 1. プロフィール・ヒーローカード */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #1d4ed8 100%)',
          color: '#ffffff',
          borderRadius: 16,
          padding: '26px 22px',
          boxShadow: '0 6px 20px rgba(15, 23, 42, 0.18)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 18, alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 320px' }}>
            <span
              style={{
                display: 'inline-block',
                background: 'rgba(255,255,255,0.16)',
                border: '1px solid rgba(255,255,255,0.25)',
                padding: '4px 12px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              {PORTFOLIO_PROFILE.roleTitle}
            </span>
            <h1 style={{ margin: '0 0 10px', fontSize: 24, lineHeight: 1.3 }}>
              {PORTFOLIO_PROFILE.displayName}
            </h1>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: '#e2e8f0' }}>
              {PORTFOLIO_PROFILE.bio}
            </p>
          </div>
          <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 230 }}>
            <button
              onClick={onOpenDemo}
              style={{
                background: '#ffffff',
                color: '#1e3a8a',
                border: 'none',
                padding: '11px 16px',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              }}
            >
              SDD ボードの実働デモを見る ({specCount}件)
            </button>
            {PORTFOLIO_PROFILE.githubUrl ? (
              <a
                href={PORTFOLIO_PROFILE.githubUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: '#0f172a',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.28)',
                  padding: '10px 16px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23.96-.27 1.98-.4 3-.4s2.04.13 3 .4c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub プロフィールを見る ↗
              </a>
            ) : (
              <span style={{ color: '#bfdbfe', fontSize: 11, textAlign: 'center', lineHeight: 1.4 }}>
                {PORTFOLIO_PROFILE.contactLabel}
              </span>
            )}
            <button
              onClick={() => window.print()}
              style={{
                background: 'rgba(255,255,255,0.14)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.32)',
                padding: '8px 14px',
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              提出用 PDF を保存 / 印刷
            </button>
          </div>
        </div>

        {/* 就活サマリー指標 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 10,
            marginTop: 20,
            paddingTop: 18,
            borderTop: '1px solid rgba(255,255,255,0.18)',
          }}
        >
          {PORTFOLIO_PROFILE.careerHighlights.map((item) => (
            <div
              key={item.label}
              style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 10,
                padding: '10px 12px',
              }}
            >
              <div style={{ fontSize: 11, color: '#bfdbfe', marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', marginBottom: 2 }}>
                {item.value}
              </div>
              <div style={{ fontSize: 11, color: '#dbeafe' }}>{item.note}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. エンジニアとしての強み・開発スタンス */}
      <section
        style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
        }}
      >
        <h2 style={{ margin: '0 0 14px', fontSize: 17, color: '#111827' }}>
          エンジニアとしての強み・開発スタンス
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 14,
          }}
        >
          {ENGINEERING_STRENGTHS.map((strength, idx) => (
            <div
              key={strength.title}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: 14,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', marginBottom: 4 }}>
                STRENGTH 0{idx + 1}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                {strength.title}
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                {strength.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 制作プロダクト & アーキテクチャ実績 */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, color: '#111827' }}>
            制作プロダクト & アーキテクチャ実績 ({visibleProjects.length}件)
          </h2>
          <div className="no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CATEGORY_FILTERS.map((filter) => {
              const active = selectedCategory === filter.key;
              return (
                <button
                  key={filter.key}
                  onClick={() => setSelectedCategory(filter.key)}
                  style={{
                    background: active ? '#1e3a8a' : '#ffffff',
                    color: active ? '#ffffff' : '#374151',
                    border: active ? '1px solid #1e3a8a' : '1px solid #d1d5db',
                    padding: '5px 12px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {visibleProjects.map((project) => (
          <article
            key={project.id}
            style={{
              background: '#ffffff',
              borderRadius: 14,
              padding: 20,
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
              border: '1px solid #e5e7eb',
            }}
          >
            {/* カードヘッダー */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 8,
                marginBottom: 10,
              }}
            >
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span
                    style={{
                      background: '#f1f5f9',
                      color: '#334155',
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {project.categoryLabel}
                  </span>
                  <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>
                    repo: {project.repoName}
                  </span>
                </div>
                <h3 style={{ margin: '0 0 3px', fontSize: 17, color: '#0f172a' }}>{project.name}</h3>
                <div style={{ fontSize: 13, color: '#475569' }}>{project.subtitle}</div>
              </div>
              <span
                style={{
                  background: project.statusColor.bg,
                  color: project.statusColor.text,
                  padding: '3px 10px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                {project.statusLabel}
              </span>
            </div>

            {/* 背景・解決する課題 */}
            <div
              style={{
                background: '#f8fafc',
                borderRadius: 8,
                padding: '10px 12px',
                marginBottom: 14,
                fontSize: 13,
                color: '#334155',
                lineHeight: 1.65,
              }}
            >
              <strong style={{ color: '#0f172a' }}>背景・狙い：</strong>
              {project.problemAndGoal}
            </div>

            {/* プレビュー画像（存在する場合） */}
            {project.previewImage && (
              <figure
                style={{
                  margin: '0 0 14px',
                  padding: 12,
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <img
                  src={project.previewImage.src}
                  alt={project.previewImage.alt}
                  style={{
                    maxWidth: '100%',
                    width: 400,
                    height: 'auto',
                    borderRadius: 4,
                    border: '1px solid #cbd5e1',
                    imageRendering: 'pixelated',
                  }}
                />
                <figcaption style={{ fontSize: 12, color: '#4b5563', textAlign: 'center' }}>
                  {project.previewImage.caption}
                </figcaption>
              </figure>
            )}

            {/* 設計・実装の工夫 & 品質・セキュリティ */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 14,
                marginBottom: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1e3a8a', marginBottom: 6 }}>
                  アーキテクチャ・技術的工夫
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
                  {project.architectureHighlights.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0f766e', marginBottom: 6 }}>
                  品質・セキュリティ・検証
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
                  {project.qualityAndSecurity.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ADR / 技術的意思決定 */}
            {project.adrNote && (
              <div
                style={{
                  marginBottom: 12,
                  padding: '9px 12px',
                  background: '#fffbeb',
                  borderLeft: '3px solid #d97706',
                  borderRadius: '0 6px 6px 0',
                  fontSize: 12,
                  color: '#92400e',
                  lineHeight: 1.6,
                }}
              >
                {project.adrNote}
              </div>
            )}

            {/* フッター（技術バッジ＋ライブデモ導線） */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 10,
                paddingTop: 10,
                borderTop: '1px solid #f1f5f9',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {project.techBadges.map((badge) => (
                  <span
                    key={badge}
                    style={{
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      padding: '3px 9px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {badge}
                  </span>
                ))}
              </div>
              <div className="no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      background: '#0f172a',
                      color: '#ffffff',
                      padding: '6px 12px',
                      borderRadius: 7,
                      fontSize: 12,
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    GitHub コードを見る ↗
                  </a>
                )}
                {project.hasLiveDemo && (
                  <button
                    onClick={onOpenDemo}
                    style={{
                      background: '#1a56db',
                      color: '#ffffff',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: 7,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    デモタブを開く →
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* 4. 仕様駆動開発（SDD）アーキテクチャパイプライン */}
      <section
        style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
        }}
      >
        <h2 style={{ margin: '0 0 12px', fontSize: 17, color: '#111827' }}>
          仕様駆動開発（SDD）アーキテクチャ構成（本アプリの実働仕組み）
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
          }}
        >
          {SDD_ARCHITECTURE_STEPS.map((item) => (
            <div
              key={item.step}
              style={{
                border: '1px solid #dbeafe',
                background: '#f8fafc',
                borderRadius: 10,
                padding: 12,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', marginBottom: 4 }}>
                STEP {item.step}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
                {item.title}
              </div>
              <div style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.5 }}>{item.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. 技術スタック・スキルマトリクス */}
      <section
        style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
        }}
      >
        <h2 style={{ margin: '0 0 14px', fontSize: 17, color: '#111827' }}>
          技術スタック・開発環境（全プロジェクト横断）
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: 14,
          }}
        >
          {SKILL_CATEGORIES.map((group) => (
            <div
              key={group.category}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 10,
                padding: 14,
                background: '#f9fafb',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
                {group.category}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {group.items.map((item) => (
                  <span
                    key={item}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: 6,
                      padding: '3px 8px',
                      fontSize: 12,
                      color: '#1f2937',
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. セキュリティ & 品質設計サマリー */}
      <section
        style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: 20,
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        <h2 style={{ margin: '0 0 12px', fontSize: 17, color: '#111827' }}>
          セキュリティ・品質設計（プロジェクト共通基準）
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 12,
          }}
        >
          {SECURITY_QUALITY_SUMMARY.map((item) => (
            <div
              key={item.title}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: 14,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                {item.title}
              </div>
              <p style={{ margin: 0, fontSize: 12.5, color: '#475569', lineHeight: 1.6 }}>
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
