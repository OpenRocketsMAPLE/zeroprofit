// Verification request flow (G5/O10): checklist, evidence, submit, timeline,
// badge preview. The demo records submissions locally and NEVER grants a badge.

import { useRef, useState } from 'react';
import { useApp } from '../../store/StoreContext';
import { submitVerification } from '../../store/store';
import { Button } from '../../components/ui/Button';
import { CheckboxField } from '../../components/ui/Form';
import { Alert, DemoNote, PageHeader } from '../../components/ui/Misc';
import { VerificationChip } from '../../components/ui/Chip';
import { useToast } from '../../components/ui/Toast';
import { Upload } from 'lucide-react';

const CHECKLIST = [
  'The organization is youth-led: founded and led by students under 19.',
  'A public web presence exists (label page, socials, or website) showing real activity.',
  'At least one piece of evidence of community impact is attached.',
  'All club officers agree to the verification and its renewal terms.',
];

const EVIDENCE_PROMPTS = [
  'Activity proof: event photos, sign-in sheets, newsletters, press coverage',
  'Public statements: bylaws, mission statement, or charter',
  'Website or social media proof of activity',
];

export function VerificationPage() {
  const { state } = useApp();
  const toast = useToast();
  const org = state.org && state.org.status !== 'closed' ? state.org : null;
  const [checks, setChecks] = useState<boolean[]>(() => CHECKLIST.map(() => false));
  const [evidence, setEvidence] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!org) {
    return (
      <div>
        <PageHeader title="Verification" />
        <Alert tone="info" >
          Create your ZPO first to apply for verification.
        </Alert>
      </div>
    );
  }

  const ver = org.verification;
  const open = ver.status === 'submitted' || ver.status === 'in_review';
  const allChecked = checks.every(Boolean);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const names = Array.from(files).map((f) => f.name);
    setEvidence((prev) => [...new Set([...prev, ...names])].slice(0, 12));
  };

  const submit = () => {
    if (!allChecked) {
      toast.push('Complete the checklist first.');
      return;
    }
    if (evidence.length === 0) {
      toast.push('Attach at least one piece of evidence.');
      return;
    }
    setSubmitting(true);
    window.setTimeout(() => {
      const res = submitVerification(evidence);
      if (!res.ok) toast.push(res.error);
      else toast.push('Verification request submitted (local demo — pending human review).');
      setSubmitting(false);
    }, 400);
  };

  const timeline = [
    { label: 'Not started', done: ver.status !== 'none' && ver.status !== 'draft' },
    { label: 'Submitted', done: open || ver.status === 'approved' || ver.status === 'rejected' },
    { label: 'Human review', current: open, done: ver.status === 'approved' || ver.status === 'rejected' },
    { label: 'Decision', done: ver.status === 'approved' || ver.status === 'rejected' },
  ];

  return (
    <div>
      <PageHeader
        title="Verification"
        intro="The verified badge is granted only after a human-reviewed verification request. It is never auto-issued (G5), and it must be renewed if criteria change."
        actions={<DemoNote />}
      />

      <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="panel">
          <div className="row row--between" style={{ marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>Application</h2>
            <VerificationChip status={ver.status} />
          </div>

          {ver.status === 'rejected' ? (
            <Alert tone="danger" >
              <strong>Rejected.</strong> Reason: {ver.rejectionReason ?? 'not provided'} — you may resubmit with
              better evidence.
            </Alert>
          ) : null}

          {open ? (
            <Alert tone="warn" >
              <strong>In progress.</strong> Your request was submitted {ver.submittedAt ? new Date(ver.submittedAt).toLocaleString() : ''}{' '}
              and is queued for human review. This demo never auto-approves.
            </Alert>
          ) : null}

          <h3>Checklist</h3>
          {CHECKLIST.map((c, i) => (
            <CheckboxField
              key={c}
              label={c}
              checked={checks[i]}
              onChange={(v) => setChecks((prev) => prev.map((p, j) => (j === i ? v : p)))}
            />
          ))}

          <h3>Evidence</h3>
          <Alert tone="info" >
            Local demo: file inputs record file names only — nothing is uploaded anywhere.
          </Alert>
          <input
            ref={fileRef}
            type="file"
            multiple
            hidden
            aria-hidden="true"
            onChange={(e) => addFiles(e.target.files)}
          />
          <Button variant="navy" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload size={14} /> Attach evidence
          </Button>
          {evidence.length > 0 ? (
            <ul className="small" style={{ marginTop: 12 }}>
              {evidence.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          ) : (
            <p className="small muted">No evidence attached yet. Suggested: {EVIDENCE_PROMPTS.join(' · ')}.</p>
          )}

          <div className="row" style={{ marginTop: 16 }}>
            <Button variant="rust" onClick={submit} disabled={open || submitting}>
              {open ? 'Request already open' : submitting ? 'Submitting…' : 'Submit for review'}
            </Button>
            {evidence.length > 0 ? (
              <Button variant="ghost" size="sm" onClick={() => setEvidence([])}>
                Clear evidence
              </Button>
            ) : null}
          </div>
        </div>

        <div className="stack">
          <div className="panel">
            <h2 style={{ marginTop: 0 }}>Status timeline</h2>
            <div className="timeline">
              {timeline.map((t, i) => (
                <div className="timeline-step" key={t.label}>
                  <span className={`timeline-dot ${t.done ? 'timeline-dot--done' : t.current ? 'timeline-dot--current' : ''}`} aria-hidden="true">
                    {t.done ? '✓' : i + 1}
                  </span>
                  <div>
                    <strong>{t.label}</strong>
                    {t.current ? <div className="small muted">Pending human review (production).</div> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <h2 style={{ marginTop: 0 }}>Badge preview</h2>
            <div className="card" style={{ background: 'var(--surface-1)', textAlign: 'center' }}>
              <div className="preview-banner" style={{ marginBottom: 8 }}>
                ⓘ Preview — not an issued badge
              </div>
              <div className="verified-badge" style={{ opacity: 0.45 }}>
                ✓ Verified
              </div>
              <p className="small muted" style={{ margin: '10px 0 0' }}>
                Shown only after approval in production. The preview never claims verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
