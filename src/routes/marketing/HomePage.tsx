// Public marketing homepage — mission-led prestige positioning (guardrails G1/G2).

import { Link } from 'react-router-dom';
import {
  ANTI_GAMING,
  BRAND,
  FAQS,
  FREE_BLOCK,
  HERO,
  IDENTITY,
  PILLAR_DESCRIPTIONS,
  SERVICES,
  TIERS_EXPLAINED,
} from '../../lib/content';
import { PILLAR_KEYS, PILLAR_LABELS, SCORE_SPEC_V1 } from '../../lib/scoring';
import { sampleEntries } from '../../lib/leaderboard';
import { Chip, ServiceStateChip, TierChip } from '../../components/ui/Chip';
import { ButtonLink } from '../../components/ui/Button';
import { FaqItem } from '../../components/ui/Misc';
import { tierFor } from '../../components/score/scoreBits';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export function HomePage() {
  const top = sampleEntries().slice(0, 5);

  return (
    <>
      {/* Hero — mission first, never "free service" (G2) */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">{HERO.eyebrow}</div>
          <h1>{HERO.headline}</h1>
          <div className="hero-sub">{HERO.sub}</div>
          <p className="hero-body">{HERO.body}</p>
          <div className="hero-cta">
            <ButtonLink to={HERO.ctaPrimary.to} variant="rust" size="lg">
              {HERO.ctaPrimary.label} <ArrowRight size={18} />
            </ButtonLink>
            <ButtonLink to={HERO.ctaSecondary.to} variant="ghost" size="lg">
              {HERO.ctaSecondary.label}
            </ButtonLink>
          </div>
          <div className="hero-stats">
            <div>
              <div className="stat-value">0–100</div>
              <div className="stat-label">Public Impact Factor Score</div>
            </div>
            <div>
              <div className="stat-value">4</div>
              <div className="stat-label">Verification pillars</div>
            </div>
            <div>
              <div className="stat-value">$0</div>
              <div className="stat-label">Always — completely free</div>
            </div>
          </div>
        </div>
      </section>

      {/* Identity — the record-label / ZPO explanation */}
      <section className="section section--paper">
        <div className="section-inner" style={{ maxWidth: 760 }}>
          <div className="eyebrow">{IDENTITY.eyebrow}</div>
          <h2>{IDENTITY.headline}</h2>
          {IDENTITY.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <div className="row" style={{ marginTop: 16 }}>
            <ButtonLink to="/about" variant="navy">
              About the ZPO identity
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Completely free — present but secondary (G2) */}
      <section className="section section--white">
        <div className="section-inner" style={{ maxWidth: 760 }}>
          <div className="eyebrow">{FREE_BLOCK.eyebrow}</div>
          <h2>{FREE_BLOCK.headline}</h2>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem' }}>
            {FREE_BLOCK.statement}
          </p>
          <p className="muted">{FREE_BLOCK.body}</p>
          <div className="row">
            <ButtonLink to={FREE_BLOCK.cta.to} variant="forest">
              {FREE_BLOCK.cta.label} <ArrowRight size={16} />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Infrastructure — 4+ services with honest states (G6) */}
      <section className="section section--paper">
        <div className="section-inner">
          <div className="eyebrow">Infrastructure</div>
          <h2>Everything a growing club needs.</h2>
          <p className="muted" style={{ maxWidth: '70ch' }}>
            Every service is either <strong>Available Now</strong> or in <strong>Rolling Deployment</strong> with
            scope and no fixed date — we publish honest state, not promises.
          </p>
          <div className="grid-3" style={{ marginTop: 24 }}>
            {SERVICES.map((s) => (
              <div className="card service-card" key={s.id}>
                <div className="row row--between">
                  <h3 style={{ margin: 0 }}>{s.title}</h3>
                  <ServiceStateChip state={s.state} />
                </div>
                <p>{s.tagline}</p>
                <p className="small muted">{s.body}</p>
                {s.scope ? <div className="scope">{s.scope}</div> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IFS transparency — pillars, weights, tiers */}
      <section className="section section--navy">
        <div className="section-inner">
          <div className="row row--between" style={{ marginBottom: 24 }}>
            <div>
              <div className="eyebrow" style={{ color: 'var(--rust-hi)' }}>
                Transparent scoring
              </div>
              <h2>One number. Four pillars. Fully public.</h2>
            </div>
            <ButtonLink to="/methodology" variant="ghost" size="sm">
              Read the methodology
            </ButtonLink>
          </div>
          <div className="grid-2" style={{ alignItems: 'start' }}>
            <div className="stack">
              {PILLAR_KEYS.map((key) => (
                <div className="card" key={key} style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.35)' }}>
                  <div className="row row--between">
                    <strong>{PILLAR_LABELS[key]}</strong>
                    <Chip tone="outline">{Math.round(SCORE_SPEC_V1.weights[key] * 100)}%</Chip>
                  </div>
                  <p className="small" style={{ color: '#b9c5de', margin: '8px 0 0' }}>
                    {PILLAR_DESCRIPTIONS[key]}
                  </p>
                </div>
              ))}
            </div>
            <div className="tier-ladder">
              {TIERS_EXPLAINED.map((t) => (
                <div className="tier-row" key={t.name} style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.35)' }}>
                  <span className="tier-name">{t.name}</span>
                  <span className="small" style={{ color: '#b9c5de' }}>
                    {t.note}
                  </span>
                  <span className="mono" style={{ textAlign: 'right' }}>
                    {t.min}+
                  </span>
                </div>
              ))}
              <div className="small" style={{ color: '#b9c5de' }}>
                <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> Scores are
                append-only and checksummed — anyone can re-verify a score from its published inputs.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof / network — leaderboard teaser */}
      <section className="section section--paper">
        <div className="section-inner">
          <div className="row row--between" style={{ marginBottom: 16 }}>
            <div>
              <div className="eyebrow">The network</div>
              <h2>Clubs on the leaderboard.</h2>
            </div>
            <Chip tone="gray">Sample demo data</Chip>
          </div>
          <div className="panel" style={{ padding: 0 }}>
            {top.map((e, i) => (
              <div className="leaderboard-row" key={e.org.id}>
                <span className="rank">{i + 1}</span>
                <Link to={`/org/${e.org.slug}`}>
                  <strong>{e.org.name}</strong>
                  <span className="muted small" style={{ display: 'block' }}>
                    {e.org.tagline}
                  </span>
                </Link>
                <span>
                  <TierChip tier={tierFor(e.row)} />
                </span>
                <span className="mono" style={{ textAlign: 'right' }}>
                  {e.row ? e.row.total.toFixed(1) : '—'}
                </span>
                <span className="muted small" style={{ textAlign: 'right' }}>
                  IFS
                </span>
              </div>
            ))}
          </div>
          <div className="row" style={{ marginTop: 16 }}>
            <ButtonLink to="/impact" variant="navy">
              Full leaderboard <ArrowRight size={16} />
            </ButtonLink>
            <span className="small muted">Top tiers require human-verified badges — sample data shown for demonstration.</span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section--white">
        <div className="section-inner" style={{ maxWidth: 760 }}>
          <div className="eyebrow">FAQ</div>
          <h2>Questions, answered plainly.</h2>
          <div style={{ marginTop: 24 }}>
            {FAQS.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section section--paper">
        <div className="section-inner">
          <div className="cta-band">
            <h2>Give real value to REAL impact.</h2>
            <p>
              {BRAND.name} is the record-label-style identity for teen nonprofits. Claim your ZPO — it takes
              minutes, it is completely free, and your score is public from day one.
            </p>
            <div className="row" style={{ justifyContent: 'center' }}>
              <ButtonLink to="/register" variant="rust" size="lg">
                Claim your ZPO <ArrowRight size={18} />
              </ButtonLink>
              <ButtonLink to="/how-it-works" variant="ghost" size="lg">
                How it works
              </ButtonLink>
            </div>
            <p className="small muted" style={{ margin: 0 }}>
              {ANTI_GAMING[5]} — see the full anti-gaming list on the methodology page.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
