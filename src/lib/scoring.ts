// Impact Factor Score (IFS) engine — pure, deterministic, versioned.
// Implements spec v1 from product-architecture.md §8.2:
//   weights { services 0.30, ads 0.30, links 0.10, social 0.30 }
//   tiers Emerging/Rising/Established/Distinguished/Legendary
//   rounding 2, checksum = sha256(canonical JSON) (O5 reproducibility)

import { sha256Hex } from './sha256';
import { clamp, round2 } from './rand';
import type { PillarKey, PillarScore, ScoreInputs, ScoreRow } from '../types';

export interface ScoreSpec {
  version: number;
  effectiveFrom: string;
  weights: Record<PillarKey, number>;
  tiers: { name: string; min: number }[];
  clipping: { dailyDeltaWinsor: number; maxSpikePct: number };
  decay: { windowDays: number; halfLifeDays: number };
  rounding: number;
}

export const PILLAR_KEYS: PillarKey[] = ['services', 'ads', 'links', 'social'];

export const PILLAR_LABELS: Record<PillarKey, string> = {
  services: 'Integrated Services',
  ads: 'Ad Shares Network',
  links: 'ZeroProfit Links',
  social: 'Social Verification',
};

export const SCORE_SPEC_V1: ScoreSpec = {
  version: 1,
  effectiveFrom: '2026-09-01T00:00:00Z',
  weights: { services: 0.3, ads: 0.3, links: 0.1, social: 0.3 },
  tiers: [
    { name: 'Emerging', min: 0 },
    { name: 'Rising', min: 25 },
    { name: 'Established', min: 50 },
    { name: 'Distinguished', min: 75 },
    { name: 'Legendary', min: 90 },
  ],
  clipping: { dailyDeltaWinsor: 0.95, maxSpikePct: 0.5 },
  decay: { windowDays: 90, halfLifeDays: 45 },
  rounding: 2,
};

/**
 * Normalize a pillar's raw inputs into a 0..1 activity level.
 * Ceilings are spec-owned calibration constants (published on /methodology).
 */
export function normalizePillar(key: PillarKey, raw: Record<string, number>): number {
  const r = (k: string, d = 0) => raw[k] ?? d;
  switch (key) {
    case 'services': {
      const v = r('forumPosts') * 2 + r('gems') * 0.05 + r('pressContributions') * 3 + r('forumActivityMinutes') * 0.005;
      return clamp(v / 120, 0, 1);
    }
    case 'ads': {
      const v = (r('adImpressions') / 20000) * 0.6 + clamp(r('adCtrPct') / 3, 0, 1) * 0.4;
      return clamp(v, 0, 1);
    }
    case 'links': {
      const v = (r('linkClicks') / 1000) * 0.7 + (r('activeLinks') / 10) * 0.3;
      return clamp(v, 0, 1);
    }
    case 'social': {
      const v = (r('followers') / 500) * 0.7 + clamp(r('growthPct') / 0.5, 0, 1) * 0.3;
      return clamp(v, 0, 1);
    }
  }
}

export interface ScoreResult {
  total: number;
  pillars: Record<PillarKey, PillarScore>;
}

/** Deterministic score computation for a spec + inputs snapshot. */
export function computeScore(spec: ScoreSpec, inputs: ScoreInputs): ScoreResult {
  const pillars = {} as Record<PillarKey, PillarScore>;
  let total = 0;
  for (const key of PILLAR_KEYS) {
    const normalized = normalizePillar(key, inputs[key]);
    const weight = spec.weights[key];
    const score = round2(normalized * weight * 100);
    total += score;
    pillars[key] = { score, weight, raw: { ...inputs[key] } };
  }
  return { total: round2(total), pillars };
}

/** Highest tier whose minimum the score reaches. */
export function tierForScore(spec: ScoreSpec, total: number): string {
  let tier = spec.tiers[0].name;
  for (const t of spec.tiers) {
    if (total >= t.min) tier = t.name;
  }
  return tier;
}

/** Canonical serialization — the exact bytes the checksum covers (O5). */
export function canonicalInputsJson(
  orgId: string,
  scoreVersion: number,
  periodStart: string,
  periodEnd: string,
  inputs: ScoreInputs,
): string {
  return JSON.stringify({ orgId, scoreVersion, periodStart, periodEnd, inputs });
}

export function scoreChecksum(
  orgId: string,
  scoreVersion: number,
  periodStart: string,
  periodEnd: string,
  inputs: ScoreInputs,
): string {
  return sha256Hex(canonicalInputsJson(orgId, scoreVersion, periodStart, periodEnd, inputs));
}

export interface ScoreRowInput {
  orgId: string;
  scoreVersion?: number;
  periodStart: string;
  periodEnd: string;
  computedAt?: string;
  inputs: ScoreInputs;
  parentId?: string | null;
}

/** Build one append-only ledger row. Recomputing the same inputs+version reproduces the checksum. */
export function buildScoreRow(input: ScoreRowInput): ScoreRow {
  const spec = SCORE_SPEC_V1;
  const version = input.scoreVersion ?? spec.version;
  const { total, pillars } = computeScore(spec, input.inputs);
  return {
    id: `score_${input.orgId}_${input.periodEnd}_${version}`,
    orgId: input.orgId,
    scoreVersion: version,
    computedAt: input.computedAt ?? `${input.periodEnd}T12:00:00.000Z`,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    total,
    pillars,
    inputsSnapshot: input.inputs,
    checksum: scoreChecksum(input.orgId, version, input.periodStart, input.periodEnd, input.inputs),
    parentId: input.parentId ?? null,
    replaced: false,
  };
}
