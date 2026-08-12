// Leaderboard data assembly: sample orgs + (optionally) the user's own org.

import { SAMPLE_ORGS, latestScore } from '../store/seed';
import type { LeaderboardEntry } from '../components/score/scoreBits';
import type { PersistedState } from '../types';

export function sampleEntries(): LeaderboardEntry[] {
  return SAMPLE_ORGS.map((s) => {
    const row = latestScore(s.ledger);
    const prev = s.ledger.length > 1 ? s.ledger[s.ledger.length - 2].total : undefined;
    return { org: s.org, row, prevTotal: prev, sample: true };
  }).sort((a, b) => (b.row?.total ?? 0) - (a.row?.total ?? 0));
}

export function allEntries(state: PersistedState): LeaderboardEntry[] {
  const entries = sampleEntries();
  const org = state.org && state.org.status !== 'closed' ? state.org : null;
  if (org) {
    const row = latestScore(state.scoreLedger);
    const prev = state.scoreLedger.length > 1 ? state.scoreLedger[state.scoreLedger.length - 2].total : undefined;
    entries.push({ org, row, prevTotal: prev, you: true });
  }
  return entries.sort((a, b) => (b.row?.total ?? 0) - (a.row?.total ?? 0));
}
