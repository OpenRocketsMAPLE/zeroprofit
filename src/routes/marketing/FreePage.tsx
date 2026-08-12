import { FREE_BLOCK, SERVICES } from '../../lib/content';
import { ButtonLink } from '../../components/ui/Button';
import { ServiceStateChip } from '../../components/ui/Chip';
import { Alert } from '../../components/ui/Misc';

export function FreePage() {
  return (
    <div className="public-frame">
      <div className="eyebrow" style={{ marginTop: 48 }}>
        Pricing
      </div>
      <h1 style={{ maxWidth: '16ch' }}>{FREE_BLOCK.headline}</h1>
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', maxWidth: '60ch' }}>
        {FREE_BLOCK.statement}
      </p>
      <p className="muted" style={{ maxWidth: '70ch' }}>{FREE_BLOCK.body}</p>

      <div className="grid-3" style={{ marginTop: 32 }}>
        {SERVICES.map((s) => (
          <div className="card service-card" key={s.id}>
            <div className="row row--between">
              <h3 style={{ margin: 0 }}>{s.title}</h3>
              <ServiceStateChip state={s.state} />
            </div>
            <p className="small muted">{s.body}</p>
            {s.scope ? <div className="scope">{s.scope}</div> : null}
          </div>
        ))}
      </div>

      <Alert tone="success" >
        <div>
          <strong>No subscriptions. No tiers. No surprise invoices.</strong>
          <span className="small" style={{ display: 'block', marginTop: 4 }}>
            ZeroProfit is sustained through the OpenRockets Inc. and is completely free for every youth-led
            nonprofit on the network — today and as the network grows.
          </span>
        </div>
      </Alert>

      <div className="cta-band" style={{ marginTop: 32 }}>
        <h2>Claim your ZPO — it costs nothing but a minute.</h2>
        <p>Your label page, your score, your catalog, your widgets. Free, forever, by design.</p>
        <ButtonLink to="/register" variant="rust" size="lg">
          Claim your ZPO
        </ButtonLink>
      </div>
    </div>
  );
}
