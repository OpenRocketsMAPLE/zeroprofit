# ZeroProfit

> A record-label-style identity (ZPO) and impact infrastructure for teen nonprofits that are changing the world.
> "Giving real value to REAL impact."

ZeroProfit is a standalone product foundation: a public marketing site, a personal
account + onboarding flow, a platform dashboard with the **Impact Factor Score
(IFS)**, public organization label pages, a leaderboard, team collaboration,
hosting/domain configuration, and embeddable widgets — all running as a
credential-free local demo in React 19 + TypeScript + Vite.

The visual language is independently reproduced in the spirit of the OpenRockets
Press design system (read-only audit in `../audit/source-audit.md`); **no GPL
Press source code is copied** — this repository is BSD-3-Clause. ZeroProfit is
branded standalone; "Built by the OpenRockets Inc." appears only in discreet
footer attribution.

## Quickstart

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # tsc --noEmit
npm test           # vitest run (unit + route smoke tests)
npm run lint       # eslint
npm run build      # typecheck + production build (dist/)
npm run preview    # serve the production build
```

Node ≥ 20 is required (developed against Node 20.12, Vite 6).

## What is inside

### Surfaces (single SPA, three logical areas)

| Area | Routes | Notes |
|---|---|---|
| Marketing site | `/`, `/about`, `/how-it-works`, `/impact`, `/methodology`, `/free`, `/waitlist`, `/news`, `/legal/*`, `/contact` | Mission-led hero; "completely free" is explicit but secondary; service states are honest (`Available Now` vs `Rolling Deployment`). |
| Public label pages | `/org/:slug` | The ZPO "artist page": cover, IFS card, catalog, links, team. Verified badges are only shown for approved sample orgs and never auto-issued (G5). |
| Platform app | `/register`, `/login`, `/onboarding`, `/dashboard`, `/org/*`, `/me` | Age gate + consent tiers at registration; LinkedIn-style onboarding with a live preview pane; one created org per account (O1). |

### Data & integrity

- **Local store** (`src/store/store.ts`): everything persists to
  `localStorage` behind a subscribe/commit store read through
  `useSyncExternalStore` — no backend, no secrets, credential-free.
- **IFS engine** (`src/lib/scoring.ts`): spec v1 — weights 30/30/10/30, five
  tiers, rounding, and a **sha256 checksum** over the canonical inputs snapshot
  (O5). Scores are **append-only**; the demo "Recompute" inserts a new ledger
  row and marks the previous one replaced (O4).
- **Invariants enforced in the store**: one org per account (O1), exactly one
  owner who cannot be demoted/removed (O2), one open verification request (O3),
  slug rules + reserved list (O11), verification never auto-issued (G5/O10).
- **Sample data** (`src/store/seed.ts`): 7 deterministic sample organizations
  with ledgers, clearly labeled "Sample data" everywhere they appear.

### Credential-dependent integrations (honest states, no fakes)

| Integration | Local behavior |
|---|---|
| Netlify hosting | "Connect Netlify" shows the OAuth contract; a labeled **local demo connection** simulates sites, deploys, and syncs. Never claims a real account. |
| DNS verification | Domain records get TXT verification tokens; "Check DNS (local demo)" flips pending → verified with an explicit demo label. |
| Email / Forums / Press / Ad Shares | Services page shows `Available Now` or `Rolling Deployment` with waitlist capture (local). |
| SSO | Local demo sign-in with age gate/consent; production flow (accounts.openrockets.com, PKCE, HttpOnly sessions) is documented in the architecture blueprint, not faked here. |

The adapter contract lives in `src/lib/adapters.ts` and is rendered on
`/org/deploy` — a production implementation can swap in without UI changes.

### Widgets (all run live locally)

Clock · IFS Score Badge · Impact Ticker · **Impact Drop** (a lightweight
keyboard/pointer game). Widgets can be created, enabled, configured, and
deleted; embed snippets document the `widgets.zeroprofit.org` production
contract (versioned scripts + signed config).

## Project structure

```
src/
  types.ts                # domain model (mirrors architecture doc §5)
  lib/                    # sha256, slug, scoring, validation, format, adapters, content, leaderboard
  store/                  # seed.ts (sample data), store.ts (state+actions), StoreContext.tsx (React binding)
  styles/                 # tokens / base / components / layout / marketing / app (Press-derived design system)
  components/             # ui (buttons, chips, forms, modal, toast…), score, widgets, org, layout
  routes/                 # marketing/ (public) and app/ (platform) pages
  App.tsx main.tsx        # router + entry
tests/                    # Vitest: sha256, slug, scoring, store invariants, route smoke tests
```

## Design system (from the read-only audit of the Press design language)

- **Typography**: Ubuntu body, Ubuntu Condensed headings, Oswald wordmark,
  Anton footer watermark — all self-hosted via `@fontsource` (no runtime CDN).
- **Colors**: white/warm paper (`#fffefc → #faf7f1`), navy `#1d3461`, rust
  `#b84b1a`, forest `#1a6641`; subtle SVG paper-grain overlay.
- **Shape**: 4px spacing scale, 1.5px borders, 8–12px radii, offset
  neo-brutalist button shadows, sticky 248px app sidebar + 64px topbar, black
  footer with Anton watermark.
- **Accessibility**: semantic landmarks, focus-visible rings, skip link,
  `prefers-reduced-motion`, keyboard-operable widgets/accordions/modals, empty
  and error states everywhere.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc --noEmit` + `vite build` |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | TypeScript strict check |
| `npm test` | Vitest (jsdom) — unit + route smoke tests |
| `npm run lint` | ESLint (typescript-eslint recommended) |

## License & attribution

BSD 3-Clause (see `LICENSE`). ZeroProfit Co. © 2022–2026. ZeroProfit is built
by the OpenRockets Inc. The Press design language was adapted from a read-only
audit; no GPL source code is included. All sample organizations, names, and
metrics are fictional demo data. No production credentials are stored anywhere
in this repository (see `.env.example` — placeholders only).
