import { beforeEach, describe, expect, it } from 'vitest';
import { getState, resetDemo, signIn, createOrg, closeOrg, addMember, setMemberRole, removeMember, revokeInvite, appendScoreRow, submitVerification, addWidget, updateWidget, removeWidget, addLink, addWaitlist } from '../src/store/store';

function setupAccount(): void {
  signIn({ name: 'Demo Owner', email: 'owner@demo.org', country: 'US', dob: '2006-01-01', consentTier: 'general' });
}

function makeOrg(): void {
  setupAccount();
  const res = createOrg({ name: 'Demo Club', slug: 'demo-club', tagline: 'A demo club', description: 'd', category: 'education', foundedYear: 2024 });
  expect(res.ok).toBe(true);
}

beforeEach(() => {
  resetDemo();
});

describe('createOrg — invariant O1 (one org per account)', () => {
  it('creates an organization with seeded ledger and owner', () => {
    makeOrg();
    const s = getState();
    expect(s.org?.name).toBe('Demo Club');
    expect(s.org?.slug).toBe('demo-club');
    expect(s.org?.status).toBe('active');
    expect(s.scoreLedger.length).toBeGreaterThan(10);
    expect(s.members.filter((m) => m.role === 'owner').length).toBe(1);
  });

  it('rejects a second organization while one is open', () => {
    makeOrg();
    const res = createOrg({ name: 'Second Club', slug: 'second-club', tagline: 't', description: 'd', category: 'other', foundedYear: 2025 });
    expect(res.ok).toBe(false);
  });

  it('rejects a taken slug (sample data included)', () => {
    setupAccount();
    const res = createOrg({ name: 'Future Coders Collective', slug: 'future-coders', tagline: 't', description: 'd', category: 'education', foundedYear: 2024 });
    expect(res.ok).toBe(false);
  });

  it('frees the slot after closing, and keeps the ledger', () => {
    makeOrg();
    const ledgerLen = getState().scoreLedger.length;
    expect(closeOrg().ok).toBe(true);
    expect(getState().org?.status).toBe('closed');
    expect(getState().scoreLedger.length).toBe(ledgerLen); // append-only
    const res = createOrg({ name: 'Fresh Club', slug: 'fresh-club', tagline: 't', description: 'd', category: 'community', foundedYear: 2025 });
    expect(res.ok).toBe(true);
    expect(getState().org?.name).toBe('Fresh Club');
  });
});

describe('team — invariant O2 (one owner, owner protected)', () => {
  it('adds an invite, rejects duplicates', () => {
    makeOrg();
    expect(addMember('Sam Helper', 'sam@demo.org', 'member').ok).toBe(true);
    expect(addMember('Sam Again', 'sam@demo.org', 'admin').ok).toBe(false);
    expect(getState().members.filter((m) => m.email === 'sam@demo.org').length).toBe(1);
  });

  it('cannot demote or remove the owner', () => {
    makeOrg();
    const owner = getState().members.find((m) => m.role === 'owner')!;
    expect(setMemberRole(owner.id, 'member').ok).toBe(false);
    expect(removeMember(owner.id).ok).toBe(false);
  });

  it('revoking an invite removes the pending member', () => {
    makeOrg();
    addMember('Invitee', 'invitee@demo.org', 'viewer');
    const inv = getState().members.find((m) => m.email === 'invitee@demo.org')!;
    expect(inv.status).toBe('invited');
    revokeInvite(inv.id);
    expect(getState().members.find((m) => m.id === inv.id)).toBeUndefined();
  });
});

describe('score ledger — invariant O4 (append-only recompute)', () => {
  it('appends a new row and marks the previous latest as replaced', () => {
    makeOrg();
    const before = getState().scoreLedger;
    const lastBefore = before[before.length - 1];
    expect(lastBefore.replaced).toBe(false);
    const row = appendScoreRow();
    const after = getState().scoreLedger;
    expect(after.length).toBe(before.length + 1);
    expect(after[after.length - 1].id).toBe(row.id);
    expect(after.find((r) => r.id === lastBefore.id)?.replaced).toBe(true);
  });
});

describe('verification — G5/O10 (never auto-issued)', () => {
  it('records a submission but never approves', () => {
    makeOrg();
    expect(submitVerification([]).ok).toBe(false); // needs evidence
    expect(submitVerification(['proof.pdf']).ok).toBe(true);
    const ver = getState().org!.verification;
    expect(ver.status).toBe('submitted');
    expect(ver.evidence).toEqual(['proof.pdf']);
    expect(submitVerification(['more.pdf']).ok).toBe(false); // one open request
    expect(getState().org!.verification.status).not.toBe('approved');
  });
});

describe('widgets & links', () => {
  it('adds, toggles, and removes widgets', () => {
    makeOrg();
    addWidget('clock', 'My clock');
    const w = getState().widgets[0];
    expect(w.enabled).toBe(true);
    updateWidget(w.id, { enabled: false, config: { format24: false } });
    const updated = getState().widgets[0];
    expect(updated.enabled).toBe(false);
    expect(updated.config.format24).toBe(false);
    removeWidget(w.id);
    expect(getState().widgets.length).toBe(0);
  });

  it('validates links (https only, unique slugs)', () => {
    makeOrg();
    expect(addLink('volunteer', 'http://insecure.example').ok).toBe(false);
    expect(addLink('volunteer', 'https://example.org/v').ok).toBe(true);
    expect(addLink('volunteer', 'https://example.org/v2').ok).toBe(false);
    expect(addLink('BAD SLUG!', 'https://example.org/x').ok).toBe(false);
  });

  it('stores waitlist entries', () => {
    expect(addWaitlist('a@b.org', 'Club').ok).toBe(true);
    expect(addWaitlist('nope', 'Club').ok).toBe(false);
  });
});
