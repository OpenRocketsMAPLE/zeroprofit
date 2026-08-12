import { IDENTITY, PILLAR_DESCRIPTIONS, TIERS_EXPLAINED } from '../../lib/content';
import { PILLAR_KEYS, PILLAR_LABELS, SCORE_SPEC_V1 } from '../../lib/scoring';
import { ButtonLink } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';

export function AboutPage() {
  return (
    <div className="public-frame">
      <div className="eyebrow" style={{ marginTop: 48 }}>
        About ZeroProfit
      </div>
      <h1 style={{ maxWidth: '18ch' }}>The ZPO is a record label for nonprofits.</h1>
      {IDENTITY.paragraphs.map((p, i) => (
        <p key={i} style={{ maxWidth: '70ch' }}>{p}</p>
      ))}

      <div className="panel" style={{ marginTop: 32 }}>
        <h2>Youth-led is a product rule, not just a tagline.</h2>
        <p>
          ZeroProfit serves youth-led nonprofits founded by students <strong>under 19</strong>. Registration runs
          age gates and guardian consent (COPPA / GDPR) so the network stays a safe, accountable place for
          minors to run real organizations.
        </p>
      </div>

      <div className="panel">
        <h2>The four verification pillars</h2>
        <div className="grid-2">
          {PILLAR_KEYS.map((key) => (
            <div className="card" key={key}>
              <div className="row row--between">
                <strong>{PILLAR_LABELS[key]}</strong>
                <Chip tone="navy">{Math.round(SCORE_SPEC_V1.weights[key] * 100)}%</Chip>
              </div>
              <p className="small muted" style={{ margin: '8px 0 0' }}>{PILLAR_DESCRIPTIONS[key]}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2>Tier progression</h2>
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
        <h2>Verification: honest badges</h2>
        <p>
          The verified badge is granted only after a human-reviewed verification request — it is never
          auto-issued, it links to its verification record, and it is required to reach the top tiers.
          Paper organizations cannot buy their way up; there is nothing to buy.
        </p>
      </div>

      <div className="row" style={{ marginTop: 32 }}>
        <ButtonLink to="/register" variant="rust">
          Claim your ZPO
        </ButtonLink>
        <ButtonLink to="/free" variant="ghost">
          Pricing — free
        </ButtonLink>
      </div>
    </div>
  );
}
