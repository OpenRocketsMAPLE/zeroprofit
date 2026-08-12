// Sticky marketing header with mobile drawer (Press header parity).

import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { ButtonLink } from '../ui/Button';

const NAV = [
  { to: '/about', label: 'About' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/impact', label: 'Impact' },
  { to: '/methodology', label: 'Methodology' },
  { to: '/free', label: 'Free' },
  { to: '/news', label: 'News' },
];

export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="mk-header">
      <div className="mk-header-inner">
        <Link to="/" className="wordmark" aria-label="ZeroProfit home">
          ZERO PROFIT
        </Link>
        <nav className="mk-nav" aria-label="Primary">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="mk-cta">
          <ButtonLink to="/login" variant="ghost" size="sm">
            Sign in
          </ButtonLink>
          <ButtonLink to="/register" variant="rust" size="sm">
            Claim your ZPO
          </ButtonLink>
        </div>
        <button
          type="button"
          className="mk-burger"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open ? <div className="mk-drawer-backdrop" onClick={() => setOpen(false)} aria-hidden="true" /> : null}
      <nav className={`mk-drawer ${open ? 'mk-drawer--open' : ''}`} aria-label="Mobile navigation">
        <div className="row row--between">
          <span className="wordmark">ZERO PROFIT</span>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={14} />
          </button>
        </div>
        {NAV.map((n) => (
          <Link key={n.to} to={n.to}>
            {n.label}
          </Link>
        ))}
        <Link to="/login">Sign in</Link>
        <Link to="/register" style={{ borderBottom: 'none', fontWeight: 700 }}>
          Claim your ZPO →
        </Link>
      </nav>
    </header>
  );
}
