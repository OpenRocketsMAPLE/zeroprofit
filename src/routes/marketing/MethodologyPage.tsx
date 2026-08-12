import { ANTI_GAMING, PILLAR_DESCRIPTIONS, TIERS_EXPLAINED } from '../../lib/content';
import { PILLAR_KEYS, PILLAR_LABELS, SCORE_SPEC_V1 } from '../../lib/scoring';
import { ButtonLink } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';

export function MethodologyPage() {
  const spec = SCORE_SPEC_V1;
  return (
    <div className="public-frame">
      <div className="eyebrow" style={{ marginTop: 48 }}>
        Methodology
      </div>
      <h1>How the Impact Factor Score works.</h1>
      <p className="muted" style={{ maxWidth: '72ch' }}>
        The IFS is a public 0–100 score computed from four weighted pillars. Every score is a row in an
        append-only ledger with a checksum over its exact inputs — anyone can recompute a score from its
        published snapshot and confirm it matches.
      </p>

      <div className="methodology-grid" style={{ marginTop: 24 }}>
        <div className="panel">
          <h2>Pillars & weights (spec v{spec.version})</h2>
          {PILLAR_KEYS.map((key) => (
            <div className="card" key={key} style={{ marginBottom: 12 }}>
              <div className="row row--between">
                <strong>{PILLAR_LABELS[key]}</strong>
                <Chip tone="navy">{Math.round(spec.weights[key] * 100)}%</Chip>
              </div>
              <p className="small muted" style={{ margin: '6px 0 0' }}>{PILLAR_DESCRIPTIONS[key]}</p>
            </div>
          ))}
          <p className="small muted">
            Social Verification's weight is config-driven and owned by the spec version — the marketing page
            historically left it as a placeholder; the spec is the source of truth.
          </p>
        </div>

        <div className="stack">
          <div className="panel">
            <h2>Tiers</h2>
            <div className="tier-ladder">
              {TIERS_EXPLAINED.map((t) => (
                <div className="tier-row" key={t.name}>
                  <span className="tier-name">{t.name}</span>
                  <span className="small muted">{t.note}</span>
                  <span className="mono" style={{ textAlign: 'right' }}>{t.min}+</span>
                </div>
              ))}
            </div>
          </div>
          <div className="panel">
            <h2>Clipping & decay</h2>
            <p className="small" style={{ margin: 0 }}>
              Daily deltas are winsorized at the 95th percentile; spikes above {Math.round(spec.clipping.maxSpikePct * 100)}%
              of a trailing mean are flagged. Inputs decay over a {spec.decay.windowDays}-day window with a{' '}
              {spec.decay.halfLifeDays}-day half-life — campaigns cannot farm a score.
            </p>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 24 }}>
        <h2>Anti-gaming, six layers</h2>
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          {ANTI_GAMING.map((line) => (
            <li key={line} style={{ marginBottom: 8 }}>
              {line}
            </li>
          ))}
        </ol>
      </div>

      <div className="panel">
        <h2>Score integrity</h2>
        <p className="small">
          Each ledger row stores <code>score_version</code>, <code>inputs_snapshot</code>, and{' '}
          <code>checksum = sha256(canonical JSON of org, version, period, inputs)</code>. Algorithm changes ship
          only as new immutable versions; recomputation inserts new rows and never mutates history.
        </p>
        <pre>{`{
  "version": ${spec.version},
  "effectiveFrom": "${spec.effectiveFrom}",
  "weights": ${JSON.stringify(spec.weights, null, 2)},
  "rounding": ${spec.rounding},
  "tiers": [${spec.tiers.map((t) => `{ "${t.name}": ${t.min} }`).join(', ')}]
}`}</pre>
      </div>

      <div className="row" style={{ marginTop: 24 }}>
        <ButtonLink to="/impact" variant="navy">
          See the leaderboard
        </ButtonLink>
        <ButtonLink to="/free" variant="ghost">
          Pricing — free
        </ButtonLink>
      </div>
    </div>
  );
}
