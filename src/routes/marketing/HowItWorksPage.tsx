import { HOW_STEPS, WAITLIST_NOTE } from '../../lib/content';
import { ButtonLink } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Misc';

export function HowItWorksPage() {
  return (
    <div className="public-frame">
      <div className="eyebrow" style={{ marginTop: 48 }}>
        How it works
      </div>
      <h1>From club to label page in four steps.</h1>
      <div className="stack" style={{ marginTop: 24, maxWidth: 720 }}>
        {HOW_STEPS.map((s) => (
          <div className="card" key={s.n} style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <div className="mono" style={{ fontSize: '2rem', color: 'var(--rust)', lineHeight: 1 }}>
              {s.n}
            </div>
            <div>
              <h3 style={{ margin: '0 0 6px' }}>{s.title}</h3>
              <p className="muted" style={{ margin: 0 }}>{s.body}</p>
            </div>
          </div>
        ))}
      </div>
      <Alert tone="info" >
        {WAITLIST_NOTE}
      </Alert>
      <div className="row" style={{ marginTop: 24 }}>
        <ButtonLink to="/register" variant="rust" size="lg">
          Claim your ZPO
        </ButtonLink>
      </div>
    </div>
  );
}
