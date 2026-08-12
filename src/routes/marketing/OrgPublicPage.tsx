// Public label page — the ZPO "artist page" (`/org/:slug`, canonical for
// `:slug.zeroprofit.org`). Read-only; badge semantics follow G5/O10.

import { Link, useParams } from 'react-router-dom';
import { CATEGORY_LABELS, type Organization, type ScoreRow } from '../../types';
import { findSampleBySlug, latestScore } from '../../store/seed';
import { useApp } from '../../store/StoreContext';
import { initials, hueBackground, fmtDate } from '../../lib/format';
import { Chip, TierChip, VerificationChip } from '../../components/ui/Chip';
import { PillarBars, ScoreChart, tierFor } from '../../components/score/scoreBits';
import { ButtonLink } from '../../components/ui/Button';
import { CheckCircle2, ExternalLink } from 'lucide-react';

export function OrgPublicPage() {
  const { slug } = useParams();
  const { state } = useApp();
  const sample = slug ? findSampleBySlug(slug) : undefined;
  const isUserOrg = state.org && state.org.status !== 'closed' && state.org.slug === slug;

  let org: Organization | undefined;
  let ledger: ScoreRow[] = [];
  let projects: { id: string; title: string; kind: string; year: string; summary: string }[] = [];
  let links: { slug: string; targetUrl: string; clicks: number }[] = [];
  let members: { id: string; name: string; email: string; role: string }[] = [];
  let isSample = false;

  if (sample) {
    org = sample.org;
    ledger = sample.ledger;
    projects = sample.projects;
    links = sample.links;
    members = sample.members;
    isSample = true;
  } else if (isUserOrg && state.org) {
    org = state.org;
    ledger = state.scoreLedger;
    projects = state.projects;
    links = state.links.map((l) => ({ slug: l.slug, targetUrl: l.targetUrl, clicks: l.clicks }));
    members = state.members.filter((m) => m.status === 'active');
  }

  if (!org) {
    return (
      <div className="public-frame">
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <h1>Organization not found</h1>
          <p className="muted">No ZPO with the label “{slug}” exists on this demo.</p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <ButtonLink to="/impact" variant="navy">
              Browse the leaderboard
            </ButtonLink>
            <ButtonLink to="/" variant="ghost">
              Back home
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  const row = latestScore(ledger);
  const verified = org.verification.status === 'approved';

  return (
    <div className="public-frame" style={{ paddingTop: 32 }}>
      <div
        className="label-cover"
        style={{ background: hueBackground(org.logoHue), borderRadius: 'var(--radius-md) var(--radius-md) 0 0', maxWidth: 900, margin: '0 auto' }}
      />
      <div className="label-body">
        <div className="label-head">
          <div className="label-avatar" style={{ background: hueBackground(org.logoHue) }}>
            {initials(org.name)}
          </div>
          <div>
            <div className="row" style={{ gap: 8 }}>
              <h1 className="label-title">
                {org.name} <Chip tone="outline">ZPO</Chip>
              </h1>
              {isSample ? <Chip tone="gray">Sample data</Chip> : null}
            </div>
            <div className="label-meta">
              <span className="muted small">{org.slug}.zeroprofit.org</span>
              {verified ? (
                <span className="verified-badge">
                  <CheckCircle2 size={14} /> Verified
                </span>
              ) : (
                <VerificationChip status={org.verification.status} />
              )}
              {isSample ? null : (
                <span className="small muted">Public profile — managed from the platform</span>
              )}
            </div>
          </div>
        </div>

        <p style={{ fontStyle: 'italic', marginTop: 16 }}>{org.tagline}</p>
        <div className="label-meta small muted">
          <span>{CATEGORY_LABELS[org.category]}</span>
          <span aria-hidden="true">·</span>
          <span>Founded {org.foundedYear}</span>
        </div>
        {org.description ? <p className="small muted" style={{ maxWidth: '72ch' }}>{org.description}</p> : null}

        {/* IFS card */}
        <div className="ifs-card" style={{ marginTop: 24 }}>
          <div className="row row--between" style={{ marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>Impact Factor Score</h2>
            <div className="row">
              <TierChip tier={tierFor(row)} />
              {row ? (
                <span className="small muted">computed {fmtDate(row.computedAt)} · spec v{row.scoreVersion}</span>
              ) : null}
            </div>
          </div>
          {row ? (
            <div className="ifs-summary">
              <div>
                <div className="ifs-total">{row.total.toFixed(1)}</div>
                <div className="muted small">out of 100</div>
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <PillarBars row={row} />
              </div>
            </div>
          ) : (
            <div className="muted small">No score rows yet — the first score appears after the first score period.</div>
          )}
          {ledger.length >= 2 ? (
            <div style={{ marginTop: 24 }}>
              <h3>Score history</h3>
              <ScoreChart rows={ledger} height={140} />
            </div>
          ) : null}
          <div className="row" style={{ marginTop: 16 }}>
            <ButtonLink to="/methodology" variant="ghost" size="sm">
              How the score works
            </ButtonLink>
            <ButtonLink to="/impact" variant="ghost" size="sm">
              Leaderboard
            </ButtonLink>
          </div>
        </div>

        {/* Catalog */}
        {org.profileFlags.projects && projects.length > 0 ? (
          <div style={{ marginTop: 32 }}>
            <h2>Impact catalog</h2>
            <div className="grid-2">
              {projects.map((p) => (
                <div className="card" key={p.id}>
                  <div className="row row--between">
                    <h3 style={{ margin: 0 }}>{p.title}</h3>
                    <Chip tone="gray">{p.kind}</Chip>
                  </div>
                  <p className="small muted" style={{ margin: '8px 0 0' }}>{p.summary}</p>
                  <div className="small muted" style={{ marginTop: 8 }}>{p.year}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Links */}
        {org.profileFlags.links && links.length > 0 ? (
          <div style={{ marginTop: 32 }}>
            <h2>ZeroProfit Links</h2>
            <div className="panel" style={{ padding: 'var(--sp-md) var(--sp-lg)' }}>
              {links.map((l) => (
                <div className="leaderboard-row" key={l.slug} style={{ padding: 'var(--sp-sm) 0' }}>
                  <a href={l.targetUrl} target="_blank" rel="noreferrer">
                    zeroprofit.org/link/{l.slug} <ExternalLink size={12} style={{ display: 'inline', verticalAlign: '-1px' }} />
                  </a>
                  <span className="muted small" style={{ gridColumn: '2 / 4' }}>
                    {l.clicks.toLocaleString()} clicks (public aggregate)
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Team */}
        {org.profileFlags.team && members.length > 0 ? (
          <div style={{ marginTop: 32 }}>
            <h2>Team</h2>
            <div className="row">
              {members.map((m) => (
                <div className="card" key={m.id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div className="avatar" style={{ background: hueBackground((m.name.charCodeAt(0) * 7) % 360) }}>
                    {initials(m.name)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500 }}>{m.name}</div>
                    <div className="small muted">{m.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <p className="small muted" style={{ marginTop: 32 }}>
          Powered by ZeroProfit — completely free for youth nonprofits. <Link to="/">Learn more</Link>.
        </p>
      </div>
    </div>
  );
}
