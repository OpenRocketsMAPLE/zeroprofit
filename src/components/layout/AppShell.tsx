// Authenticated app shell: 248px sticky sidebar + sticky topbar (Press parity),
// mobile drawer, route guard (account required).

import { useEffect, useState } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Blocks,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  Puzzle,
  Settings,
  ShieldCheck,
  User,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../../store/StoreContext';
import { initials, hueBackground } from '../../lib/format';
import { Chip } from '../ui/Chip';
import { Button } from '../ui/Button';

const NAV = [
  { group: 'Overview', items: [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
  {
    group: 'Your ZPO',
    items: [
      { to: '/org/score', label: 'Impact Factor', icon: BarChart3 },
      { to: '/org/services', label: 'Services', icon: Blocks },
      { to: '/org/team', label: 'Team', icon: Users },
      { to: '/org/deploy', label: 'Hosting & Domain', icon: Globe },
      { to: '/org/widgets', label: 'Widgets', icon: Puzzle },
    ],
  },
  {
    group: 'Growth',
    items: [
      { to: '/org/verification', label: 'Verification', icon: ShieldCheck },
      { to: '/org/settings', label: 'Settings', icon: Settings },
    ],
  },
  { group: 'Account', items: [{ to: '/me', label: 'Profile', icon: User }] },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="sidebar-nav" aria-label="Platform navigation">
      {NAV.map((section) => (
        <div key={section.group}>
          <div className="nav-group-label">{section.group}</div>
          {section.items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} onClick={onNavigate} className={({ isActive }) => (isActive ? 'active' : '')}>
                <Icon size={16} aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function AppShell() {
  const { state, signOut } = useApp();
  const [drawer, setDrawer] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setDrawer(false);
  }, [location.pathname]);

  if (!state.account) return <Navigate to="/login" replace />;
  const account = state.account;
  const org = state.org && state.org.status !== 'closed' ? state.org : null;

  const doSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <Link to="/" className="wordmark" style={{ color: '#fff', fontSize: '1.05rem' }} aria-label="ZeroProfit home">
            ZERO PROFIT
          </Link>
        </div>
        <div className="sidebar-org">
          {org ? (
            <>
              <strong>{org.name}</strong>
              <span>
                {org.slug}.zeroprofit.org · <Chip tone="green">Active</Chip>
              </span>
            </>
          ) : (
            <>
              <strong>No ZPO yet</strong>
              <span>
                <Link to="/onboarding" style={{ color: '#ffd9c4' }}>
                  Create your organization →
                </Link>
              </span>
            </>
          )}
        </div>
        <SidebarNav />
        <div className="sidebar-foot">
          <div className="row" style={{ gap: 8 }}>
            <div className="avatar" style={{ background: hueBackground(account.avatarHue) }}>
              {initials(account.name)}
            </div>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{account.name}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={doSignOut} style={{ marginTop: 10, color: '#fff', borderColor: '#fff' }}>
            <LogOut size={14} /> Sign out
          </Button>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="row">
            <button
              type="button"
              className="mk-burger no-print"
              onClick={() => setDrawer(true)}
              aria-label="Open navigation"
            >
              <Menu size={18} />
            </button>
            <span className="wordmark" style={{ fontSize: '1rem' }}>
              {org ? org.name : 'ZeroProfit'}
            </span>
            {org ? <Chip tone="outline">ZPO</Chip> : null}
          </div>
          <div className="account-menu no-print">
            <span className="small muted" style={{ display: 'none' }} />
            <div className="avatar" style={{ background: hueBackground(account.avatarHue) }} aria-hidden="true">
              {initials(account.name)}
            </div>
            <span className="small" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {account.name}
            </span>
            <Button variant="ghost" size="sm" onClick={doSignOut} aria-label="Sign out">
              <LogOut size={14} />
            </Button>
          </div>
        </header>

        <main className="app-content" id="main">
          <Outlet />
        </main>
      </div>

      {drawer ? (
        <div className="app-drawer-backdrop" onClick={() => setDrawer(false)} aria-hidden="true">
          <div className="mobile-app-nav" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Platform navigation">
            <div className="row row--between" style={{ marginBottom: 16 }}>
              <span className="wordmark" style={{ color: '#fff' }}>
                ZERO PROFIT
              </span>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setDrawer(false)} aria-label="Close navigation" style={{ color: '#fff', borderColor: '#fff' }}>
                <X size={14} />
              </button>
            </div>
            <SidebarNav onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
