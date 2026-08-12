// State pages: 404, 403, suspended.

import { ButtonLink } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Misc';

export function NotFoundPage() {
  return (
    <div className="public-frame">
      <div style={{ textAlign: 'center', padding: '64px 0' }}>
        <div className="mono" style={{ fontSize: '3rem', color: 'var(--rust)' }}>404</div>
        <h1>Page not found</h1>
        <p className="muted">The page you are looking for does not exist on this demo.</p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <ButtonLink to="/" variant="navy">Back home</ButtonLink>
          <ButtonLink to="/impact" variant="ghost">Leaderboard</ButtonLink>
        </div>
      </div>
    </div>
  );
}

export function ForbiddenPage() {
  return (
    <div>
      <Alert tone="danger" >
        <strong>403 — Access denied.</strong> Your account cannot access this area.
      </Alert>
      <ButtonLink to="/dashboard" variant="navy">Go to dashboard</ButtonLink>
    </div>
  );
}

export function SuspendedPage() {
  return (
    <div>
      <Alert tone="danger" >
        <strong>Suspended.</strong> This organization is suspended. Contact team@openrockets.com if this is a
        mistake (demo — suspension is a status, not an enforcement action).
      </Alert>
      <ButtonLink to="/dashboard" variant="navy">Back to dashboard</ButtonLink>
    </div>
  );
}
