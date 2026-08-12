// Black footer with Anton watermark (Press footer parity), standalone brand,
// discreet OpenRockets Inc. attribution (guardrail G1).

import { Link } from 'react-router-dom';
import { CONTACT } from '../../lib/content';

export function MarketingFooter() {
  return (
    <footer className="mk-footer">
      <div className="mk-footer-inner">
        <div>
          <Link to="/" className="wordmark" style={{ color: '#fff' }}>
            ZERO PROFIT
          </Link>
          <p className="small" style={{ color: '#9aa0ab', marginTop: 12 }}>
            A record-label-style identity and impact infrastructure for teen nonprofits that are changing the world.
          </p>
          <p className="small" style={{ color: '#9aa0ab' }}>
            ZeroProfit is completely free for nonprofit organizations.
          </p>
        </div>
        <div>
          <h3>Product</h3>
          <Link to="/how-it-works">How it works</Link>
          <Link to="/impact">Leaderboard</Link>
          <Link to="/methodology">IFS methodology</Link>
          <Link to="/free">Pricing — free</Link>
          <Link to="/waitlist">Waitlist</Link>
        </div>
        <div>
          <h3>Legal</h3>
          <Link to="/legal/privacy-policy">Privacy</Link>
          <Link to="/legal/terms">Terms</Link>
          <Link to="/legal/parental-consent">Parental consent</Link>
          <Link to="/legal/impressum">Impressum</Link>
          <Link to="/news">News</Link>
        </div>
        <div>
          <h3>Connect</h3>
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          <a href="tel:+16037772159">{CONTACT.phone}</a>
          <span className="small" style={{ color: '#9aa0ab', display: 'block', marginTop: 8 }}>
            {CONTACT.addressPrimary}
          </span>
          <span className="small" style={{ color: '#9aa0ab', display: 'block' }}>
            {CONTACT.addressSecondary}
          </span>
        </div>
      </div>
      <div className="footer-watermark" aria-hidden="true">
        ZEROPROFIT
      </div>
      <div className="footer-bottom">
        <span>© 2022–2026 ZeroProfit Co. · All rights reserved.</span>
        <span className="attribution">Built by the OpenRockets Inc. · BSD-3-Clause licensed source</span>
      </div>
    </footer>
  );
}
