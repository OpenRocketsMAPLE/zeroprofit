import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../store/StoreContext';
import { allEntries } from '../../lib/leaderboard';
import { LeaderboardTable, type LeaderboardEntry } from '../../components/score/scoreBits';
import { ButtonLink } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { SCORE_SPEC_V1 } from '../../lib/scoring';

const FILTERS = [{ id: 'all', label: 'All tiers' }, ...SCORE_SPEC_V1.tiers.map((t) => ({ id: t.name, label: t.name }))];

export function ImpactPage() {
  const { state } = useApp();
  const [filter, setFilter] = useState('all');
  const entries = useMemo(() => allEntries(state), [state]);

  const filtered: LeaderboardEntry[] = useMemo(() => {
    if (filter === 'all') return entries;
    const min = SCORE_SPEC_V1.tiers.find((t) => t.name === filter)?.min ?? 0;
    return entries.filter((e) => (e.row?.total ?? 0) >= min);
  }, [entries, filter]);

  return (
    <div className="public-frame">
      <div className="eyebrow" style={{ marginTop: 48 }}>
        The network
      </div>
      <h1>Leaderboard of real impact.</h1>
      <p className="muted" style={{ maxWidth: '70ch' }}>
        Organizations sorted by their public Impact Factor Score. Scores are recomputed on a fixed schedule and
        can be re-verified from their published inputs.
      </p>

      <div className="row" style={{ margin: '24px 0' }}>
        <Chip tone="gray">Sample demo data — no real organizations or metrics</Chip>
        <ButtonLink to="/methodology" variant="ghost" size="sm">
          Methodology
        </ButtonLink>
      </div>

      <div className="row" style={{ marginBottom: 16 }}>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`tab ${filter === f.id ? 'tab--active' : ''}`}
            style={{ border: '1.5px solid var(--ink)', borderRadius: 8, marginRight: 6 }}
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="panel" style={{ padding: 0 }}>
        <LeaderboardTable entries={filtered} />
      </div>

      <p className="small muted" style={{ marginTop: 16 }}>
        Your ZPO appears here once you have a score. <Link to="/register">Claim your ZPO</Link> to join the
        network.
      </p>
    </div>
  );
}
