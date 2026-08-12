// Legal + contact pages driven by content (parity with zeroprofit.org legal routes).

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CONTACT, LEGAL } from '../../lib/content';
import { addWaitlist } from '../../store/store';
import { Button } from '../../components/ui/Button';
import { TextField, TextAreaField } from '../../components/ui/Form';
import { Alert } from '../../components/ui/Misc';
import { useToast } from '../../components/ui/Toast';
import { checkEmail, checkRequired } from '../../lib/validation';

const KEYS = Object.keys(LEGAL) as (keyof typeof LEGAL)[];

export function LegalPage() {
  const { slug } = useParams();
  const doc = KEYS.find((k) => k === slug) ? LEGAL[slug as keyof typeof LEGAL] : null;

  if (slug === 'contact') return <ContactPage />;
  if (!doc) {
    return (
      <div className="public-frame">
        <h1 style={{ marginTop: 48 }}>Page not found</h1>
        <p className="muted">That legal page does not exist. See the footer for the full list.</p>
      </div>
    );
  }

  return (
    <div className="public-frame">
      <div className="eyebrow" style={{ marginTop: 48 }}>
        Legal
      </div>
      <h1>{doc.title}</h1>
      <div style={{ maxWidth: 720 }}>
        {doc.sections.map((s) => (
          <section key={s.h} style={{ marginBottom: 24 }}>
            <h2>{s.h}</h2>
            <p className="muted" style={{ margin: 0 }}>{s.p}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ name?: string | null; email?: string | null; message?: string | null }>({});
  const [done, setDone] = useState(false);
  const toast = useToast();

  const submit = () => {
    const nameErr = checkRequired(name, 'Name');
    const emailErr = checkEmail(email);
    const msgErr = checkRequired(message, 'Message');
    setErrors({ name: nameErr, email: emailErr, message: msgErr });
    if (nameErr || emailErr || msgErr) return;
    addWaitlist(email, `${name} (contact form)`);
    toast.push('Message recorded (local demo — nothing is sent).');
    setDone(true);
  };

  return (
    <div className="public-frame">
      <div style={{ maxWidth: 640, margin: '48px auto 0' }}>
        <div className="eyebrow">Contact</div>
        <h1>Talk to the team.</h1>
        <p className="muted">
          Email <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> · Phone {CONTACT.phone}
          <br />
          {CONTACT.addressPrimary}
          <br />
          {CONTACT.addressSecondary}
        </p>
        <Alert tone="info" >
          This demo form records locally and sends nothing. Use the email above for real contact.
        </Alert>
        {done ? (
          <div className="panel">
            <h2>Thanks!</h2>
            <p className="muted">Your message was recorded locally (demo).</p>
          </div>
        ) : (
          <div className="panel">
            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
            <TextAreaField label="Message" value={message} onChange={(e) => setMessage(e.target.value)} error={errors.message} />
            <Button variant="rust" onClick={submit} block>
              Send message
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
