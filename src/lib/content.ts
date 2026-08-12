// Public marketing + product copy. Verbatim messaging themes come from the
// read-only audit of zeroprofit.org (source-audit.md §1.2/§1.3); platform
// mechanics (IFS weights, tiers, anti-gaming) come from product-architecture.md §8.

import type { PillarKey, ServiceState } from '../types';

export const BRAND = {
  name: 'ZeroProfit',
  wordmark: 'ZERO PROFIT',
  domain: 'zeroprofit.org',
  appDomain: 'app.zeroprofit.org',
  tagline: 'Network for teen nonprofits',
};

export const HERO = {
  eyebrow: 'A record label for real impact',
  headline: 'NETWORK FOR TEEN NONPROFITS THAT ARE CHANGING THE WORLD.',
  sub: 'Giving real value to REAL impact.',
  body:
    'ZeroProfit gives youth-led nonprofits founded by students under 19 a label page of their own — a ZPO — ' +
    'with a public Impact Factor Score, a catalog of impact, and infrastructure that separates genuine ' +
    'community impact from paper organizations.',
  ctaPrimary: { label: 'Claim your ZPO', to: '/register' },
  ctaSecondary: { label: 'See the leaderboard', to: '/impact' },
};

export const IDENTITY = {
  eyebrow: 'The ZPO identity',
  headline: 'A record label for nonprofits.',
  paragraphs: [
    'A record label does not run the band. It gives the band an identity, a catalog, an audience, and the infrastructure to release work into the world.',
    'ZeroProfit does the same for youth-led nonprofits. Each organization receives a label page — its ZPO — with its own subdomain, an impact catalog, a team, and a public score that grows as real work is done.',
    'Every ZPO is public, continuous, and accountable. That is how genuine community impact becomes visible — and how paper organizations fade.',
  ],
};

export const FREE_BLOCK = {
  eyebrow: 'Pricing',
  headline: 'Completely free. On purpose.',
  statement: 'ZeroProfit is completely free for nonprofit organizations.',
  body:
    'No subscriptions, no tiers, no surprise invoices. ZeroProfit is sustained through the OpenRockets Inc. ' +
    'and stays free for every youth-led nonprofit on the network — today and as the network grows.',
  cta: { label: 'See what every ZPO gets', to: '/free' },
};

export interface ServiceInfo {
  id: string;
  title: string;
  state: ServiceState;
  tagline: string;
  body: string;
  scope?: string;
}

export const SERVICES: ServiceInfo[] = [
  {
    id: 'domain',
    title: 'Domain Registration',
    state: 'available_now',
    tagline: 'Your club, at home.',
    body: 'Every ZPO gets its own subdomain — yourclub.zeroprofit.org — ready the moment your label page goes live.',
  },
  {
    id: 'email',
    title: 'Email Hosting',
    state: 'available_now',
    tagline: 'A 5 GB inbox for your club.',
    body: 'A hosted 5 GB email inbox for every nonprofit on the network, with privacy rules built for minors.',
  },
  {
    id: 'links',
    title: 'ZeroProfit Links',
    state: 'available_now',
    tagline: 'Short links that prove reach.',
    body: 'Tracked, bot-resistant short links at zeroprofit.org/link/ — tier-capped, with aggregate public counts.',
  },
  {
    id: 'forums',
    title: 'OpenRockets Forums',
    state: 'rolling_deployment',
    tagline: 'A home for your community.',
    body: 'Your club’s space at forum.openrockets.com/yourclub, with Gems ranking that feeds your Impact Factor Score.',
    scope: 'Rolling deployment — club by club, no fixed date.',
  },
  {
    id: 'press',
    title: 'OpenRockets Press',
    state: 'rolling_deployment',
    tagline: 'Publishing that protects youth IP.',
    body: 'Youth publishing with compliant workflows for minors and families — submissions, moderation, and permanent records.',
    scope: 'Rolling deployment — no fixed date.',
  },
  {
    id: 'adshares',
    title: 'Ad Shares Network',
    state: 'rolling_deployment',
    tagline: 'A closed nonprofit ad network.',
    body: 'Ad impressions from a closed nonprofit network (adshares.openrockets.com) count toward your Impact Factor Score.',
    scope: 'Rolling deployment — no fixed date.',
  },
];

export const SERVICE_STATE_LABELS: Record<ServiceState, string> = {
  available_now: 'Available Now',
  rolling_deployment: 'Rolling Deployment',
};

export const PILLAR_DESCRIPTIONS: Record<PillarKey, string> = {
  services: 'Integrated services: forums activity, Press contributions, and platform participation — up to 30% of the score.',
  ads: 'Ad Shares Network: impressions from the closed nonprofit ad network — up to 30% of the score.',
  links: 'ZeroProfit Links: reach of your tracked short links — up to 10% of the score.',
  social: 'Social verification: follower growth snapshots from your club’s socials — config-driven percentage of the score.',
};

export const TIERS_EXPLAINED = [
  { name: 'Emerging', min: 0, note: 'Every verified club starts here.' },
  { name: 'Rising', min: 25, note: 'Early, consistent activity.' },
  { name: 'Established', min: 50, note: 'Verified activity at scale.' },
  { name: 'Distinguished', min: 75, note: 'Regional standout.' },
  { name: 'Legendary', min: 90, note: 'Network-leading impact.' },
];

export const HOW_STEPS = [
  {
    n: '01',
    title: 'Claim your label page',
    body: 'Create your ZPO in minutes: name, slug, category, and founding story. One organization per account.',
  },
  {
    n: '02',
    title: 'Build your team',
    body: 'Invite club officers with roles — owner, admin, member, viewer — and keep the page accountable.',
  },
  {
    n: '03',
    title: 'Earn your Impact Factor',
    body: 'Forums, links, ads, and social activity feed a public, anti-gaming score updated on a fixed schedule.',
  },
  {
    n: '04',
    title: 'Go live',
    body: 'Publish your label page at yourclub.zeroprofit.org and embed your impact widgets anywhere — free, always.',
  },
];

export const FAQS = [
  {
    q: 'What is a ZPO?',
    a: 'A ZPO — ZeroProfit Organization — is the record-label-style identity page every youth nonprofit receives: its own subdomain, impact catalog, team, and public score. Think of it as the artist page a record label gives its band.',
  },
  {
    q: 'Is ZeroProfit really free?',
    a: 'Yes. ZeroProfit is completely free for nonprofit organizations — no subscriptions, no invoices. The platform is sustained through the OpenRockets Inc.',
  },
  {
    q: 'Who can join?',
    a: 'Youth-led nonprofits founded by students under 19. Age gates and guardian consent (COPPA / GDPR) are part of registration — youth-led is a product rule, not just a tagline.',
  },
  {
    q: 'What is the Impact Factor Score (IFS)?',
    a: 'A public 0–100 score computed from four pillars — Integrated Services (30%), Ad Shares (30%), ZeroProfit Links (10%), and Social Verification (30%). Every score is append-only, checksummed, and reproducible from its published inputs.',
  },
  {
    q: 'How is the score protected from gaming?',
    a: 'Six layers: trusted first-party data sources only, velocity and bot filtering on links, clipping and decay on spikes, anomaly review, a human verification gate for top tiers, and full public auditability — anyone can recompute a score from its snapshot.',
  },
  {
    q: 'What does the verified badge mean?',
    a: 'The badge is granted only after a human-reviewed verification request. It is never auto-issued, it links to its verification record, and it must be renewed if criteria change.',
  },
  {
    q: 'When will the services launch?',
    a: 'Every service carries one of two explicit states: Available Now, or Rolling Deployment (with scope and no fixed date). We never claim a date we cannot keep.',
  },
  {
    q: 'What about privacy, COPPA, and GDPR?',
    a: 'Registration applies age and jurisdiction consent tiers, guardian consent is collected where the law requires it, and no raw IPs or tokens are stored in durable logs. See the parental consent and privacy pages.',
  },
];

export const NEWS = [
  {
    title: 'ZeroProfit launches: a network for teen nonprofits',
    date: '2026-04-21',
    tag: 'Launch',
    body:
      'ZeroProfit is live. Youth-led nonprofits founded by students under 19 can now claim a ZPO label page and ' +
      'begin building a public Impact Factor Score. Domain registration and email hosting are available now; ' +
      'forums, Press, and the Ad Shares Network are in rolling deployment.',
  },
  {
    title: 'Impact Factor Score methodology published',
    date: '2026-08-12',
    tag: 'Product',
    body:
      'Spec v1 of the Impact Factor Score is public: four pillars (30 / 30 / 10 / 30), five tiers, clipping and ' +
      'decay rules, and a checksum over every score so anyone can verify it. Trust is the anti-gaming baseline.',
  },
  {
    title: 'Widgets preview: put your IFS anywhere',
    date: '2026-08-12',
    tag: 'Preview',
    body:
      'Score badges, impact tickers, and a clock widget are available to try in the platform. Widgets are ' +
      'configurable per ZPO and versioned so embeds never break.',
  },
];

export const GLOSSARY = [
  { term: 'ZPO', def: 'ZeroProfit Organization — the record-label-style identity page for a youth nonprofit.' },
  { term: 'IFS', def: 'Impact Factor Score — public 0–100 score from four weighted pillars.' },
  { term: 'Label page', def: 'The public :slug.zeroprofit.org profile — the artist-page metaphor.' },
  { term: 'Pillar', def: 'One of four scored activity streams: services, ads, links, social.' },
  { term: 'Release', def: 'A catalog entry on a ZPO — a project, event, or publication.' },
  { term: 'Verified badge', def: 'A human-reviewed mark of verification. Never auto-issued.' },
  { term: 'ZeroProfit Links', def: 'Tracked short links at zeroprofit.org/link/ with aggregate public counts.' },
  { term: 'Ad Shares', def: 'Impressions from the closed nonprofit ad network that feed the IFS.' },
  { term: 'Gems', def: 'The forum reputation currency on forum.openrockets.com.' },
  { term: 'SSO', def: 'Unified personal sign-in via accounts.openrockets.com (production).' },
];

export const ANTI_GAMING = [
  'Trusted sources only — scores are never accepted from client devices.',
  'Velocity & bot filtering — HMAC fingerprinting, per-link caps, tier-capped counts.',
  'Clipping & decay — daily deltas winsorized, spikes flagged, 90-day window with 45-day half-life.',
  'Anomaly review — per-org residuals are compared against cohort distributions and reviewed.',
  'Human verification gate — top tiers require a verified badge.',
  'Public audit — provenance endpoint, methodology page, and daily checksum re-verification.',
];

export const IMPACT_FACTS = [
  'IFS recomputes on a fixed daily schedule — never on demand.',
  'Every score row carries a checksum anyone can re-verify.',
  'Top tiers require a human-verified badge.',
  'Links are tier-capped and bot-filtered.',
  'Ad Shares impressions feed the IFS from a closed network.',
  'ZeroProfit is completely free for nonprofits.',
];

export const CONTACT = {
  email: 'team@openrockets.com',
  phone: '+1 (603) 777-2159',
  addressPrimary: '266 Elmwood Ave, Ste 420, Buffalo, NY 14222',
  addressSecondary: 'Administrative office: Melville Lane Area, Fairfax, VA 22033',
};

export const LEGAL: Record<'privacy' | 'terms' | 'parental' | 'impressum', { title: string; sections: { h: string; p: string }[] }> = {
  privacy: {
    title: 'Privacy Policy',
    sections: [
      { h: 'What we collect', p: 'Account information (name, email, date of birth for age gating), organization information you provide, and aggregate platform activity. Guardian information is collected where required by COPPA or GDPR.' },
      { h: 'How it is used', p: 'To run your ZPO label page, compute the Impact Factor Score from first-party sources, verify organizations, and keep the network safe for minors.' },
      { h: 'What we never store', p: 'Raw IPs are stored only as HMAC fingerprints with daily-rotating salt. Invite and integration tokens are stored hashed or encrypted at rest. Scores and score inputs are append-only and public.' },
      { h: 'Youth data & consent', p: 'Consent tiers are applied at registration: COPPA for US under-13, GDPR for EU minors, and a general tier otherwise. Guardian consent records are the only plaintext PII category by law.' },
      { h: 'Your rights', p: 'You may request access, correction, or deletion of personal data, and withdraw consent at any time. Contact team@openrockets.com.' },
    ],
  },
  terms: {
    title: 'Terms of Service',
    sections: [
      { h: 'Who may use ZeroProfit', p: 'Youth-led nonprofits founded by students under 19, plus their adult guardians as required by law. You must be truthful about age and founding information.' },
      { h: 'One organization per account', p: 'Each account may create and run one ZPO at a time. Closing an organization frees the slot.' },
      { h: 'The verified badge', p: 'Badges are granted only after a human-reviewed verification request. A badge is never auto-issued, and it must be renewed if verification criteria change.' },
      { h: 'Fair use', p: 'Do not attempt to game the Impact Factor Score, misrepresent impact, or use the platform to harm minors. Violations may suspend your ZPO.' },
      { h: 'Availability', p: 'Services are either Available Now or in Rolling Deployment with no fixed date. We publish honest state, not promises.' },
    ],
  },
  parental: {
    title: 'Parental Consent',
    sections: [
      { h: 'Why consent exists', p: 'ZeroProfit serves minors. Where the law requires it (COPPA in the US under 13; GDPR in the EU under 16; Spanish law under 14), a parent or legal guardian must consent before the account is activated.' },
      { h: 'What consent covers', p: 'Creation of the account and ZPO, participation in the Impact Factor Score, and public display of the organization label page and its catalog.' },
      { h: 'How to provide consent', p: 'During registration the guardian provides name, email, and relationship, and confirms consent. A copy of the consent record is available on request.' },
      { h: 'Withdrawal', p: 'Consent can be withdrawn at any time by contacting team@openrockets.com. The account and its data are then closed and removed per our retention policy.' },
    ],
  },
  impressum: {
    title: 'Impressum',
    sections: [
      { h: 'Publisher', p: 'ZeroProfit is a platform built by the OpenRockets Inc., an incorporated organization serving youth-led nonprofits worldwide.' },
      { h: 'Contact', p: 'Email team@openrockets.com · Phone +1 (603) 777-2159 · 266 Elmwood Ave, Ste 420, Buffalo, NY 14222.' },
      { h: 'Responsible for content', p: 'ZeroProfit Co. maintains this site. Organizations are responsible for the content of their own label pages.' },
    ],
  },
};

export const WAITLIST_NOTE =
  'ZeroProfit is in pre-general-availability. Registration currently joins the waitlist; the funnel flips to live ' +
  'onboarding at general availability. This demo stores your waitlist entry locally — no email is sent.';
