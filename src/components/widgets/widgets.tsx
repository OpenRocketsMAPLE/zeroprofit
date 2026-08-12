// ZeroProfit website widgets: clock, IFS score badge, impact ticker, and the
// lightweight Impact Drop game. All run fully client-side; embed snippets are
// documentation of the production widget contract (widgets.zeroprofit.org).

import { useEffect, useRef, useState } from 'react';
import type { Organization, ScoreRow, WidgetType } from '../../types';
import { SCORE_SPEC_V1, tierForScore } from '../../lib/scoring';
import { TierChip } from '../ui/Chip';
import { ImpactTicker } from '../score/scoreBits';

export function ClockWidget({ format24 = true }: { format24?: boolean }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const str = now.toLocaleTimeString('en-GB', { hour12: !format24 });
  return <span className="widget-clock">{str}</span>;
}

export function ScoreBadgeWidget({
  org,
  row,
  showTier,
}: {
  org: Organization;
  row: ScoreRow | undefined;
  showTier: boolean;
}) {
  const total = row?.total ?? 0;
  const tier = tierForScore(SCORE_SPEC_V1, total);
  return (
    <div className="widget-badge">
      <div className="small muted">{org.name}</div>
      <div className="ifs-total">{total.toFixed(1)}</div>
      <div className="small">Impact Factor Score</div>
      {showTier ? (
        <div style={{ marginTop: 6 }}>
          <TierChip tier={tier} />
        </div>
      ) : null}
    </div>
  );
}

export function ImpactTickerWidget({ facts, speedMs = 4000 }: { facts: string[]; speedMs?: number }) {
  return (
    <div>
      <ImpactTicker facts={facts} speedMs={speedMs} />
      <div className="small muted" style={{ marginTop: 6 }}>
        Sample ticker content — production pulls live IFS updates.
      </div>
    </div>
  );
}

interface FallItem {
  id: number;
  x: number;
  y: number;
  kind: 'good' | 'bad';
}

const GAME_BEST_KEY = 'zeroprofit.game.best';

export function ImpactGame({ durationSec = 30 }: { durationSec?: number }) {
  const [status, setStatus] = useState<'idle' | 'playing' | 'over'>('idle');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(durationSec);
  const [best, setBest] = useState<number>(() => {
    try {
      return Number(localStorage.getItem(GAME_BEST_KEY) ?? 0);
    } catch {
      return 0;
    }
  });
  const [, setTick] = useState(0);
  const itemsRef = useRef<FallItem[]>([]);
  const paddleRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const [paddleX, setPaddleX] = useState(160);
  const paddleXRef = useRef(160);
  const keysRef = useRef({ left: false, right: false });
  const statusRef = useRef(status);
  statusRef.current = status;

  const endGame = (finalScore: number) => {
    setStatus('over');
    setBest((prev) => {
      const b = Math.max(prev, finalScore);
      try {
        localStorage.setItem(GAME_BEST_KEY, String(b));
      } catch {
        /* noop */
      }
      return b;
    });
  };

  useEffect(() => {
    if (status !== 'playing') return;
    const area = areaRef.current;
    if (!area) return;
    const areaW = area.clientWidth || 420;
    const startedAt = Date.now();
    let lastSpawn = 0;
    let raf = 0;

    const step = () => {
      const now = Date.now();
      const left = durationSec - Math.floor((now - startedAt) / 1000);
      setTimeLeft(Math.max(0, left));
      if (now - lastSpawn > 620) {
        lastSpawn = now;
        const kind: FallItem['kind'] = Math.random() < 0.78 ? 'good' : 'bad';
        itemsRef.current.push({ id: now, x: 12 + Math.random() * (areaW - 56), y: -30, kind });
      }
      itemsRef.current = itemsRef.current.map((it) => ({ ...it, y: it.y + 1.7 }));
      const dir = (keysRef.current.left ? -1 : 0) + (keysRef.current.right ? 1 : 0);
      if (dir !== 0) {
        setPaddleX((px) => {
          const nx = Math.max(4, Math.min(areaW - 76, px + dir * 6));
          paddleXRef.current = nx;
          return nx;
        });
      }
      const paddleCenter = paddleXRef.current + 36;
      let lostLife = false;
      let gained = false;
      itemsRef.current = itemsRef.current.filter((it) => {
        const cy = it.y + 13;
        const cx = it.x + 13;
        const caught = cy > 228 && cy < 252 && Math.abs(cx - paddleCenter) < 49;
        if (caught) {
          if (it.kind === 'good') {
            setScore((s) => s + 10);
            gained = true;
          } else {
            lostLife = true;
          }
          return false;
        }
        if (cy > 258) {
          if (it.kind === 'good') lostLife = true;
          return false;
        }
        return true;
      });
      if (lostLife) setLives((l) => l - 1);
      if (gained) setTick((t) => t + 1);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [status, durationSec]);

  useEffect(() => {
    if (status !== 'playing') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') keysRef.current.left = e.type === 'keydown';
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') keysRef.current.right = e.type === 'keydown';
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
    };
  }, [status]);

  useEffect(() => {
    if (status === 'playing' && (lives <= 0 || timeLeft <= 0)) {
      endGame(score);
    }
  }, [lives, timeLeft, status, score]);

  const start = () => {
    itemsRef.current = [];
    keysRef.current = { left: false, right: false };
    setScore(0);
    setLives(3);
    setTimeLeft(durationSec);
    setPaddleX(160);
    paddleXRef.current = 160;
    setStatus('playing');
  };

  const onPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (status !== 'playing') return;
    const area = areaRef.current;
    if (!area) return;
    const rect = area.getBoundingClientRect();
    const nx = Math.max(4, Math.min(rect.width - 76, e.clientX - rect.left - 36));
    setPaddleX(nx);
    paddleXRef.current = nx;
  };

  return (
    <div>
      <div className="game-hud" style={{ marginBottom: 8 }}>
        <span>Score: <strong>{score}</strong></span>
        <span>Lives: <strong>{'♥'.repeat(Math.max(0, lives)) || '—'}</strong></span>
        <span>Time: <strong>{timeLeft}s</strong></span>
        <span className="muted">Best: {best}</span>
      </div>
      <div
        ref={areaRef}
        className="game-area"
        onPointerMove={onPointer}
        aria-label="Impact Drop game area — catch the green impact gems, avoid the red blocks. Move with arrow keys or pointer."
      >
        {itemsRef.current.map((it) => (
          <span
            key={it.id}
            className={`game-item game-item--${it.kind}`}
            style={{ left: it.x, top: it.y }}
            aria-hidden="true"
          >
            {it.kind === 'good' ? '✦' : '×'}
          </span>
        ))}
        <div ref={paddleRef} className="game-paddle" style={{ left: paddleX }} aria-hidden="true" />
      </div>
      <div className="row" style={{ marginTop: 8 }}>
        {status !== 'playing' ? (
          <button className="btn btn--navy btn--sm" onClick={start} type="button">
            {status === 'over' ? 'Play again' : 'Start game'}
          </button>
        ) : (
          <span className="small muted">Move with ← → (or A/D) or drag the paddle. 30-second round.</span>
        )}
        {status === 'over' ? <span className="small">Final score: <strong>{score}</strong></span> : null}
      </div>
    </div>
  );
}

/** Documentation snippet for the production widget host (never executed locally). */
export function widgetSnippet(orgSlug: string, type: WidgetType, version: number): string {
  return [
    `<script src="https://widgets.zeroprofit.org/${orgSlug}/${type}.js?v=${version}"`,
    '        integrity="sha384-…" crossorigin="anonymous" async></script>',
    `<script>window.ZeroProfitWidgets && ZeroProfitWidgets.mount('${type}');</script>`,
  ].join('\n');
}
