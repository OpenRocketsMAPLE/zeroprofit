// Shared domain types for the ZeroProfit local demo.
// These mirror the production data model described in product-architecture.md §5.

export type Role = 'owner' | 'admin' | 'member' | 'viewer';
export type MemberStatus = 'invited' | 'active' | 'removed';

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: MemberStatus;
  invitedAt?: string;
  invitedBy?: string;
  token?: string; // invite token (demo — displayed to the owner; production: hashed at rest)
}

export type OrgStatus = 'draft' | 'pending_verification' | 'active' | 'suspended' | 'closed';
export type VerificationStatus = 'none' | 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected';

export interface VerificationState {
  status: VerificationStatus;
  submittedAt?: string;
  evidence: string[];
  criteriaVersion: number;
  rejectionReason?: string;
}

export type Category = 'education' | 'health' | 'environment' | 'arts' | 'technology' | 'community' | 'science' | 'other';

export const CATEGORY_LABELS: Record<Category, string> = {
  education: 'Education',
  health: 'Health & Wellness',
  environment: 'Environment',
  arts: 'Arts & Culture',
  technology: 'Technology',
  community: 'Community',
  science: 'Science',
  other: 'Other',
};

export interface Organization {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: Category;
  foundedYear: number;
  logoHue: number; // brand hue used for cover/avatar gradients (local demo)
  status: OrgStatus;
  createdAt: string;
  verification: VerificationState;
  profileFlags: { team: boolean; projects: boolean; links: boolean };
}

export interface Project {
  id: string;
  title: string;
  kind: string; // "release" in record-label language
  year: string;
  summary: string;
}

export interface LinkItem {
  id: string;
  slug: string;
  targetUrl: string;
  status: 'active' | 'paused' | 'disabled';
  clicks: number;
  createdAt: string;
}

export type PillarKey = 'services' | 'ads' | 'links' | 'social';

export interface PillarScore {
  score: number; // contribution to the total (0..weight*100)
  weight: number;
  raw: Record<string, number>;
}

export interface ScoreInputs {
  services: Record<string, number>;
  ads: Record<string, number>;
  links: Record<string, number>;
  social: Record<string, number>;
}

export interface ScoreRow {
  id: string;
  orgId: string;
  scoreVersion: number;
  computedAt: string;
  periodStart: string;
  periodEnd: string;
  total: number;
  pillars: Record<PillarKey, PillarScore>;
  inputsSnapshot: ScoreInputs;
  checksum: string;
  parentId: string | null;
  replaced: boolean; // append-only ledger: recompute inserts a new row and marks the previous latest
}

export type WidgetType = 'clock' | 'score_badge' | 'impact_ticker' | 'impact_game';

export interface WidgetInstance {
  id: string;
  type: WidgetType;
  name: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

export type ServiceState = 'available_now' | 'rolling_deployment';

export type ConsentTier = 'general' | 'coppa' | 'gdpr_eu' | 'gdpr_es';

export interface Account {
  id: string;
  name: string;
  email: string;
  avatarHue: number;
  country: string;
  dob: string; // ISO date (used for the age gate)
  consentTier: ConsentTier;
  guardian?: { name: string; email: string; relationship: string };
  joinedAt: string;
}

export type ActivityKind = 'system' | 'score' | 'team' | 'service' | 'widget' | 'verification' | 'domain';

export interface ActivityEntry {
  id: string;
  at: string;
  text: string;
  kind: ActivityKind;
}

export interface NetlifySite {
  id: string;
  name: string;
  url: string;
  sslUrl: string;
  deployState: 'ready' | 'building' | 'error';
  domainAssignment: { subdomain: string; dnsStatus: 'pending' | 'verified' | 'failed' };
}

export interface NetlifyState {
  status: 'not_connected' | 'connected_demo' | 'expired';
  accountName?: string;
  connectedAt?: string;
  sites: NetlifySite[];
}

export interface DomainRecord {
  id: string;
  fqdn: string;
  target: string;
  provider: 'netlify' | 'manual';
  status: 'pending_verified' | 'verified' | 'failed';
  verificationToken: string;
  checkedAt?: string;
}

export interface PersistedState {
  version: number;
  account: Account | null;
  org: Organization | null;
  members: Member[];
  projects: Project[];
  links: LinkItem[];
  scoreLedger: ScoreRow[];
  widgets: WidgetInstance[];
  activities: ActivityEntry[];
  netlify: NetlifyState;
  domains: DomainRecord[];
  waitlist: { email: string; orgName: string; at: string }[];
  dismissedNotice?: boolean;
}
