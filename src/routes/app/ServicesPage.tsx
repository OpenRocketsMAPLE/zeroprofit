// Service catalog with explicit Available Now / Rolling Deployment states (G6)
// plus the ZeroProfit Links manager (fully local).

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../store/StoreContext';
import { SERVICES } from '../../lib/content';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/Form';
import { Modal } from '../../components/ui/Modal';
import { Alert, DemoNote, EmptyState, PageHeader } from '../../components/ui/Misc';
import { Chip, ServiceStateChip } from '../../components/ui/Chip';
import { useToast } from '../../components/ui/Toast';
import { Link2, PauseCircle, PlayCircle, Trash2 } from 'lucide-react';
import { checkUrlHttps } from '../../lib/validation';

export function ServicesPage() {
  const { state, addLink, updateLink, removeLink, recordLinkClick, addWaitlist } = useApp();
  const toast = useToast();
  const [waitlistFor, setWaitlistFor] = useState<string | null>(null);
  const [wlEmail, setWlEmail] = useState('');
  const [linkSlug, setLinkSlug] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkUrlError, setLinkUrlError] = useState<string | null>(null);

  const joinWaitlist = () => {
    const res = addWaitlist(wlEmail, `Service: ${waitlistFor}`);
    if (!res.ok) {
      toast.push(res.error);
      return;
    }
    toast.push(`Added to the ${waitlistFor} waitlist (local demo).`);
    setWaitlistFor(null);
    setWlEmail('');
  };

  const createLink = () => {
    const s = linkSlug.trim().toLowerCase();
    if (!/^[a-z0-9-]{2,40}$/.test(s) || /^-|-$/.test(s) || /-{2,}/.test(s)) {
      setLinkError('2–40 lowercase letters, numbers, or hyphens — no leading/trailing/double hyphens.');
      return;
    }
    if (state.links.some((l) => l.slug === s)) {
      setLinkError('That short link already exists.');
      return;
    }
    const uErr = checkUrlHttps(linkUrl);
    if (uErr) {
      setLinkUrlError(uErr);
      return;
    }
    const res = addLink(s, linkUrl);
    if (!res.ok) {
      setLinkError(res.error);
      return;
    }
    toast.push(`Link created: zeroprofit.org/link/${s}`);
    setLinkSlug('');
    setLinkUrl('');
    setLinkError(null);
    setLinkUrlError(null);
  };

  return (
    <div>
      <PageHeader
        title="Services"
        intro="Every service carries an explicit state: Available Now, or Rolling Deployment with scope and no fixed date."
        actions={<DemoNote />}
      />

      <div className="grid-3">
        {SERVICES.map((s) => (
          <div className="card service-card" key={s.id}>
            <div className="row row--between">
              <h3 style={{ margin: 0 }}>{s.title}</h3>
              <ServiceStateChip state={s.state} />
            </div>
            <p className="small muted" style={{ flex: 1 }}>{s.body}</p>
            {s.scope ? <div className="scope">{s.scope}</div> : null}
            {s.state === 'available_now' ? (
              s.id === 'links' ? (
                <Button size="sm" variant="navy" onClick={() => document.getElementById('links-manager')?.scrollIntoView({ behavior: 'smooth' })}>
                  Manage links
                </Button>
              ) : (
                <Button size="sm" variant="navy" onClick={() => toast.push(`${s.title}: available now in the demo — configuration lives on the relevant page.`)}>
                  Get started
                </Button>
              )
            ) : (
              <Button size="sm" variant="ghost" onClick={() => setWaitlistFor(s.title)}>
                Join the waitlist
              </Button>
            )}
          </div>
        ))}
      </div>

      <Alert tone="info" >
        <div>
          <strong>Honest state:</strong> domain and email provisioning are credential-dependent integrations. In
          this local demo they show their UI and states but never claim real provisioning. Hosting setup lives on{' '}
          <Link to="/org/deploy">Hosting &amp; Domain</Link>.
        </div>
      </Alert>

      {/* ZeroProfit Links manager */}
      <div className="panel" id="links-manager" style={{ marginTop: 24 }}>
        <div className="row row--between">
          <h2 style={{ margin: 0 }}>
            <Link2 size={18} style={{ display: 'inline', verticalAlign: '-3px' }} /> ZeroProfit Links
          </h2>
          <Chip tone="green">Available Now</Chip>
        </div>
        <p className="muted small">
          Tracked short links at <code>zeroprofit.org/link/&#123;slug&#125;</code> — bot-resistant and
          tier-capped in production. Fully functional locally.
        </p>
        <div className="grid-2" style={{ gridTemplateColumns: '1fr 180px 1fr auto', alignItems: 'end', gap: 12 }}>
          <TextField label="Short link" placeholder="volunteer" value={linkSlug} onChange={(e) => setLinkSlug(e.target.value)} error={linkError} />
          <span className="muted small" style={{ paddingBottom: 22 }}>.zeroprofit.org/link/…</span>
          <TextField label="Destination (https://)" placeholder="https://example.org/page" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} error={linkUrlError} />
          <Button variant="rust" onClick={createLink} style={{ marginBottom: 0 }}>
            Create link
          </Button>
        </div>

        {state.links.length === 0 ? (
          <EmptyState title="No links yet" body="Create your first short link above — it will count toward the Links pillar of your IFS." />
        ) : (
          <div className="table-wrap" style={{ marginTop: 16 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Link</th>
                  <th>Destination</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Clicks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.links.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <code>zeroprofit.org/link/{l.slug}</code>
                    </td>
                    <td className="small muted" style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {l.targetUrl}
                    </td>
                    <td>
                      <Chip tone={l.status === 'active' ? 'green' : l.status === 'paused' ? 'amber' : 'gray'}>{l.status}</Chip>
                    </td>
                    <td className="mono" style={{ textAlign: 'right' }}>{l.clicks.toLocaleString()}</td>
                    <td>
                      <div className="row">
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={l.status === 'active' ? `Pause ${l.slug}` : `Resume ${l.slug}`}
                          onClick={() => {
                            updateLink(l.id, { status: l.status === 'active' ? 'paused' : 'active' });
                            toast.push(l.status === 'active' ? 'Link paused.' : 'Link resumed.');
                          }}
                        >
                          {l.status === 'active' ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            recordLinkClick(l.id);
                            toast.push(`Simulated click recorded for /link/${l.slug} (demo).`);
                          }}
                        >
                          +1 click
                        </Button>
                        <Button size="sm" variant="danger" aria-label={`Delete ${l.slug}`} onClick={() => { removeLink(l.id); toast.push('Link deleted.'); }}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={waitlistFor !== null} onClose={() => setWaitlistFor(null)} title={`Waitlist — ${waitlistFor ?? ''}`} size="sm">
        <div>
          <p className="small muted">
            This service is in Rolling Deployment — scope is set, no fixed date. Join the waitlist and we will
            notify you at general availability (demo stores locally, sends nothing).
          </p>
          <TextField label="Email" type="email" value={wlEmail} onChange={(e) => setWlEmail(e.target.value)} />
          <Button variant="rust" onClick={joinWaitlist} block>
            Join waitlist
          </Button>
        </div>
      </Modal>
    </div>
  );
}
