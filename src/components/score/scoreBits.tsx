// Score visualization pieces: tier tones, pillar bars, history chart, ticker.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingDown, TrendingUp } from 'lucide-react';
import type { Organization, ScoreRow } from '../../types';
import { PILLAR_KEYS, PILLAR_LABELS, SCORE_SPEC_V1, tierForScore } from '../../lib/scoring';
import { fmtDate } from '../../lib/format';
import { Chip, type ChipTone } from '../ui/Chip';
import { EmptyState } from '../ui/Misc';

export function tierTone(tier: string): ChipTone {
  switch (tier) {
    case 'Emerging':
      return 'navy';
    case 'Rising':
      return 'amber';
    case 'Established':
      return 'green';
    case 'Distinguished':
      return 'rust';
    case 'Legendary':
      return 'navy';
    default:
      return 'gray';
  }
}

export function tierFor(row: ScoreRow | undefined): string {
  return tierForScore(SCORE_SPEC_V1, row?.total ?? 0);
}

export function PillarBars({ row }: { row: ScoreRow }) {
  return (
    <div>
      {PILLAR_KEYS.map((key) => {
        const p = row.pillars[key];
        const maxContribution = p.weight * 100;
        const pct = Math.min(100, (p.score / maxContribution) * 100);
        return (
          <div className="pillar-bar-row" key={key}>
            <span className="pillar-name">
              {PILLAR_LABELS[key]}
              <span className="muted small"> · {Math.round(p.weight * 100)}%</span>
            </span>
            <div className="progress" role="img" aria-label={`${PILLAR_LABELS[key]}: ${p.score} of ${maxContribution} points`}>
              <span style={{ width: `${pct}%` }} />
            </div>
            <span className="mono" style={{ textAlign: 'right' }}>
              {p.score.toFixed(1)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function ScoreChart({ rows, height = 160 }: { rows: ScoreRow[]; height?: number }) {
  if (rows.length < 2) {
    return <div className="muted small">Score history appears after at least two score periods.</div>;
  }
  const w = 560;
  const h = height;
  const pad = 10;
  const totals = rows.map((r) => r.total);
  const min = Math.min(...totals);
  const max = Math.max(...totals);
  const span = Math.max(1, max - min);
  const pts = rows.map((r, i) => {
    const x = pad + (i / (rows.length - 1)) * (w - pad * 2);
    const y = h - pad - ((r.total - min) / span) * (h - pad * 2);
    return { x, y, r };
  });
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const label = `Impact Factor Score history: ${rows.length} points from ${fmtDate(rows[0].periodEnd)} to ${fmtDate(rows[rows.length - 1].periodEnd)}.`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label} style={{ width: '100%', height: 'auto' }}>
      <polyline points={path} fill="none" stroke="var(--navy)" strokeWidth="2.5" />
      {pts.map((p) => (
        <circle key={p.r.id} cx={p.x} cy={p.y} r="3.5" fill="var(--rust)">
          <title>{`${fmtDate(p.r.periodEnd)}: IFS ${p.r.total}`}</title>
        </circle>
      ))}
    </svg>
  );
}

export function ImpactTicker({ facts, speedMs = 4000 }: { facts: string[]; speedMs?: number }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setIndex((i) => (i + 1) % facts.length), Math.max(1200, speedMs));
    return () => window.clearInterval(t);
  }, [facts.length, speedMs]);
  const fact = facts[index % facts.length];
  return (
    <div className="widget-ticker" aria-live="polite" key={index} style={{ animation: 'modal-in 0.3s ease' }}>
      <span className="small muted" style={{ marginRight: 8, flex: 'none' }}>
        IFS
      </span>
      <span style={{ fontSize: '0.9rem' }}>{fact}</span>
    </div>
  );
}

export interface LeaderboardEntry {
  org: Organization;
  row: ScoreRow | undefined;
  prevTotal?: number;
  sample?: boolean;
  you?: boolean;
}

export function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length === 0) {
    return <EmptyState title="No scores yet" body="Scores appear once organizations complete their first score period." />;
  }
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Organization</th>
            <th>Tier</th>
            <th style={{ textAlign: 'right' }}>IFS</th>
            <th style={{ textAlign: 'right' }}>Trend</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => {
            const trend = e.row && e.prevTotal !== undefined ? Math.round((e.row.total - e.prevTotal) * 10) / 10 : 0;
            return (
              <tr key={e.org.id}>
                <td className="mono">{i + 1}</td>
                <td>
                  <Link to={`/org/${e.org.slug}`}>{e.org.name}</Link>{' '}
                  {e.sample ? <Chip tone="gray">Sample</Chip> : null}
                  {e.you ? <Chip tone="rust">You</Chip> : null}
                </td>
                <td>
                  <Chip tone={tierTone(tierFor(e.row))}>{tierFor(e.row)}</Chip>
                </td>
                <td className="mono" style={{ textAlign: 'right' }}>
                  {e.row ? e.row.total.toFixed(1) : '—'}
                </td>
                <td className="mono" style={{ textAlign: 'right' }}>
                  {e.row ? <TrendDelta delta={trend} /> : <span className="muted">—</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function TrendDelta({ delta }: { delta: number }) {
  if (delta === 0) return <span className="muted">0</span>;
  if (delta > 0) {
    return (
      <span style={{ color: 'var(--forest)' }}>
        <TrendingUp size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> +{delta}
      </span>
    );
  }
  return (
    <span style={{ color: 'var(--danger)' }}>
      <TrendingDown size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> {delta}
    </span>
  );
}
