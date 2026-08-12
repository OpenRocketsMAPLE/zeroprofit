// Local demo sign-in (production uses the accounts.openrockets.com SSO flow).

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/StoreContext';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/Form';
import { Alert } from '../../components/ui/Misc';
import { useToast } from '../../components/ui/Toast';
import { checkEmail, checkRequired } from '../../lib/validation';

export function LoginPage() {
  const { state, signIn } = useApp();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<{ email?: string | null; name?: string | null }>({});
  const navigate = useNavigate();
  const toast = useToast();

  const submit = () => {
    const emailErr = checkEmail(email);
    const nameErr = checkRequired(name, 'Name');
    setErrors({ email: emailErr, name: nameErr });
    if (emailErr || nameErr) return;
    signIn({ name, email, country: 'US', dob: '2008-01-01', consentTier: 'general' });
    toast.push('Signed in (local demo session).');
    const hasOrg = state.org && state.org.status !== 'closed';
    navigate(hasOrg ? '/dashboard' : '/onboarding', { replace: true });
  };

  return (
    <div style={{ maxWidth: 440, margin: '0 auto', padding: '64px var(--sp-lg)' }}>
      <div className="panel">
        <h1 style={{ marginTop: 0 }}>Sign in</h1>
        <p className="muted small">
          Local demo sign-in — no external SSO. Production uses the OpenRockets unified account
          (accounts.openrockets.com) with server-side session cookies.
        </p>
        <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} autoComplete="name" />
        <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} autoComplete="email" />
        <Button variant="rust" onClick={submit} block>
          Sign in
        </Button>
        <p className="small muted" style={{ margin: '16px 0 0' }}>
          New here? <a href="#/register" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Create an account</a>.
        </p>
      </div>
      <Alert tone="info" >
        Demo behavior: an existing account with the same email is restored; otherwise a new local account is created.
      </Alert>
    </div>
  );
}
