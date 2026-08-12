// Integration adapter contract + local demo implementation.
//
// ZeroProfit's credential-dependent integrations (Netlify hosting, DNS
// verification, email provisioning, forums, ads) are NOT reachable in this
// local demo — there is no backend and no secrets. What we ship instead is an
// honest configuration UI (see /org/deploy) plus this documented contract, so a
// production implementation can drop in without UI changes.

import type { NetlifySite } from '../types';

/** Production adapter contract (documented in the UI on /org/deploy). */
export interface NetlifyAdapter {
  /** Build an OAuth2 authorize URL against Netlify with a state nonce. */
  buildAuthUrl(state: string): string;
  /** Exchange the OAuth code for tokens; tokens are AES-256-GCM encrypted at rest. */
  connect(code: string, state: string): Promise<{ ok: boolean; error?: string }>;
  /** List sites for the connected Netlify account. */
  listSites(): Promise<NetlifySite[]>;
  /** Assign `subdomain` to a site and record the DNS verification job. */
  assignDomain(siteId: string, subdomain: string): Promise<{ ok: boolean; error?: string }>;
  /** Trigger a deploy of a site. */
  triggerDeploy(siteId: string): Promise<{ ok: boolean; error?: string }>;
  /** Disconnect and purge stored tokens. */
  disconnect(): Promise<void>;
}

export const NETLIFY_CONTRACT_NOTE =
  'Production wiring: OAuth 2.0 authorization code + PKCE against Netlify. ' +
  'Tokens are encrypted at rest (AES-256-GCM, key in env only), scoped to site:read + site:write, ' +
  'and refreshed before expiry. One connection per organization. ' +
  'This demo shows the exact UI and states with a simulated connection — no real Netlify account is used.';

export const DNS_CONTRACT_NOTE =
  'Production DNS verification: a TXT record (verification token) is created at the domain provider, ' +
  'then a background job polls until the record resolves, flipping the record from pending_verified to verified. ' +
  'In this local demo, "Check DNS" simulates that cycle against your stored records.';

export const NETLIFY_OAUTH_ISSUER = 'https://app.netlify.com/authorize';
export const NETLIFY_REDIRECT_URI = 'https://app.zeroprofit.org/org/deploy/callback';

/** Local demo site object used when the user simulates a Netlify connection. */
export function demoNetlifySite(slug: string): NetlifySite {
  const sub = `${slug}.zeroprofit.org`;
  return {
    id: `demo_site_${slug}`,
    name: `${slug}-label-site`,
    url: `https://${sub}`,
    sslUrl: `https://${sub}`,
    deployState: 'ready',
    domainAssignment: { subdomain: sub, dnsStatus: 'pending' },
  };
}

/** Deterministic-looking TXT token for demo DNS records. */
export function verificationToken(fqdn: string, hue: number): string {
  const seed = fqdn + String(hue);
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(h, 31) + seed.charCodeAt(i)) >>> 0;
  }
  return `zp-verify-${h.toString(16).padStart(8, '0')}`;
}
