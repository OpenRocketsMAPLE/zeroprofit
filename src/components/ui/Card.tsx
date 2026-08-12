// Cards, panels, stat cards.

import type { ReactNode } from 'react';

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`panel ${className}`}>{children}</section>;
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function StatCard({
  value,
  label,
  hint,
  accent = 'rust',
}: {
  value: ReactNode;
  label: string;
  hint?: ReactNode;
  accent?: 'rust' | 'navy' | 'forest' | 'amber';
}) {
  return (
    <div className="card stat-card" style={{ borderLeftColor: accent === 'rust' ? 'var(--rust)' : accent === 'navy' ? 'var(--navy)' : accent === 'forest' ? 'var(--forest)' : 'var(--amber)' }}>
      <div className="stat-value">{value}</div>
      <div style={{ fontWeight: 500 }}>{label}</div>
      {hint ? <div className="muted small">{hint}</div> : null}
    </div>
  );
}
