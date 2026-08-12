// Personal account context: profile, consent tier, sign out, demo reset.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/StoreContext';
import { resetDemo, signOut } from '../../store/store';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Alert, DemoNote, PageHeader } from '../../components/ui/Misc';
import { Chip } from '../../components/ui/Chip';
import { useToast } from '../../components/ui/Toast';
import { initials, hueBackground, fmtDateTime } from '../../lib/format';
import { LogOut, RotateCcw } from 'lucide-react';

const HUES = [210, 130, 25, 330, 260, 45];

const TIER_LABEL: Record<string, string> = {
  general: 'General consent',
  coppa: 'COPPA (guardian consent)',
  gdpr_eu: 'GDPR-EU (guardian consent)',
  gdpr_es: 'GDPR-ES (guardian consent)',
};

export function MePage() {
  const { state, updateAccountProfile: updateProfile } = useApp();
  const toast = useToast();
  const navigate = useNavigate();
  const [confirmReset, setConfirmReset] = useState(false);
  const account = state.account;

  if (!account) {
    return (
      <div>
        <PageHeader title="Profile" />
        <Alert tone="info" >
          <Button onClick={() => navigate('/login')} variant="navy" size="sm">Sign in</Button>
        </Alert>
      </div>
    );
  }

  const doSignOut = () => {
    signOut();
    toast.push('Signed out (local session cleared).');
    navigate('/', { replace: true });
  };

  const doReset = () => {
    resetDemo();
    toast.push('Demo data reset — fresh local state.');
    navigate('/', { replace: true });
    window.location.reload();
  };

  return (
    <div>
      <PageHeader title="Profile" intro="Your personal account on ZeroProfit. Identity is managed by the unified SSO in production." actions={<DemoNote />} />

      <div className="panel">
        <div className="row" style={{ gap: 16 }}>
          <div className="avatar" style={{ width: 56, height: 56, fontSize: '1.2rem', background: hueBackground(account.avatarHue) }}>
            {initials(account.name)}
          </div>
          <div>
            <h2 style={{ margin: 0 }}>{account.name}</h2>
            <div className="muted small">{account.email}</div>
          </div>
        </div>

        <div className="grid-3" style={{ marginTop: 20 }}>
          <div className="card">
            <div className="small muted">Country</div>
            <strong>{account.country}</strong>
          </div>
          <div className="card">
            <div className="small muted">Consent tier</div>
            <Chip tone={account.consentTier === 'general' ? 'green' : 'amber'}>{TIER_LABEL[account.consentTier]}</Chip>
          </div>
          <div className="card">
            <div className="small muted">Joined</div>
            <strong>{fmtDateTime(account.joinedAt)}</strong>
          </div>
        </div>

        {account.guardian ? (
          <Alert tone="info" >
            <strong>Guardian on file:</strong> {account.guardian.name} ({account.guardian.relationship}) · {account.guardian.email}
          </Alert>
        ) : null}

        <h3 style={{ marginTop: 20 }}>Avatar color</h3>
        <div className="row">
          {HUES.map((h) => (
            <button
              key={h}
              type="button"
              aria-label={`Avatar color ${h}`}
              onClick={() => {
                updateProfile({ avatarHue: h });
                toast.push('Avatar updated.');
              }}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: `2px solid ${account.avatarHue === h ? 'var(--ink)' : 'transparent'}`,
                background: hueBackground(h),
                boxShadow: account.avatarHue === h ? '2px 2px 0 var(--ink)' : 'none',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>

        <hr />
        <div className="row">
          <Button variant="ghost" onClick={doSignOut}>
            <LogOut size={14} /> Sign out
          </Button>
          <Button variant="danger" onClick={() => setConfirmReset(true)}>
            <RotateCcw size={14} /> Reset demo data
          </Button>
        </div>
      </div>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset demo data?" size="sm">
        <div>
          <p>
            Clears all local data: account, organization, score ledger, team, widgets, domains. Sample data is
            regenerated fresh. This cannot be undone (local storage only).
          </p>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>Cancel</Button>
            <Button variant="danger" onClick={doReset}>Reset everything</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
