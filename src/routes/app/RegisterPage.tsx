// Registration with the COPPA/GDPR age gate + guardian consent (parity with
// product-architecture.md §11). Local demo only — no external SSO.

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/StoreContext';
import type { ConsentTier } from '../../types';
import { Button } from '../../components/ui/Button';
import { CheckboxField, SelectField, TextField } from '../../components/ui/Form';
import { Alert } from '../../components/ui/Misc';
import { useToast } from '../../components/ui/Toast';
import { ageFromDob, checkEmail, checkRequired } from '../../lib/validation';

const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'DE', label: 'Germany (EU)' },
  { value: 'FR', label: 'France (EU)' },
  { value: 'ES', label: 'Spain (EU)' },
  { value: 'NL', label: 'Netherlands (EU)' },
  { value: 'SE', label: 'Sweden (EU)' },
  { value: 'IT', label: 'Italy (EU)' },
  { value: 'PL', label: 'Poland (EU)' },
  { value: 'OTHER', label: 'Other' },
];

const EU_EXCEPT_ES = new Set(['DE', 'FR', 'NL', 'SE', 'IT', 'PL']);

function tierFor(country: string, age: number): ConsentTier {
  if (age < 13) return 'coppa';
  if (country === 'ES' && age < 14) return 'gdpr_es';
  if (EU_EXCEPT_ES.has(country) && age < 16) return 'gdpr_eu';
  return 'general';
}

export function RegisterPage() {
  const { state, signIn } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('US');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianRel, setGuardianRel] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const navigate = useNavigate();
  const toast = useToast();

  const dobIso = useMemo(() => {
    if (day && month && year) return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    return '';
  }, [day, month, year]);

  const age = dobIso ? ageFromDob(dobIso) : NaN;
  const tier: ConsentTier = Number.isNaN(age) ? 'general' : tierFor(country, age);
  const needsGuardian = tier === 'coppa' || tier === 'gdpr_eu' || tier === 'gdpr_es';

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 45 }, (_, i) => new Date().getFullYear() - i);

  const submit = () => {
    const next: Record<string, string | null> = {
      name: checkRequired(name, 'Full name'),
      email: checkEmail(email),
      dob: Number.isNaN(age) ? 'Enter a valid date of birth.' : age < 6 ? 'That age looks off — re-check the date.' : null,
      consent: consent ? null : 'Consent is required to continue.',
    };
    if (needsGuardian) {
      next.guardianName = checkRequired(guardianName, 'Guardian name');
      next.guardianEmail = checkEmail(guardianEmail);
      next.guardianRel = checkRequired(guardianRel, 'Relationship');
    }
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    const guardian = needsGuardian ? { name: guardianName.trim(), email: guardianEmail.trim().toLowerCase(), relationship: guardianRel.trim() } : undefined;
    signIn({ name, email, country, dob: dobIso, consentTier: tier, guardian });
    toast.push('Account created (local demo). Age gate applied.');
    const hasOrg = state.org && state.org.status !== 'closed';
    navigate(hasOrg ? '/dashboard' : '/onboarding', { replace: true });
  };

  const tierNote: Record<ConsentTier, string> = {
    general: 'General consent tier — no guardian required.',
    coppa: 'COPPA tier: a parent/guardian must consent for members under 13 in the US.',
    gdpr_eu: 'GDPR tier: a parent/guardian must consent for EU members under 16.',
    gdpr_es: 'Spanish law tier: a parent/guardian must consent for members under 14 in Spain.',
  };

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '64px var(--sp-lg)' }}>
      <div className="panel">
        <h1 style={{ marginTop: 0 }}>Create your account</h1>
        <p className="muted small">
          Registration includes an age gate and consent tier (COPPA / GDPR). Local demo — nothing leaves this browser.
        </p>

        <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} autoComplete="name" />
        <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} autoComplete="email" />
        <SelectField label="Country / region" options={COUNTRIES} value={country} onChange={(e) => setCountry(e.target.value)} />

        <div className="field">
          <span className="field-label">Date of birth</span>
          <div className="dob-grid">
            <select className="select" aria-label="Day" value={day} onChange={(e) => setDay(e.target.value)}>
              <option value="">Day</option>
              {days.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select className="select" aria-label="Month" value={month} onChange={(e) => setMonth(e.target.value)}>
              <option value="">Month</option>
              {months.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select className="select" aria-label="Year" value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">Year</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          {errors.dob ? <span className="field-error" role="alert">{errors.dob}</span> : null}
        </div>

        {!Number.isNaN(age) ? (
          <Alert tone={needsGuardian ? 'warn' : 'info'} >
            Age {age} · {tierNote[tier]}
          </Alert>
        ) : null}

        {needsGuardian ? (
          <div className="panel" style={{ marginBottom: 16, boxShadow: '2px 2px 0 var(--ink)' }}>
            <h3>Guardian consent</h3>
            <TextField label="Guardian full name" value={guardianName} onChange={(e) => setGuardianName(e.target.value)} error={errors.guardianName} />
            <TextField label="Guardian email" type="email" value={guardianEmail} onChange={(e) => setGuardianEmail(e.target.value)} error={errors.guardianEmail} />
            <TextField label="Relationship to you" placeholder="Parent / legal guardian" value={guardianRel} onChange={(e) => setGuardianRel(e.target.value)} error={errors.guardianRel} />
          </div>
        ) : null}

        <CheckboxField label="I agree to the Terms and Privacy Policy" checked={consent} onChange={setConsent}>
          {tier !== 'general' && needsGuardian ? 'My guardian above consents to my participation in ZeroProfit.' : ''}
        </CheckboxField>
        {errors.consent ? <span className="field-error" role="alert">{errors.consent}</span> : null}

        <Button variant="rust" onClick={submit} block>
          Create account
        </Button>
      </div>
    </div>
  );
}
