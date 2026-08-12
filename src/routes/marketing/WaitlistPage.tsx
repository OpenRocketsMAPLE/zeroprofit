import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addWaitlist } from '../../store/store';
import { WAITLIST_NOTE } from '../../lib/content';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/Form';
import { Alert } from '../../components/ui/Misc';
import { useToast } from '../../components/ui/Toast';
import { checkEmail } from '../../lib/validation';

export function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const submit = () => {
    const err = checkEmail(email);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    const res = addWaitlist(email, orgName);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    toast.push('You are on the waitlist (local demo — no email sent).');
    setDone(true);
  };

  return (
    <div className="public-frame">
      <div style={{ maxWidth: 560, margin: '48px auto 0' }}>
        <div className="eyebrow">Waitlist</div>
        <h1>Join the waitlist.</h1>
        <p className="muted">
          ZeroProfit is in pre-general-availability. Register your nonprofit to be first in line when onboarding
          opens.
        </p>
        <Alert tone="info" >{WAITLIST_NOTE}</Alert>
        {done ? (
          <div className="panel">
            <h2>You're on the list.</h2>
            <p className="muted">
              This is a local demo — your entry is stored in this browser only and no email is sent. On the
              production platform this funnels to live onboarding at general availability.
            </p>
            <div className="row">
              <Button variant="navy" onClick={() => navigate('/')}>
                Back to home
              </Button>
              <Button variant="ghost" onClick={() => navigate('/register')}>
                Try the app anyway →
              </Button>
            </div>
          </div>
        ) : (
          <div className="panel">
            <TextField
              label="Email"
              type="email"
              placeholder="you@yourclub.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
            />
            <TextField
              label="Organization name"
              placeholder="Your club's name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
            <Button variant="rust" onClick={submit} block>
              Join the waitlist
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
