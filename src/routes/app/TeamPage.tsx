// GitHub-like collaboration: members table, roles, invitations, pending invites.

import { useState } from 'react';
import { useApp } from '../../store/StoreContext';
import type { Member, Role } from '../../types';
import { Button } from '../../components/ui/Button';
import { SelectField, TextField } from '../../components/ui/Form';
import { Modal } from '../../components/ui/Modal';
import { Alert, DemoNote, EmptyState, PageHeader } from '../../components/ui/Misc';
import { RoleBadge } from '../../components/ui/Chip';
import { useToast } from '../../components/ui/Toast';
import { Copy, Trash2 } from 'lucide-react';
import { checkEmail, checkRequired } from '../../lib/validation';

const ROLES: { value: Role; label: string }[] = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
  { value: 'viewer', label: 'Viewer' },
];

export function TeamPage() {
  const { state, addMember, removeMember, setMemberRole, revokeInvite } = useApp();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('member');
  const [errors, setErrors] = useState<{ name?: string | null; email?: string | null }>({});
  const [confirmRemove, setConfirmRemove] = useState<Member | null>(null);
  const [confirmTransfer, setConfirmTransfer] = useState<Member | null>(null);

  const active = state.members.filter((m) => m.status !== 'removed');
  const pending = active.filter((m) => m.status === 'invited');
  const members = active.filter((m) => m.status === 'active');

  const submitInvite = () => {
    const nameErr = checkRequired(name, 'Name');
    const emailErr = checkEmail(email);
    setErrors({ name: nameErr, email: emailErr });
    if (nameErr || emailErr) return;
    const res = addMember(name, email, role);
    if (!res.ok) {
      toast.push(res.error);
      return;
    }
    toast.push(`Invitation created for ${name} (token shown below — demo).`);
    setName('');
    setEmail('');
    setRole('member');
  };

  const copyToken = (m: Member) => {
    const text = m.token ? `https://app.zeroprofit.org/accept?token=${m.token}` : '';
    try {
      navigator.clipboard?.writeText(text);
      toast.push('Invite link copied (demo token).');
    } catch {
      toast.push('Clipboard unavailable — token: ' + (m.token ?? ''));
    }
  };

  const doRemove = (m: Member) => {
    const res = removeMember(m.id);
    if (!res.ok) toast.push(res.error);
    else toast.push(`${m.name} removed from the team.`);
    setConfirmRemove(null);
  };

  const doTransfer = (m: Member) => {
    const res = setMemberRole(m.id, 'owner');
    if (!res.ok) toast.push(res.error);
    else toast.push(`Ownership transferred to ${m.name}.`);
    setConfirmTransfer(null);
  };

  const changeRole = (m: Member, next: Role) => {
    const res = setMemberRole(m.id, next);
    if (!res.ok) toast.push(res.error);
    else toast.push(`${m.name} is now ${next}.`);
  };

  return (
    <div>
      <PageHeader
        title="Team"
        intro="Invite club officers with roles. Exactly one owner per organization — the owner cannot be demoted or removed."
        actions={<DemoNote />}
      />

      <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="panel">
          <h2 style={{ marginTop: 0 }}>Invite a teammate</h2>
          <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
          <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
          <SelectField label="Role" options={ROLES} value={role} onChange={(e) => setRole(e.target.value as Role)} />
          <Button variant="rust" onClick={submitInvite} block>
            Send invitation
          </Button>
          <p className="small muted" style={{ marginBottom: 0 }}>
            Production sends a 7-day invite email with a hashed token. This demo shows the token inline.
          </p>
        </div>

        <div className="panel">
          <h2 style={{ marginTop: 0 }}>Pending invitations ({pending.length})</h2>
          {pending.length === 0 ? (
            <p className="muted small">No pending invites.</p>
          ) : (
            <div className="stack" style={{ gap: 8 }}>
              {pending.map((m) => (
                <div className="card" key={m.id}>
                  <div className="row row--between">
                    <div>
                      <strong>{m.name}</strong> <span className="muted small">· {m.email}</span>
                      <span className="small muted" style={{ display: 'block' }}>
                        {m.token ? <code className="small">token: {m.token}</code> : null}
                      </span>
                    </div>
                    <div className="row">
                      <Button size="sm" variant="navy" onClick={() => copyToken(m)} aria-label={`Copy invite link for ${m.name}`}>
                        <Copy size={13} /> Copy link
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { revokeInvite(m.id); toast.push('Invitation revoked.'); }}>
                        Revoke
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="small muted" style={{ marginBottom: 0 }}>
            <Alert tone="info" >
              Demo: invitations are stored locally; acceptance flows are simulated by role changes below.
            </Alert>
          </p>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Members ({members.length})</h2>
        {members.length === 0 ? (
          <EmptyState title="No members yet" body="Invite club officers to build your team." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Change role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <strong>{m.name}</strong>
                      <div className="small muted">{m.email}</div>
                    </td>
                    <td>
                      <RoleBadge role={m.role} />
                    </td>
                    <td>
                      <select
                        className="select"
                        style={{ width: 130 }}
                        value={m.role}
                        disabled={m.role === 'owner'}
                        aria-label={`Role for ${m.name}`}
                        onChange={(e) => changeRole(m, e.target.value as Role)}
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="row">
                        {m.role === 'owner' ? (
                          <span className="small muted">Owner</span>
                        ) : (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => setConfirmTransfer(m)}>
                              Transfer ownership
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => setConfirmRemove(m)} aria-label={`Remove ${m.name}`}>
                              <Trash2 size={13} /> Remove
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={confirmRemove !== null} onClose={() => setConfirmRemove(null)} title="Remove member?" size="sm">
        {confirmRemove ? (
          <div>
            <p>
              Remove <strong>{confirmRemove.name}</strong> from {state.org?.name}? Their access ends immediately
              (local demo).
            </p>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setConfirmRemove(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => doRemove(confirmRemove)}>
                Remove
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal open={confirmTransfer !== null} onClose={() => setConfirmTransfer(null)} title="Transfer ownership?" size="sm">
        {confirmTransfer ? (
          <div>
            <p>
              Make <strong>{confirmTransfer.name}</strong> the owner of {state.org?.name}? You will become an
              admin, and the owner cannot be removed or demoted afterwards.
            </p>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setConfirmTransfer(null)}>
                Cancel
              </Button>
              <Button variant="navy" onClick={() => doTransfer(confirmTransfer)}>
                Transfer ownership
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
