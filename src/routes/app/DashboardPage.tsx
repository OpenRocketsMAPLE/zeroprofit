// Platform home: IFS summary + history chart, pillars, services, activity,
// quick actions, terminology reinforcement.

import { Link } from 'react-router-dom';
import {
  BarChart3,
  Blocks,
  Globe,
  Puzzle,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useApp } from '../../store/StoreContext';
import { latestScore } from '../../store/seed';
import { PILLAR_KEYS, PILLAR_LABELS } from '../../lib/scoring';
import { SERVICES, GLOSSARY, SERVICE_STATE_LABELS } from '../../lib/content';
import { fmtDate, timeAgo } from '../../lib/format';
import { StatCard } from '../../components/ui/Card';
import { Chip, ServiceStateChip, TierChip, VerificationChip } from '../../components/ui/Chip';
import { ScoreChart, tierFor } from '../../components/score/scoreBits';
import { Alert, DemoNote, EmptyState, PageHeader } from '../../components/ui/Misc';
import { ButtonLink } from '../../components/ui/Button';

const QUICK = [
  { to: '/org/score', label: 'Impact Factor', icon: BarChart3 },
  { to: '/org/team', label: 'Team', icon: Users },
  { to: '/org/services', label: 'Services', icon: Blocks },
  { to: '/org/deploy', label: 'Hosting & Domain', icon: Globe },
  { to: '/org/widgets', label: 'Widgets', icon: Puzzle },
  { to: '/org/verification', label: 'Verification', icon: ShieldCheck },
];

export function DashboardPage() {
  const { state } = useApp();
  const org = state.org && state.org.status !== 'closed' ? state.org : null;

  if (!org) {
    return (
      <div>
        <PageHeader title="Dashboard" />
        <EmptyState
          title="No ZPO yet"
          body="Create your organization to get a label page, an Impact Factor Score, and access to the platform tools."
          action={
            <ButtonLink to="/onboarding" variant="rust">
              Create your organization
            </ButtonLink>
          }
        />
      </div>
    );
  }

  const row = latestScore(state.scoreLedger);
  const ver = org.verification.status;

  return (
    <div>
      <PageHeader
        title={
          <span>
            {org.name} <Chip tone="outline">ZPO</Chip>
          </span>
        }
        intro={`${org.slug}.zeroprofit.org · ${fmtDate(org.createdAt)} · Youth-led since ${org.foundedYear}`}
        actions={
          <span className="row">
            <DemoNote />
          </span>
        }
      />

      {ver === 'none' || ver === 'draft' ? (
        <Alert tone="info" >
          <strong>Verification:</strong> your badge is not issued yet — badges are granted only after human
          review. <Link to="/org/verification">Start a verification request →</Link>
        </Alert>
      ) : ver === 'submitted' || ver === 'in_review' ? (
        <Alert tone="warn" >
          <strong>Verification:</strong> your request is <VerificationChip status={ver} />. A human reviewer on
          the production platform decides; this demo never auto-approves.
        </Alert>
      ) : null}

      <div className="dash-grid">
        <div className="dash-stack">
          {/* IFS summary */}
          <div className="panel">
            <div className="row row--between" style={{ marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>Impact Factor Score</h2>
              <div className="row">
                <TierChip tier={tierFor(row)} />
                {row ? <span className="small muted">spec v{row.scoreVersion} · computed {row ? timeAgo(row.computedAt) : '—'}</span> : null}
              </div>
            </div>
            <div className="ifs-summary">
              <div>
                <div className="ifs-total">{row ? row.total.toFixed(1) : '—'}</div>
                <div className="muted small">of 100</div>
              </div>
              <div style={{ flex: 1, minWidth: 240 }}>
                {state.scoreLedger.length >= 2 ? <ScoreChart rows={state.scoreLedger} height={120} /> : <div className="muted small">Score history appears after two periods.</div>}
              </div>
            </div>
            <div className="row" style={{ marginTop: 12 }}>
              <ButtonLink to="/org/score" variant="navy" size="sm">
                Score breakdown <TrendingUp size={14} />
              </ButtonLink>
              <ButtonLink to="/methodology" variant="ghost" size="sm">
                Methodology
              </ButtonLink>
            </div>
          </div>

          {/* Pillars */}
          <div className="grid-4">
            {PILLAR_KEYS.map((key) => {
              const p = row?.pillars[key];
              return (
                <StatCard
                  key={key}
                  value={p ? p.score.toFixed(1) : '—'}
                  label={PILLAR_LABELS[key]}
                  hint={`${p ? Math.round(p.weight * 100) : 0}% of IFS`}
                />
              );
            })}
          </div>

          {/* Activity */}
          <div className="panel">
            <h2 style={{ marginTop: 0 }}>Recent activity</h2>
            {state.activities.length === 0 ? (
              <p className="muted small">No activity yet.</p>
            ) : (
              <div className="activity-list">
                {state.activities.slice(0, 8).map((a) => (
                  <div className="activity-item" key={a.id}>
                    <span className="act-time">{timeAgo(a.at)}</span>
                    <span>{a.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dash-stack">
          {/* Quick actions */}
          <div className="panel">
            <h2 style={{ marginTop: 0 }}>Quick actions</h2>
            <div className="quick-actions">
              {QUICK.map((q) => {
                const Icon = q.icon;
                return (
                  <Link to={q.to} className="quick-action" key={q.to}>
                    <div className="card">
                      <Icon className="qa-icon" size={18} />
                      <strong>{q.label}</strong>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Service status */}
          <div className="panel">
            <h2 style={{ marginTop: 0 }}>Service status</h2>
            <div className="stack" style={{ gap: 8 }}>
              {SERVICES.map((s) => (
                <div className="row row--between" key={s.id} style={{ gap: 8 }}>
                  <span className="small">{s.title}</span>
                  <ServiceStateChip state={s.state} />
                </div>
              ))}
            </div>
            <p className="small muted" style={{ marginBottom: 0 }}>
              {SERVICE_STATE_LABELS.available_now} = usable now · {SERVICE_STATE_LABELS.rolling_deployment} = scope set, no fixed date.
            </p>
          </div>

          {/* Terminology */}
          <div className="panel">
            <h2 style={{ marginTop: 0 }}>ZeroProfit, in one line</h2>
            <dl className="glossary-list" style={{ margin: 0 }}>
              {GLOSSARY.slice(0, 6).map((g) => (
                <div key={g.term}>
                  <dt>{g.term}</dt>
                  <dd>{g.def}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
