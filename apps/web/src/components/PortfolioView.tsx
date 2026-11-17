import React from 'react';
import {
  PORTFOLIO_PROFILE,
  PROJECT_SHOWCASE,
  SKILL_CATEGORIES,
} from '../data/portfolio-profile.js';

interface PortfolioViewProps {
  onOpenDemo: () => void;
  specCount: number;
}

const SDD_ARCHITECTURE_STEPS = [
  { step: '01', title: 'Obsidian 仕様書', detail: 'docs/ 配下の Markdown (YAML) が唯一の正本' },
  { step: '02', title: 'Vite 自動同期', detail: '保存と同時にフロントマターを解析し画面反映' },
  { step: '03', title: 'ハイブリッド AI 監査', detail: 'Gemini 無料枠 / ローカル LLM を切替検証' },
  { step: '04', title: 'Remote MCP & Edge', detail: 'Hono + Cloudflare Workers で全世界へ配信' },
];

export const PortfolioView: React.FC<PortfolioViewProps> = ({ onOpenDemo, specCount }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. プロフィール・ヒーローカード */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
          color: '#ffffff',
          borderRadius: 14,
          padding: '24px 20px',
          boxShadow: '0 4px 12px rgba(29, 78, 216, 0.2)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
          <div style={{ flex: '1 1 280px' }}>
            <span
              style={{
                display: 'inline-block',
                background: 'rgba(255,255,255,0.18)',
                padding: '3px 10px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              {PORTFOLIO_PROFILE.roleTitle}
            </span>
            <h2 style={{ margin: '0 0 8px', fontSize: 22 }}>{PORTFOLIO_PROFILE.displayName}</h2>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: '#e0e7ff' }}>
              {PORTFOLIO_PROFILE.bio}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 210 }}>
            <button
              onClick={onOpenDemo}
              style={{
                background: '#ffffff',
                color: '#1e3a8a',
                border: 'none',
                padding: '10px 16px',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              SDD ボードの実働デモを見る ({specCount}件)
            </button>
            {PORTFOLIO_PROFILE.githubUrl ? (
              <a
                href={PORTFOLIO_PROFILE.githubUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#dbeafe', fontSize: 12, textAlign: 'center' }}
              >
                GitHub プロフィールを開く
              </a>
            ) : (
              <span style={{ color: '#bfdbfe', fontSize: 11, textAlign: 'center' }}>
                {PORTFOLIO_PROFILE.contactLabel}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* 2. 仕様駆動開発（SDD）アーキテクチャパイプライン */}
      <section
        style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        <h3 style={{ margin: '0 0 12px', fontSize: 17 }}>仕様駆動開発（SDD）アーキテクチャ構成</h3>
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

      {/* 3. 技術スタック・スキルマトリクス */}
      <section
        style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        <h3 style={{ margin: '0 0 14px', fontSize: 17 }}>技術スタック・開発環境</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
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

      {/* 4. 制作プロダクト & 技術的意思決定（ADR） */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h3 style={{ margin: 0, fontSize: 17 }}>制作プロダクト & アーキテクチャ実績</h3>
        {PROJECT_SHOWCASE.map((project) => (
          <article
            key={project.id}
            style={{
              background: '#ffffff',
              borderRadius: 12,
              padding: 20,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
              <h4 style={{ margin: 0, fontSize: 16, color: '#111827' }}>{project.name}</h4>
              <span
                style={{
                  background: project.statusColor.bg,
                  color: project.statusColor.text,
                  padding: '2px 10px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {project.statusLabel}
              </span>
            </div>
            <p style={{ margin: '0 0 12px', fontSize: 14, color: '#4b5563', lineHeight: 1.6 }}>
              {project.summary}
            </p>
            <ul style={{ margin: '0 0 12px', paddingLeft: 18, fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
              {project.architectureHighlights.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            {project.adrNote && (
              <div
                style={{
                  marginBottom: 12,
                  padding: '8px 12px',
                  background: '#fffbeb',
                  borderLeft: '3px solid #d97706',
                  fontSize: 12,
                  color: '#92400e',
                }}
              >
                {project.adrNote}
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {project.techBadges.map((badge) => (
                <span
                  key={badge}
                  style={{
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>

      {/* 5. セキュリティ & 品質設計サマリー */}
      <section
        style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: 18,
          border: '1px solid #e5e7eb',
        }}
      >
        <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>セキュリティ・品質設計</h3>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
          <li>OWASP LLM01 対策: 仕様書テキストの XML タグ隔離とサニタイズによるプロンプトインジェクション緩和</li>
          <li>Zod 厳格バリデーション + Prepared Statement による SQL インジェクション防止と型安全性（strict: true）</li>
          <li>環境変数（AUTH_MODE）によるローカル開発モードと本番 Bearer トークン保護モードの分離</li>
        </ul>
      </section>
    </div>
  );
};
