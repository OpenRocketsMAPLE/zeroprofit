// Local-first persisted store. All platform state lives in localStorage behind
// a small subscribe/commit store (React reads it via useSyncExternalStore).
// Invariants enforced here match product-architecture.md §5.2:
//   O1 one organization per account · O2 exactly one owner · O3 one open
//   verification request · O4 append-only score ledger · O11 slug rules

import type {
  Account,
  ActivityEntry,
  ActivityKind,
  Category,
  DomainRecord,
  LinkItem,
  Member,
  Organization,
  PersistedState,
  ScoreRow,
  WidgetInstance,
  WidgetType,
} from '../types';
import {
  allSampleSlugs,
  defaultState,
  nextUserInputs,
  userLedgerSeed,
} from './seed';
import { demoNetlifySite, verificationToken } from '../lib/adapters';
import { buildScoreRow } from '../lib/scoring';
import { isoNow, uid } from '../lib/rand';
import { checkDomain } from '../lib/validation';
import { slugAvailable } from '../lib/slug';

const KEY = 'zeroprofit.state.v1';

function load(): PersistedState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedState;
      if (parsed && parsed.version === 1) return parsed;
    }
  } catch {
    /* corrupted storage → fresh state */
  }
  return defaultState();
}

let state: PersistedState = load();
const listeners = new Set<() => void>();

export function getState(): PersistedState {
  return state;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function save(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full/unavailable — demo keeps working in memory */
  }
}

function commit(mutator: (s: PersistedState) => PersistedState): void {
  state = mutator(state);
  save();
  listeners.forEach((fn) => fn());
}

function pushActivity(s: PersistedState, text: string, kind: ActivityKind): ActivityEntry[] {
  const entry: ActivityEntry = { id: uid('act'), at: isoNow(), text, kind };
  return [entry, ...s.activities].slice(0, 40);
}

export function resetDemo(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
  state = defaultState();
  listeners.forEach((fn) => fn());
}

export function clearStorageKey(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}

// ---------------------------------------------------------------------------
// Account
// ---------------------------------------------------------------------------

export interface SignInInput {
  name: string;
  email: string;
  country: string;
  dob: string;
  consentTier: Account['consentTier'];
  guardian?: { name: string; email: string; relationship: string };
}

export function signIn(input: SignInInput): void {
  const existing =
    state.account && state.account.email.toLowerCase() === input.email.trim().toLowerCase()
      ? state.account
      : null;
  commit((s) => ({
    ...s,
    account: existing ?? {
      id: uid('acct'),
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      avatarHue: Math.floor(Math.random() * 360),
      country: input.country,
      dob: input.dob,
      consentTier: input.consentTier,
      guardian: input.guardian,
      joinedAt: isoNow(),
    },
  }));
}

export function signOut(): void {
  commit((s) => ({ ...s, account: null }));
}

export function updateAccountProfile(patch: { name?: string; avatarHue?: number }): void {
  if (!state.account) return;
  commit((s) => ({ ...s, account: s.account ? { ...s.account, ...patch } : null }));
}

// ---------------------------------------------------------------------------
// Organization (O1: one created org per account; closed org frees the slot)
// ---------------------------------------------------------------------------

export interface CreateOrgInput {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: Category;
  foundedYear: number;
  logoHue?: number;
}

export type ActionResult = { ok: true } | { ok: false; error: string };

export function createOrg(input: CreateOrgInput): ActionResult {
  const s = getState();
  if (s.org && s.org.status !== 'closed') {
    return { ok: false, error: 'One organization per account. Close your current ZPO before creating another.' };
  }
  const slug = input.slug.trim().toLowerCase();
  const taken = [...allSampleSlugs(), ...(s.org && s.org.status !== 'closed' ? [s.org.slug] : [])];
  if (!slugAvailable(slug, taken)) {
    return { ok: false, error: 'This label name is unavailable or invalid.' };
  }
  const orgId = uid('org');
  const org: Organization = {
    id: orgId,
    slug,
    name: input.name.trim(),
    tagline: input.tagline.trim(),
    description: input.description.trim(),
    category: input.category,
    foundedYear: input.foundedYear,
    logoHue: input.logoHue ?? Math.floor(Math.random() * 360),
    status: 'active',
    createdAt: isoNow(),
    verification: { status: 'none', evidence: [], criteriaVersion: 1 },
    profileFlags: { team: true, projects: true, links: true },
  };
  const owner: Member = {
    id: uid('mem'),
    name: s.account?.name ?? 'Owner',
    email: s.account?.email ?? 'owner@local.demo',
    role: 'owner',
    status: 'active',
  };
  commit((st) => ({
    ...st,
    org,
    members: [owner],
    scoreLedger: userLedgerSeed(orgId),
    projects: [],
    links: [],
    widgets: [],
    domains: [],
    netlify: { status: 'not_connected', sites: [] },
    activities: pushActivity(st, `Claimed your ZPO: ${org.name} (${org.slug}.zeroprofit.org)`, 'system'),
  }));
  return { ok: true };
}

export function updateOrg(
  patch: Partial<Pick<Organization, 'name' | 'slug' | 'tagline' | 'description' | 'category' | 'foundedYear' | 'logoHue'>>,
): void {
  if (!state.org) return;
  commit((s) =>
    s.org
      ? {
          ...s,
          org: { ...s.org, ...patch },
          activities: pushActivity(s, 'Updated your ZPO profile', 'system'),
        }
      : s,
  );
}

export function closeOrg(): ActionResult {
  if (!state.org) return { ok: false, error: 'No organization to close.' };
  commit((s) =>
    s.org
      ? {
          ...s,
          org: { ...s.org, status: 'closed' },
          activities: pushActivity(s, `Closed ${s.org.name}. Your slot is free for a new ZPO.`, 'system'),
        }
      : s,
  );
  return { ok: true };
}

export function transferOwnership(newOwnerId: string): ActionResult {
  const s = getState();
  const target = s.members.find((m) => m.id === newOwnerId && m.status === 'active');
  if (!target) return { ok: false, error: 'That member is not active.' };
  if (target.role === 'owner') return { ok: false, error: 'That member already owns the organization.' };
  const owner = s.members.find((m) => m.role === 'owner');
  commit((st) => ({
    ...st,
    members: st.members.map((m) =>
      m.id === newOwnerId
        ? { ...m, role: 'owner' }
        : owner && m.id === owner.id
          ? { ...m, role: 'admin' }
          : m,
    ),
    activities: pushActivity(st, `Ownership transferred to ${target.name}`, 'team'),
  }));
  return { ok: true };
}

export function setProfileFlag(key: keyof Organization['profileFlags'], value: boolean): void {
  if (!state.org) return;
  commit((s) =>
    s.org
      ? {
          ...s,
          org: { ...s.org, profileFlags: { ...s.org.profileFlags, [key]: value } },
          activities: pushActivity(s, `Profile visibility: ${key} ${value ? 'shown' : 'hidden'}`, 'system'),
        }
      : s,
  );
}

// ---------------------------------------------------------------------------
// Team (O2: exactly one owner; owner cannot be removed or demoted)
// ---------------------------------------------------------------------------

export function addMember(name: string, email: string, role: Member['role']): ActionResult {
  const s = getState();
  const norm = email.trim().toLowerCase();
  if (!s.org) return { ok: false, error: 'Create your ZPO first.' };
  if (!name.trim()) return { ok: false, error: 'Name is required.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(norm)) return { ok: false, error: 'Enter a valid email address.' };
  const taken = s.members.some((m) => m.email.toLowerCase() === norm && m.status !== 'removed');
  if (taken) return { ok: false, error: 'That person is already a member or has a pending invite.' };
  commit((st) => ({
    ...st,
    members: [
      ...st.members,
      {
        id: uid('mem'),
        name: name.trim(),
        email: norm,
        role,
        status: 'invited',
        invitedAt: isoNow(),
        invitedBy: st.account?.name,
        token: `zp_${Math.random().toString(36).slice(2, 12)}`,
      },
    ],
    activities: pushActivity(st, `Invited ${name.trim()} as ${role}`, 'team'),
  }));
  return { ok: true };
}

export function setMemberRole(id: string, role: Member['role']): ActionResult {
  const s = getState();
  const member = s.members.find((m) => m.id === id);
  if (!member) return { ok: false, error: 'Member not found.' };
  if (member.role === 'owner') return { ok: false, error: 'The owner cannot be demoted. Transfer ownership first.' };
  const owner = s.members.find((m) => m.role === 'owner');
  commit((st) => ({
    ...st,
    members: st.members.map((m) =>
      m.id === id
        ? { ...m, role, status: m.status === 'invited' ? 'invited' : 'active' }
        : role === 'owner' && owner && m.id === owner.id
          ? { ...m, role: 'admin' }
          : m,
    ),
    activities: pushActivity(st, `Role of ${member.name} changed to ${role}`, 'team'),
  }));
  return { ok: true };
}

export function removeMember(id: string): ActionResult {
  const s = getState();
  const member = s.members.find((m) => m.id === id);
  if (!member) return { ok: false, error: 'Member not found.' };
  if (member.role === 'owner') return { ok: false, error: 'The owner cannot be removed. Transfer ownership first.' };
  commit((st) => ({
    ...st,
    members: st.members.map((m) => (m.id === id ? { ...m, status: 'removed' } : m)),
    activities: pushActivity(st, `Removed ${member.name} from the team`, 'team'),
  }));
  return { ok: true };
}

export function revokeInvite(id: string): void {
  commit((s) => ({
    ...s,
    members: s.members.filter((m) => m.id !== id),
    activities: pushActivity(s, 'Invitation revoked', 'team'),
  }));
}

// ---------------------------------------------------------------------------
// Catalog (projects / releases)
// ---------------------------------------------------------------------------

export function addProject(project: { title: string; kind: string; year: string; summary: string }): ActionResult {
  if (!project.title.trim()) return { ok: false, error: 'A title is required.' };
  commit((s) => ({
    ...s,
    projects: [{ id: uid('prj'), title: project.title.trim(), kind: project.kind.trim() || 'project', year: project.year.trim(), summary: project.summary.trim() }, ...s.projects],
    activities: pushActivity(s, `Added catalog entry: ${project.title.trim()}`, 'system'),
  }));
  return { ok: true };
}

export function removeProject(id: string): void {
  commit((s) => ({
    ...s,
    projects: s.projects.filter((p) => p.id !== id),
    activities: pushActivity(s, 'Removed a catalog entry', 'system'),
  }));
}

// ---------------------------------------------------------------------------
// ZeroProfit Links
// ---------------------------------------------------------------------------

export function addLink(slug: string, targetUrl: string): ActionResult {
  const s = getState();
  const norm = slug.trim().toLowerCase();
  if (!/^[a-z0-9-]{2,40}$/.test(norm) || /^-|-$/.test(norm) || /-{2,}/.test(norm)) {
    return { ok: false, error: 'Short link name must be 2–40 lowercase letters, numbers, or hyphens (no edges/doubles).' };
  }
  if (s.links.some((l) => l.slug === norm)) return { ok: false, error: 'That short link already exists.' };
  if (!/^https:\/\//.test(targetUrl.trim())) return { ok: false, error: 'Only https:// destinations are allowed.' };
  const item: LinkItem = {
    id: uid('lnk'),
    slug: norm,
    targetUrl: targetUrl.trim(),
    status: 'active',
    clicks: 0,
    createdAt: isoNow(),
  };
  commit((st) => ({
    ...st,
    links: [item, ...st.links],
    activities: pushActivity(st, `Created link zeroprofit.org/link/${norm}`, 'service'),
  }));
  return { ok: true };
}

export function updateLink(id: string, patch: Partial<Pick<LinkItem, 'status' | 'targetUrl' | 'slug'>>): void {
  commit((s) => ({
    ...s,
    links: s.links.map((l) => (l.id === id ? { ...l, ...patch } : l)),
  }));
}

export function removeLink(id: string): void {
  commit((s) => ({
    ...s,
    links: s.links.filter((l) => l.id !== id),
    activities: pushActivity(s, 'Deleted a short link', 'service'),
  }));
}

export function recordLinkClick(id: string): void {
  commit((s) => ({
    ...s,
    links: s.links.map((l) => (l.id === id ? { ...l, clicks: l.clicks + 1 } : l)),
  }));
}

// ---------------------------------------------------------------------------
// Widgets
// ---------------------------------------------------------------------------

export const WIDGET_DEFAULTS: Record<WidgetType, Record<string, unknown>> = {
  clock: { format24: true, label: 'Club time' },
  score_badge: { showTier: true, theme: 'navy', size: 'md' },
  impact_ticker: { speedMs: 4000, theme: 'paper' },
  impact_game: { durationSec: 30, theme: 'navy' },
};

export function addWidget(type: WidgetType, name: string): void {
  commit((s) => ({
    ...s,
    widgets: [...s.widgets, { id: uid('wgt'), type, name: name.trim() || type, enabled: true, config: { ...WIDGET_DEFAULTS[type] } }],
    activities: pushActivity(s, `Added widget: ${name.trim() || type}`, 'widget'),
  }));
}

export function updateWidget(id: string, patch: Partial<Pick<WidgetInstance, 'name' | 'enabled' | 'config'>>): void {
  commit((s) => ({
    ...s,
    widgets: s.widgets.map((w) => (w.id === id ? { ...w, ...patch, config: patch.config ? { ...w.config, ...patch.config } : w.config } : w)),
  }));
}

export function removeWidget(id: string): void {
  commit((s) => ({
    ...s,
    widgets: s.widgets.filter((w) => w.id !== id),
    activities: pushActivity(s, 'Removed a widget', 'widget'),
  }));
}

// ---------------------------------------------------------------------------
// Verification (G5/O10: never auto-issued; demo only records the submission)
// ---------------------------------------------------------------------------

export function submitVerification(evidence: string[]): ActionResult {
  const s = getState();
  if (!s.org) return { ok: false, error: 'Create your ZPO first.' };
  if (s.org.verification.status === 'submitted' || s.org.verification.status === 'in_review') {
    return { ok: false, error: 'You already have an open verification request.' };
  }
  if (evidence.length === 0) return { ok: false, error: 'Attach at least one piece of evidence.' };
  commit((st) =>
    st.org
      ? {
          ...st,
          org: {
            ...st.org,
            verification: {
              status: 'submitted',
              submittedAt: isoNow(),
              evidence,
              criteriaVersion: 1,
            },
          },
          activities: pushActivity(st, 'Verification request submitted — pending human review', 'verification'),
        }
      : st,
  );
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Score ledger (O4: append-only; recompute inserts a new row)
// ---------------------------------------------------------------------------

export function appendScoreRow(): ScoreRow {
  const s = getState();
  const prev = s.scoreLedger[s.scoreLedger.length - 1];
  const inputs = nextUserInputs(prev?.inputsSnapshot ?? null, s.org?.id ?? 'org');
  const today = new Date().toISOString().slice(0, 10);
  const row = buildScoreRow({
    orgId: s.org?.id ?? 'org',
    periodStart: today,
    periodEnd: today,
    computedAt: isoNow(),
    inputs,
    parentId: prev?.id ?? null,
  });
  commit((st) => ({
    ...st,
    scoreLedger: [
      ...st.scoreLedger.map((r) => (r.id === prev?.id ? { ...r, replaced: true } : r)),
      row,
    ],
    activities: pushActivity(st, 'Score recomputed (local demo — no production data)', 'score'),
  }));
  return row;
}

// ---------------------------------------------------------------------------
// Netlify / DNS (credential-dependent → honest local demo states only)
// ---------------------------------------------------------------------------

export function connectNetlifyDemo(): void {
  const slug = state.org?.slug ?? 'myclub';
  commit((s) => ({
    ...s,
    netlify: {
      status: 'connected_demo',
      accountName: 'Simulated Netlify account (no real credentials)',
      connectedAt: isoNow(),
      sites: [demoNetlifySite(slug)],
    },
    activities: pushActivity(s, 'Netlify connected (local demo simulation)', 'domain'),
  }));
}

export function disconnectNetlify(): void {
  commit((s) => ({
    ...s,
    netlify: { status: 'not_connected', sites: [] },
    activities: pushActivity(s, 'Netlify disconnected', 'domain'),
  }));
}

export function syncNetlifySites(): void {
  commit((s) => ({
    ...s,
    activities: pushActivity(s, 'Netlify sites synced (local demo)', 'domain'),
  }));
}

export function triggerDeploy(siteId: string): void {
  commit((s) => ({
    ...s,
    netlify: {
      ...s.netlify,
      sites: s.netlify.sites.map((site) => (site.id === siteId ? { ...site, deployState: 'building' } : site)),
    },
  }));
  window.setTimeout(() => {
    commit((st) => ({
      ...st,
      netlify: {
        ...st.netlify,
        sites: st.netlify.sites.map((site) => (site.id === siteId ? { ...site, deployState: 'ready' } : site)),
      },
      activities: pushActivity(st, 'Deploy completed (local demo)', 'domain'),
    }));
  }, 1500);
}

export function addDomain(fqdn: string): ActionResult {
  const s = getState();
  const err = checkDomain(fqdn);
  if (err) return { ok: false, error: err };
  const norm = fqdn.trim().toLowerCase();
  if (s.domains.some((d) => d.fqdn === norm)) return { ok: false, error: 'That domain is already tracked.' };
  const record: DomainRecord = {
    id: uid('dns'),
    fqdn: norm,
    target: 'netlify-demo.global.ssl.fastly.net',
    provider: 'manual',
    status: 'pending_verified',
    verificationToken: verificationToken(norm, state.org?.logoHue ?? 210),
  };
  commit((st) => ({
    ...st,
    domains: [...st.domains, record],
    activities: pushActivity(st, `Tracking domain ${norm} (pending DNS verification)`, 'domain'),
  }));
  return { ok: true };
}

export function removeDomain(id: string): void {
  commit((s) => ({
    ...s,
    domains: s.domains.filter((d) => d.id !== id),
  }));
}

/** Local demo DNS check: flips pending → verified (clearly labeled simulation). */
export function checkDomains(): void {
  commit((s) => ({
    ...s,
    domains: s.domains.map((d) =>
      d.status === 'pending_verified'
        ? { ...d, status: 'verified', checkedAt: isoNow() }
        : d,
    ),
    activities: pushActivity(s, 'DNS check run (local demo — simulated verification)', 'domain'),
  }));
}

// ---------------------------------------------------------------------------
// Waitlist & misc
// ---------------------------------------------------------------------------

export function addWaitlist(email: string, orgName: string): ActionResult {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return { ok: false, error: 'Enter a valid email address.' };
  commit((s) => ({
    ...s,
    waitlist: [...s.waitlist, { email: email.trim().toLowerCase(), orgName: orgName.trim(), at: isoNow() }].slice(-50),
  }));
  return { ok: true };
}
