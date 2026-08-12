import { describe, expect, it } from 'vitest';
import {
  buildScoreRow,
  canonicalInputsJson,
  computeScore,
  normalizePillar,
  SCORE_SPEC_V1,
  scoreChecksum,
  tierForScore,
} from '../src/lib/scoring';
import type { ScoreInputs } from '../src/types';

const baseInputs: ScoreInputs = {
  services: { forumPosts: 20, gems: 400, pressContributions: 2, forumActivityMinutes: 900 },
  ads: { adImpressions: 30000, adCtrPct: 2.1 },
  links: { linkClicks: 1500, activeLinks: 5 },
  social: { followers: 800, growthPct: 0.2 },
};

describe('computeScore', () => {
  it('scores zero inputs as zero', () => {
    const zero: ScoreInputs = {
      services: {},
      ads: {},
      links: {},
      social: {},
    };
    const { total, pillars } = computeScore(SCORE_SPEC_V1, zero);
    expect(total).toBe(0);
    expect(pillars.services.score).toBe(0);
    expect(pillars.ads.score).toBe(0);
  });

  it('is deterministic for identical inputs', () => {
    const a = computeScore(SCORE_SPEC_V1, baseInputs);
    const b = computeScore(SCORE_SPEC_V1, baseInputs);
    expect(a.total).toBe(b.total);
    expect(a.pillars.services.score).toBe(b.pillars.services.score);
  });

  it('stays within 0..100 and matches the pillar-weight math', () => {
    const { total, pillars } = computeScore(SCORE_SPEC_V1, baseInputs);
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThanOrEqual(100);
    const sum = pillars.services.score + pillars.ads.score + pillars.links.score + pillars.social.score;
    expect(sum).toBeCloseTo(total, 5);
    // Each pillar contributes at most weight * 100
    expect(pillars.services.score).toBeLessThanOrEqual(30.0001);
    expect(pillars.links.score).toBeLessThanOrEqual(10.0001);
  });

  it('normalizes pillars into [0,1]', () => {
    expect(normalizePillar('services', { forumPosts: 10000 })).toBeLessThanOrEqual(1);
    expect(normalizePillar('links', {})).toBeGreaterThanOrEqual(0);
  });
});

describe('tiers', () => {
  it('maps totals to the correct tier', () => {
    expect(tierForScore(SCORE_SPEC_V1, 0)).toBe('Emerging');
    expect(tierForScore(SCORE_SPEC_V1, 24.9)).toBe('Emerging');
    expect(tierForScore(SCORE_SPEC_V1, 25)).toBe('Rising');
    expect(tierForScore(SCORE_SPEC_V1, 50)).toBe('Established');
    expect(tierForScore(SCORE_SPEC_V1, 75)).toBe('Distinguished');
    expect(tierForScore(SCORE_SPEC_V1, 90)).toBe('Legendary');
    expect(tierForScore(SCORE_SPEC_V1, 100)).toBe('Legendary');
  });
});

describe('checksum & reproducibility (O5)', () => {
  it('reproduces the same checksum for the same canonical inputs', () => {
    const a = scoreChecksum('org1', 1, '2026-01-01', '2026-01-08', baseInputs);
    const b = scoreChecksum('org1', 1, '2026-01-01', '2026-01-08', baseInputs);
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
  });

  it('changes when any input changes', () => {
    const a = scoreChecksum('org1', 1, '2026-01-01', '2026-01-08', baseInputs);
    const changed: ScoreInputs = { ...baseInputs, links: { ...baseInputs.links, linkClicks: 1501 } };
    const b = scoreChecksum('org1', 1, '2026-01-01', '2026-01-08', changed);
    expect(a).not.toBe(b);
  });

  it('canonical JSON is stable (key order preserved)', () => {
    const json = canonicalInputsJson('org1', 1, 'p1', 'p2', baseInputs);
    expect(JSON.parse(json)).toEqual({ orgId: 'org1', scoreVersion: 1, periodStart: 'p1', periodEnd: 'p2', inputs: baseInputs });
  });

  it('buildScoreRow pins the checksum of its snapshot', () => {
    const row = buildScoreRow({ orgId: 'org1', periodStart: '2026-01-01', periodEnd: '2026-01-08', inputs: baseInputs });
    expect(row.checksum).toBe(scoreChecksum('org1', row.scoreVersion, row.periodStart, row.periodEnd, row.inputsSnapshot));
    expect(row.replaced).toBe(false);
  });
});
