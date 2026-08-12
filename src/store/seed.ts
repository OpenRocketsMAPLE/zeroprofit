// Deterministic sample/demo seed data. Everything here is plainly sample —
// sample organizations are labeled "Sample data" in the UI and never claim
// real-world partners or metrics.

import type {
  Account,
  LinkItem,
  Member,
  Organization,
  PersistedState,
  Project,
  ScoreInputs,
  ScoreRow,
  VerificationState,
} from '../types';
import { buildScoreRow } from '../lib/scoring';
import { daysAgoIso, rngFor, round2 } from '../lib/rand';

export interface SampleOrg {
  org: Organization;
  ledger: ScoreRow[];
  projects: Project[];
  links: LinkItem[];
  members: Member[];
  isSample: true;
}

interface SampleDef {
  slug: string;
  name: string;
  tagline: string;
  category: Organization['category'];
  foundedYear: number;
  verified: boolean;
  hue: number;
  peak: number;
  description: string;
  projects: { title: string; kind: string; year: string; summary: string }[];
  links: { slug: string; targetUrl: string; clicks: number }[];
  members: { name: string; email: string; role: Member['role'] }[];
}

const SAMPLE_DEFS: SampleDef[] = [
  {
    slug: 'future-coders',
    name: 'Future Coders Collective',
    tagline: 'Teaching code to middle-schoolers across twelve cities.',
    category: 'technology',
    foundedYear: 2022,
    verified: true,
    hue: 210,
    peak: 0.95,
    description:
      'We run after-school coding clubs, mentor first-time hackers, and publish beginner-friendly tutorials in four languages.',
    projects: [
      { title: 'Hour of Code Locally', kind: 'event-series', year: '2025–26', summary: '60 workshops hosted in public libraries.' },
      { title: 'First Commit Zine', kind: 'publication', year: '2026', summary: 'A 40-page zine for first-time programmers.' },
    ],
    links: [
      { slug: 'volunteer', targetUrl: 'https://example.org/future-coders/volunteer', clicks: 1412 },
      { slug: 'curriculum', targetUrl: 'https://example.org/future-coders/curriculum', clicks: 968 },
    ],
    members: [
      { name: 'Amina K.', email: 'amina@example.org', role: 'owner' },
      { name: 'Lucas M.', email: 'lucas@example.org', role: 'admin' },
      { name: 'Priya S.', email: 'priya@example.org', role: 'member' },
    ],
  },
  {
    slug: 'green-roots',
    name: 'Green Roots Youth',
    tagline: 'Community gardens and climate education for teens.',
    category: 'environment',
    foundedYear: 2023,
    verified: true,
    hue: 130,
    peak: 0.88,
    description:
      'We restore community gardens, run composting workshops, and publish monthly climate explainers for young readers.',
    projects: [
      { title: 'Block-by-Block Gardens', kind: 'program', year: '2025', summary: '22 garden plots adopted across the district.' },
      { title: 'Compost 101', kind: 'workshop-series', year: '2026', summary: 'Hands-on composting for 300 students.' },
    ],
    links: [
      { slug: 'garden-map', targetUrl: 'https://example.org/green-roots/map', clicks: 1210 },
    ],
    members: [
      { name: 'Maya T.', email: 'maya@example.org', role: 'owner' },
      { name: 'Owen B.', email: 'owen@example.org', role: 'admin' },
    ],
  },
  {
    slug: 'paws-pals-rescue',
    name: 'Paws & Pals Rescue',
    tagline: 'Teen-run fostering and adoption outreach.',
    category: 'community',
    foundedYear: 2021,
    verified: true,
    hue: 25,
    peak: 0.8,
    description:
      'We coordinate teen foster families for shelter animals and run adoption-day events every month.',
    projects: [
      { title: 'Adoption Days', kind: 'event-series', year: '2025–26', summary: '14 adoption events, 90 animals adopted.' },
    ],
    links: [
      { slug: 'adopt', targetUrl: 'https://example.org/paws-pals/adopt', clicks: 2041 },
      { slug: 'foster', targetUrl: 'https://example.org/paws-pals/foster', clicks: 733 },
    ],
    members: [
      { name: 'Sofia R.', email: 'sofia@example.org', role: 'owner' },
      { name: 'Daniel P.', email: 'daniel@example.org', role: 'member' },
    ],
  },
  {
    slug: 'sciteens-lab',
    name: 'SciTeens Lab',
    tagline: 'Citizen science projects run by high-schoolers.',
    category: 'science',
    foundedYear: 2022,
    verified: false,
    hue: 190,
    peak: 0.72,
    description:
      'We design small citizen-science studies — water testing, bird counts, air quality — and publish open datasets.',
    projects: [
      { title: 'Creek Watch', kind: 'study', year: '2025', summary: 'Monthly water-quality samples at 9 sites.' },
    ],
    links: [],
    members: [
      { name: 'Jonah F.', email: 'jonah@example.org', role: 'owner' },
    ],
  },
  {
    slug: 'artbridge-studio',
    name: 'ArtBridge Studio',
    tagline: 'Youth murals and community art exhibitions.',
    category: 'arts',
    foundedYear: 2024,
    verified: false,
    hue: 330,
    peak: 0.62,
    description:
      'We paint murals with community partners and host quarterly exhibitions for teen artists.',
    projects: [
      { title: 'The Underpass Mural', kind: 'project', year: '2025', summary: 'A 60-meter mural painted with 40 teen artists.' },
    ],
    links: [
      { slug: 'exhibition', targetUrl: 'https://example.org/artbridge/exhibition', clicks: 412 },
    ],
    members: [
      { name: 'Noor A.', email: 'noor@example.org', role: 'owner' },
      { name: 'Elif D.', email: 'elif@example.org', role: 'admin' },
    ],
  },
  {
    slug: 'wellness-warriors',
    name: 'Wellness Warriors',
    tagline: 'Peer mental-health first aid for schools.',
    category: 'health',
    foundedYear: 2023,
    verified: false,
    hue: 260,
    peak: 0.55,
    description:
      'We train teen peer supporters, run calm-down corners, and advocate for school wellness policies.',
    projects: [
      { title: 'Peer Support Pilot', kind: 'program', year: '2025–26', summary: '40 trained peer supporters in 6 schools.' },
    ],
    links: [],
    members: [
      { name: 'Grace L.', email: 'grace@example.org', role: 'owner' },
    ],
  },
  {
    slug: 'booknest-readers',
    name: 'BookNest Readers',
    tagline: 'Little free libraries and reading buddies.',
    category: 'education',
    foundedYear: 2024,
    verified: false,
    hue: 45,
    peak: 0.5,
    description:
      'We build and stock little free libraries and pair older readers with younger ones after school.',
    projects: [],
    links: [
      { slug: 'library-map', targetUrl: 'https://example.org/booknest/map', clicks: 289 },
    ],
    members: [
      { name: 'Rosa G.', email: 'rosa@example.org', role: 'owner' },
    ],
  },
];

function sampleInputs(seedKey: string, i: number, peak: number): ScoreInputs {
  const r = rngFor(seedKey, 'inputs', String(i));
  return {
    services: {
      forumPosts: Math.round((4 + i * 1.5 + r() * 3) * peak),
      gems: Math.round((60 + i * 20 + r() * 40) * peak),
      pressContributions: Math.round((1 + (i > 12 ? 1 : 0)) * peak),
      forumActivityMinutes: Math.round((200 + i * 25 + r() * 50) * peak),
    },
    ads: {
      adImpressions: Math.round((2000 + i * 900 + r() * 2000) * peak),
      adCtrPct: round2((0.8 + i * 0.06 + r() * 0.3) * peak),
    },
    links: {
      linkClicks: Math.round((120 + i * 55 + r() * 90) * peak),
      activeLinks: 3 + (i > 5 ? 1 : 0) + (i > 14 ? 1 : 0),
    },
    social: {
      followers: Math.round((90 + i * 22 + r() * 40) * peak),
      growthPct: round2(0.04 + r() * 0.05),
    },
  };
}

const ROWS = 24;
const INTERVAL_DAYS = 7;

/** Deterministic append-only ledger: 24 weekly score rows ending today. */
export function buildLedger(orgId: string, seedKey: string, peak: number): ScoreRow[] {
  const rows: ScoreRow[] = [];
  let parent: string | null = null;
  for (let i = 0; i < ROWS; i++) {
    const periodEnd = daysAgoIso((ROWS - 1 - i) * INTERVAL_DAYS);
    const periodStart = daysAgoIso((ROWS - 1 - i) * INTERVAL_DAYS + INTERVAL_DAYS);
    const inputs = sampleInputs(seedKey, i, peak);
    const row = buildScoreRow({
      orgId,
      periodStart,
      periodEnd,
      inputs,
      parentId: parent,
    });
    rows.push(row);
    parent = row.id;
  }
  rows[rows.length - 1].replaced = false;
  for (let i = 0; i < rows.length - 1; i++) rows[i].replaced = true;
  return rows;
}

function verificationFor(verified: boolean): VerificationState {
  return verified
    ? { status: 'approved', submittedAt: '2026-05-14T09:00:00.000Z', evidence: ['sample'], criteriaVersion: 1 }
    : { status: 'none', evidence: [], criteriaVersion: 1 };
}

function buildSampleOrg(def: SampleDef): SampleOrg {
  const orgId = `sample_${def.slug}`;
  const org: Organization = {
    id: orgId,
    slug: def.slug,
    name: def.name,
    tagline: def.tagline,
    description: def.description,
    category: def.category,
    foundedYear: def.foundedYear,
    logoHue: def.hue,
    status: 'active',
    createdAt: `${def.foundedYear}-01-15T00:00:00.000Z`,
    verification: verificationFor(def.verified),
    profileFlags: { team: true, projects: true, links: true },
  };
  return {
    org,
    ledger: buildLedger(orgId, def.slug, def.peak),
    projects: def.projects.map((p) => ({ id: `p_${def.slug}_${p.title.toLowerCase().replace(/\W+/g, '-')}`, ...p })),
    links: def.links.map((l) => ({
      id: `l_${def.slug}_${l.slug}`,
      slug: l.slug,
      targetUrl: l.targetUrl,
      status: 'active' as const,
      clicks: l.clicks,
      createdAt: '2026-04-21T00:00:00.000Z',
    })),
    members: def.members.map((m) => ({
      id: `m_${def.slug}_${m.email.split('@')[0]}`,
      name: m.name,
      email: m.email,
      role: m.role,
      status: 'active' as const,
    })),
    isSample: true,
  };
}

export const SAMPLE_ORGS: SampleOrg[] = SAMPLE_DEFS.map(buildSampleOrg);

export function allSampleSlugs(): string[] {
  return SAMPLE_ORGS.map((s) => s.org.slug);
}

export function findSampleBySlug(slug: string): SampleOrg | undefined {
  return SAMPLE_ORGS.find((s) => s.org.slug === slug);
}

export function latestScore(ledger: ScoreRow[]): ScoreRow | undefined {
  return [...ledger].sort((a, b) => (a.periodEnd < b.periodEnd ? -1 : 1))[ledger.length - 1];
}

/** Seed ledger for a newly created user organization (plainly demo data). */
export function userLedgerSeed(orgId: string): ScoreRow[] {
  return buildLedger(orgId, `user:${orgId}`, 0.55);
}

/** Deterministic next-day continuation inputs for the demo "Recompute" action. */
export function nextUserInputs(prev: ScoreInputs | null, orgId: string): ScoreInputs {
  const r = rngFor(orgId, 'next', new Date().toISOString().slice(0, 10));
  if (!prev) return sampleInputs(`user:${orgId}`, ROWS - 1, 0.55);
  const grow = (k: string, src: Record<string, number>, amt: number, jitter: number) =>
    Math.round((src[k] ?? 0) + amt * (0.6 + r() * 0.8) + r() * jitter);
  return {
    services: {
      forumPosts: grow('forumPosts', prev.services, 1.2, 2),
      gems: grow('gems', prev.services, 18, 20),
      pressContributions: grow('pressContributions', prev.services, 0, 1),
      forumActivityMinutes: grow('forumActivityMinutes', prev.services, 20, 30),
    },
    ads: {
      adImpressions: grow('adImpressions', prev.ads, 700, 400),
      adCtrPct: round2((prev.ads.adCtrPct ?? 0.8) + r() * 0.06),
    },
    links: {
      linkClicks: grow('linkClicks', prev.links, 40, 20),
      activeLinks: prev.links.activeLinks ?? 3,
    },
    social: {
      followers: grow('followers', prev.social, 16, 10),
      growthPct: round2(0.03 + r() * 0.05),
    },
  };
}

export function defaultAccount(): Account | null {
  return null;
}

export function defaultState(): PersistedState {
  return {
    version: 1,
    account: null,
    org: null,
    members: [],
    projects: [],
    links: [],
    scoreLedger: [],
    widgets: [],
    activities: [],
    netlify: { status: 'not_connected', sites: [] },
    domains: [],
    waitlist: [],
  };
}
