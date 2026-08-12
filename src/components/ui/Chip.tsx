// Status chips + role badges (Press `.chip` parity).

import type { ReactNode } from 'react';
import type { Role, ServiceState, VerificationStatus } from '../../types';
import { SERVICE_STATE_LABELS } from '../../lib/content';
import { tierTone } from '../score/scoreBits';

export type ChipTone = 'navy' | 'green' | 'red' | 'amber' | 'rust' | 'gray' | 'outline';

export function Chip({ tone = 'gray', children }: { tone?: ChipTone; children: ReactNode }) {
  return <span className={`chip chip--${tone}`}>{children}</span>;
}

export const ROLE_LABEL: Record<Role, string> = { owner: 'Owner', admin: 'Admin', member: 'Member', viewer: 'Viewer' };

export function RoleBadge({ role }: { role: Role }) {
  return (
    <span className={`role-badge role-badge--${role}`}>{ROLE_LABEL[role]}</span>
  );
}

export function ServiceStateChip({ state }: { state: ServiceState }) {
  return <Chip tone={state === 'available_now' ? 'green' : 'amber'}>{SERVICE_STATE_LABELS[state]}</Chip>;
}

export function VerificationChip({ status }: { status: VerificationStatus }) {
  switch (status) {
    case 'approved':
      return <Chip tone="green">Verified</Chip>;
    case 'in_review':
      return <Chip tone="navy">In review</Chip>;
    case 'submitted':
      return <Chip tone="navy">Submitted</Chip>;
    case 'rejected':
      return <Chip tone="red">Rejected</Chip>;
    case 'draft':
      return <Chip tone="amber">Draft</Chip>;
    default:
      return <Chip tone="gray">Not verified</Chip>;
  }
}

export function TierChip({ tier }: { tier: string }) {
  return <Chip tone={tierTone(tier)}>{tier}</Chip>;
}
