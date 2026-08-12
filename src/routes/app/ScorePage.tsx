// IFS breakdown: gauge, pillar cards, provenance, history, demo recompute.

import { useApp } from '../../store/StoreContext';
import { appendScoreRow } from '../../store/store';
import { latestScore } from '../../store/seed';
import { PILLAR_KEYS, PILLAR_LABELS, SCORE_SPEC_V1 } from '../../lib/scoring';
import { fmtDate, fmtDateTime, timeAgo } from '../../lib/format';
import { StatCard } from '../../components/ui/Card';
import { TierChip, VerificationChip } from '../../components/ui/Chip';
import { PillarBars, ScoreChart, tierFor } from '../../components/score/scoreBits';
import { Alert, DemoNote, PageHeader } from '../../components/ui/Misc';
import { ButtonLink } from '../../components/ui/Button';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { RefreshCw } from 'lucide-react';

export function ScorePage() {
  const { state } = useApp();
  const toast = useToast();
  const org = state.org && state.org.status !== 'closed' ? state.org : null;
  const ledger = state.scoreLedger;
  const row = latestScore(ledger);

  if (!org) {
    return (
      <div>
        <PageHeader title="Impact Factor" />
        <Alert tone="info" >
          Create your ZPO first — <ButtonLink to="/onboarding" variant="navy" size="sm">Create organization</ButtonLink>
        </Alert>
      </div>
    );
  }

  const recompute = () => {
    appendScoreRow();
    toast.push('Score recomputed locally (demo) — new ledger row appended.');
  };

  return (
    <div>
      <PageHeader
        title="Impact Factor Score"
        intro="Public, append-only, checksummed. Anyone can re-verify this score from its published inputs."
        actions={
          <span className="row">
            <DemoNote />
          </span>
        }
      />

      <div className="panel">
        <div className="score-gauge">
          <div className="ifs-total">{row ? row.total.toFixed(1) : '—'}</div>
          <div className="tier-label">
            <TierChip tier={tierFor(row)} />
          </div>
          {row ? (
            <div className="muted small">
              spec v{row.scoreVersion} · period {fmtDate(row.periodStart)} → {fmtDate(row.periodEnd)} · computed {timeAgo(row.computedAt)}
            </div>
          ) : (
            <div className="muted small">No score rows yet.</div>
          )}
        </div>
        {row ? <PillarBars row={row} /> : <p className="muted">Scores are seeded as local demo data on creation.</p>}
        <div className="row" style={{ marginTop: 16 }}>
          <Button variant="navy" size="sm" onClick={recompute}>
            <RefreshCw size={14} /> Recompute (local demo)
          </Button>
          <ButtonLink to="/methodology" variant="ghost" size="sm">
            Methodology
          </ButtonLink>
        </div>
        <p className="small muted" style={{ marginBottom: 0 }}>
          Recompute inserts a new append-only ledger row with a deterministic continuation of the last inputs —
          it never edits history (invariant O4).
        </p>
      </div>

      <div className="grid-4" style={{ marginTop: 16 }}>
        {PILLAR_KEYS.map((key) => {
          const p = row?.pillars[key];
          return (
            <StatCard
              key={key}
              value={p ? p.score.toFixed(1) : '—'}
              label={PILLAR_LABELS[key]}
              hint={`weight ${p ? Math.round(p.weight * 100) : 0}% of IFS`}
            />
          );
        })}
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Score history</h2>
        <ScoreChart rows={ledger} height={180} />
        <p className="small muted" style={{ marginBottom: 0 }}>
          {ledger.length} ledger rows · latest {fmtDateTime(row?.computedAt ?? '')} · checksum{' '}
          <code className="small">{row?.checksum.slice(0, 24)}…</code>
        </p>
      </div>

      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Input provenance</h2>
        {row ? (
          <>
            <p className="small muted">
              Canonical snapshot (spec v{SCORE_SPEC_V1.version}) — the exact bytes covered by the checksum:
            </p>
            <pre>{JSON.stringify({ orgId: row.orgId, scoreVersion: row.scoreVersion, periodStart: row.periodStart, periodEnd: row.periodEnd, inputs: row.inputsSnapshot }, null, 2)}</pre>
            <p className="small muted" style={{ marginBottom: 0 }}>
              <strong>Verification state:</strong> <VerificationChip status={org.verification.status} /> — top
              tiers (Established and above) require a verified badge (anti-gaming L5).
            </p>
          </>
        ) : (
          <p className="muted small">No snapshot available yet.</p>
        )}
      </div>
    </div>
  );
}
