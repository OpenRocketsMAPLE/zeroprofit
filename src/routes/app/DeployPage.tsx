// Hosting & Domain: Netlify connection readiness with honest credential state,
// DNS records, and the documented adapter contract. Local demo only.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/StoreContext';
import type { DomainRecord } from '../../types';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/Form';
import { Modal } from '../../components/ui/Modal';
import { Alert, DemoNote, EmptyState, PageHeader } from '../../components/ui/Misc';
import { Chip } from '../../components/ui/Chip';
import { useToast } from '../../components/ui/Toast';
import { DNS_CONTRACT_NOTE, NETLIFY_CONTRACT_NOTE } from '../../lib/adapters';
import { Plus, Rocket, Unplug } from 'lucide-react';

export function DeployPage() {
  const {
    state,
    connectNetlifyDemo,
    disconnectNetlify,
    syncNetlifySites,
    triggerDeploy,
    addDomain,
    checkDomains,
    removeDomain,
  } = useApp();
  const toast = useToast();
  const navigate = useNavigate();
  const [showConnect, setShowConnect] = useState(false);
  const [domainInput, setDomainInput] = useState('');
  const [domainError, setDomainError] = useState<string | null>(null);
  const org = state.org && state.org.status !== 'closed' ? state.org : null;
  const netlify = state.netlify;

  if (!org) {
    return (
      <div>
        <PageHeader title="Hosting & Domain" />
        <Alert tone="info" >
          Create your ZPO first —{' '}
          <Button onClick={() => navigate('/onboarding')} variant="navy" size="sm">
            Create organization
          </Button>
        </Alert>
      </div>
    );
  }

  const connected = netlify.status === 'connected_demo';

  const addDomainRecord = () => {
    const res = addDomain(domainInput);
    if (!res.ok) {
      setDomainError(res.error);
      return;
    }
    setDomainError(null);
    setDomainInput('');
    toast.push('Domain tracked — pending DNS verification.');
  };

  const domainState = (d: DomainRecord) =>
    d.status === 'verified' ? (
      <Chip tone="green">Verified</Chip>
    ) : d.status === 'failed' ? (
      <Chip tone="red">Failed</Chip>
    ) : (
      <Chip tone="amber">Pending verification</Chip>
    );

  return (
    <div>
      <PageHeader
        title="Hosting & Domain"
        intro="Connect your Netlify account to publish your label page at yourclub.zeroprofit.org. Production requires OAuth credentials; this demo simulates every state honestly."
        actions={<DemoNote />}
      />

      {/* Netlify card */}
      <div className="panel">
        <div className="row row--between" style={{ marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Netlify</h2>
          {connected ? (
            <Chip tone="green">Connected (local demo)</Chip>
          ) : (
            <Chip tone="gray">Not connected</Chip>
          )}
        </div>
        <p className="muted small">
          Netlify hosts your label page and provides the CDN, SSL, and deploy pipeline. ZeroProfit never sees
          your raw tokens in production — they are exchanged server-side and encrypted at rest.
        </p>

        {connected ? (
          <>
            <div className="deploy-state" style={{ marginBottom: 16 }}>
              <span className="status-dot status-dot--ok" aria-hidden="true" />
              <span>{netlify.accountName}</span>
              <span className="small muted">connected {netlify.connectedAt ? new Date(netlify.connectedAt).toLocaleString() : ''}</span>
            </div>
            {netlify.sites.length === 0 ? (
              <p className="muted small">No sites yet.</p>
            ) : (
              <div className="stack" style={{ gap: 12 }}>
                {netlify.sites.map((site) => (
                  <div className="card" key={site.id}>
                    <div className="row row--between">
                      <div>
                        <strong>{site.name}</strong>
                        <span className="small muted" style={{ display: 'block' }}>
                          {site.sslUrl}
                        </span>
                        <span className="small muted" style={{ display: 'block' }}>
                          Subdomain assignment: {site.domainAssignment.subdomain}
                        </span>
                      </div>
                      <div className="row">
                        <Chip tone={site.deployState === 'ready' ? 'green' : site.deployState === 'building' ? 'amber' : 'red'}>
                          {site.deployState}
                        </Chip>
                        <Button
                          size="sm"
                          variant="navy"
                          onClick={() => {
                            triggerDeploy(site.id);
                            toast.push('Deploy triggered (local demo).');
                          }}
                        >
                          <Rocket size={13} /> Deploy
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="row" style={{ marginTop: 16 }}>
              <Button variant="ghost" size="sm" onClick={() => { syncNetlifySites(); toast.push('Sites synced (local demo).'); }}>
                Sync sites
              </Button>
              <Button variant="danger" size="sm" onClick={() => { disconnectNetlify(); toast.push('Netlify disconnected (demo).'); }}>
                <Unplug size={13} /> Disconnect
              </Button>
            </div>
          </>
        ) : (
          <div className="row">
            <Button variant="rust" onClick={() => setShowConnect(true)}>
              Connect Netlify
            </Button>
            <span className="small muted">
              OAuth flow (authorization code + PKCE) — requires a Netlify OAuth app in production.
            </span>
          </div>
        )}
      </div>

      {/* DNS records */}
      <div className="panel" style={{ marginTop: 16 }}>
        <div className="row row--between" style={{ marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Domains & DNS</h2>
          <Button
            variant="ghost"
            size="sm"
            disabled={state.domains.length === 0}
            onClick={() => {
              checkDomains();
              toast.push('DNS check run — pending records flipped to verified (local demo).');
            }}
          >
            Check DNS (local demo)
          </Button>
        </div>
        <div className="grid-2" style={{ gridTemplateColumns: '1fr auto', alignItems: 'end' }}>
          <TextField
            label="Add a custom domain"
            placeholder="projects.myclub.org"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            error={domainError}
            hint="Production: creates a TXT record (verification token) at the provider, then polls until it resolves."
          />
          <Button variant="navy" onClick={addDomainRecord} style={{ marginBottom: 0 }}>
            <Plus size={14} /> Track domain
          </Button>
        </div>

        {state.domains.length === 0 ? (
          <EmptyState title="No domains tracked" body="Add a domain above to see DNS verification states (simulated locally)." />
        ) : (
          <div className="table-wrap" style={{ marginTop: 16 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Target</th>
                  <th>Status</th>
                  <th>Verification token (TXT)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.domains.map((d) => (
                  <tr key={d.id}>
                    <td><code>{d.fqdn}</code></td>
                    <td className="small muted">{d.target}</td>
                    <td>{domainState(d)}</td>
                    <td><code className="small">{d.verificationToken}</code></td>
                    <td>
                      <Button size="sm" variant="danger" onClick={() => { removeDomain(d.id); toast.push('Domain removed.'); }}>
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adapter contract */}
      <div className="panel" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Adapter contract (documentation)</h2>
        <p className="small muted">{NETLIFY_CONTRACT_NOTE}</p>
        <p className="small muted">{DNS_CONTRACT_NOTE}</p>
        <pre>{`interface NetlifyAdapter {
  buildAuthUrl(state: string): string;            // OAuth2 authorize URL
  connect(code: string, state: string): Promise<{ ok: boolean; error?: string }>;
  listSites(): Promise<NetlifySite[]>;
  assignDomain(siteId: string, subdomain: string): Promise<{ ok: boolean; error?: string }>;
  triggerDeploy(siteId: string): Promise<{ ok: boolean; error?: string }>;
  disconnect(): Promise<void>;
}
// Local demo implements these with simulated states — see src/lib/adapters.ts`}</pre>
      </div>

      <Modal open={showConnect} onClose={() => setShowConnect(false)} title="Connect Netlify" size="sm">
        <div>
          <p className="small muted">
            Production connects via OAuth 2.0 authorization code + PKCE. Tokens are encrypted at rest
            (AES-256-GCM), scoped to site:read + site:write, and refreshed before expiry. One connection per
            organization.
          </p>
          <Alert tone="warn" >
            No real Netlify credentials are available in this local demo. Use the simulated connection to
            explore every UI state.
          </Alert>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setShowConnect(false)}>
              Cancel
            </Button>
            <Button
              variant="rust"
              onClick={() => {
                connectNetlifyDemo();
                setShowConnect(false);
                toast.push('Netlify connected (simulated local demo — no real account).');
              }}
            >
              Use local demo connection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
