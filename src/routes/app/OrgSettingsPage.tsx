// Organization settings: profile edit with live preview, visibility flags,
// catalog (releases) editor, and the danger zone (transfer / close, O1/O2).

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/StoreContext';
import { addProject, closeOrg, removeProject, setProfileFlag, transferOwnership, updateOrg } from '../../store/store';
import { allSampleSlugs } from '../../store/seed';
import { CATEGORY_LABELS, type Category } from '../../types';
import { validateSlug, slugAvailable } from '../../lib/slug';
import { checkFoundedYear, checkLength } from '../../lib/validation';
import { Button } from '../../components/ui/Button';
import { SelectField, TextAreaField, TextField } from '../../components/ui/Form';
import { Modal } from '../../components/ui/Modal';
import { Alert, DemoNote, EmptyState, PageHeader, Toggle } from '../../components/ui/Misc';
import { useToast } from '../../components/ui/Toast';
import { OrgPreview } from '../../components/org/OrgPreview';
import { Trash2 } from 'lucide-react';

const CATEGORY_OPTIONS = (Object.keys(CATEGORY_LABELS) as Category[]).map((c) => ({ value: c, label: CATEGORY_LABELS[c] }));
const HUES = [210, 130, 25, 330, 260, 45];

export function OrgSettingsPage() {
  const { state } = useApp();
  const toast = useToast();
  const navigate = useNavigate();
  const org = state.org && state.org.status !== 'closed' ? state.org : null;

  // local form copy (seeded from store)
  const [name, setName] = useState(org?.name ?? '');
  const [slug, setSlug] = useState(org?.slug ?? '');
  const [tagline, setTagline] = useState(org?.tagline ?? '');
  const [description, setDescription] = useState(org?.description ?? '');
  const [category, setCategory] = useState<Category | ''>(org?.category ?? '');
  const [foundedYear, setFoundedYear] = useState(String(org?.foundedYear ?? ''));
  const [hue, setHue] = useState(org?.logoHue ?? 210);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmTransfer, setConfirmTransfer] = useState(false);
  const [closeText, setCloseText] = useState('');
  const [transferTarget, setTransferTarget] = useState<string>('');
  const [newProject, setNewProject] = useState({ title: '', kind: '', year: '', summary: '' });

  const existingSlugs = useMemo(() => {
    const slugs = [...allSampleSlugs()];
    if (org) slugs.push(org.slug);
    return slugs;
  }, [org]);

  if (!org) {
    return (
      <div>
        <PageHeader title="Settings" />
        <Alert tone="info" >
          Create your ZPO first — <Button onClick={() => navigate('/onboarding')} variant="navy" size="sm">Create organization</Button>
        </Alert>
      </div>
    );
  }

  const slugCheck = slug.trim() ? validateSlug(slug) : null;
  const slugFree = slug === org.slug || (slugCheck?.ok === true && slugAvailable(slug, existingSlugs));

  const save = () => {
    const next: Record<string, string | null> = {
      name: checkLength(name, 3, 80, 'Organization name'),
      slug: slugCheck && !slugCheck.ok ? slugCheck.reason ?? 'Invalid.' : !slugFree ? 'This label name is unavailable.' : null,
      foundedYear: foundedYear ? checkFoundedYear(Number(foundedYear)) : 'Founded year required.',
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    updateOrg({ name, slug, tagline, description, category: category as Category, foundedYear: Number(foundedYear), logoHue: hue });
    toast.push('Profile updated (local demo).');
  };

  const doClose = () => {
    if (closeText.trim() !== org.name) {
      toast.push('Type the organization name exactly to close it.');
      return;
    }
    const res = closeOrg();
    if (!res.ok) toast.push(res.error);
    else {
      toast.push('ZPO closed. Your slot is free — you can create a new organization.');
      navigate('/onboarding', { replace: true });
    }
    setConfirmClose(false);
    setCloseText('');
  };

  const doTransfer = () => {
    const target = state.members.find((m) => m.id === transferTarget && m.status === 'active');
    if (!target) {
      toast.push('Choose a member to transfer ownership to.');
      return;
    }
    const res = transferOwnership(target.id);
    if (!res.ok) toast.push(res.error);
    else toast.push(`Ownership transferred to ${target.name}.`);
    setConfirmTransfer(false);
    setTransferTarget('');
  };

  const canTransfer = state.members.some((m) => m.status === 'active' && m.role !== 'owner');

  const preview = { name, slug, tagline, description, category, foundedYear, logoHue: hue };

  return (
    <div>
      <PageHeader title="Organization settings" intro="Edit your ZPO profile, catalog, visibility, and ownership. All local." actions={<DemoNote />} />

      <div className="onboarding-grid">
        <div>
          <div className="panel">
            <h2 style={{ marginTop: 0 }}>Profile</h2>
            <TextField label="Organization name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
            <TextField label="Label name (slug)" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())} error={errors.slug} hint={slugFree ? `${slug}.zeroprofit.org` : 'Unavailable label name'} />
            <TextField label="Tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} />
            <TextAreaField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="grid-2">
              <SelectField label="Category" options={CATEGORY_OPTIONS} value={category} onChange={(e) => setCategory(e.target.value as Category | '')} />
              <TextField label="Founded year" type="number" value={foundedYear} onChange={(e) => setFoundedYear(e.target.value)} error={errors.foundedYear} />
            </div>
            <div className="field">
              <span className="field-label">Brand color</span>
              <div className="row">
                {HUES.map((h) => (
                  <button
                    key={h}
                    type="button"
                    aria-label={`Color ${h}`}
                    onClick={() => setHue(h)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border: `2px solid ${hue === h ? 'var(--ink)' : 'transparent'}`,
                      background: `linear-gradient(135deg, hsl(${h} 38% 26%), hsl(${h} 42% 18%))`,
                      boxShadow: hue === h ? '2px 2px 0 var(--ink)' : 'none',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
            </div>
            <Button variant="rust" onClick={save}>
              Save changes
            </Button>
          </div>

          <div className="panel">
            <h2 style={{ marginTop: 0 }}>Public profile visibility</h2>
            <div className="stack" style={{ gap: 8 }}>
              <Toggle checked={org.profileFlags.team} onChange={(v) => { setProfileFlag('team', v); toast.push(v ? 'Team shown publicly.' : 'Team hidden.'); }} label="Show team on the label page" />
              <Toggle checked={org.profileFlags.projects} onChange={(v) => { setProfileFlag('projects', v); toast.push(v ? 'Catalog shown publicly.' : 'Catalog hidden.'); }} label="Show impact catalog" />
              <Toggle checked={org.profileFlags.links} onChange={(v) => { setProfileFlag('links', v); toast.push(v ? 'Links shown publicly.' : 'Links hidden.'); }} label="Show ZeroProfit Links" />
            </div>
          </div>

          <div className="panel">
            <h2 style={{ marginTop: 0 }}>Impact catalog</h2>
            {state.projects.length === 0 ? (
              <EmptyState title="No catalog entries" body='Add "releases" — projects, events, or publications — shown on your label page.' />
            ) : (
              <div className="stack" style={{ gap: 8 }}>
                {state.projects.map((p) => (
                  <div className="card" key={p.id}>
                    <div className="row row--between">
                      <div>
                        <strong>{p.title}</strong>
                        <span className="muted small" style={{ display: 'block' }}>
                          {p.kind} · {p.year}
                        </span>
                      </div>
                      <Button size="sm" variant="danger" aria-label={`Remove ${p.title}`} onClick={() => { removeProject(p.id); toast.push('Catalog entry removed.'); }}>
                        <Trash2 size={13} />
                      </Button>
                    </div>
                    <p className="small muted" style={{ margin: '6px 0 0' }}>{p.summary}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="grid-2" style={{ marginTop: 16, gridTemplateColumns: '1fr 1fr' }}>
              <TextField label="Title" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} />
              <TextField label="Kind" placeholder="project / event-series / publication" value={newProject.kind} onChange={(e) => setNewProject({ ...newProject, kind: e.target.value })} />
            </div>
            <div className="grid-2" style={{ gridTemplateColumns: '1fr 120px', marginTop: 8 }}>
              <TextField label="Summary" value={newProject.summary} onChange={(e) => setNewProject({ ...newProject, summary: e.target.value })} />
              <TextField label="Year" value={newProject.year} onChange={(e) => setNewProject({ ...newProject, year: e.target.value })} />
            </div>
            <Button variant="navy" size="sm" style={{ marginTop: 12 }} onClick={() => {
              if (!newProject.title.trim()) { toast.push('A title is required.'); return; }
              const res = addProject(newProject);
              if (!res.ok) toast.push(res.error);
              else { toast.push('Catalog entry added (local demo).'); setNewProject({ title: '', kind: '', year: '', summary: '' }); }
            }}>
              Add catalog entry
            </Button>
          </div>
        </div>

        <div className="preview-pane">
          <OrgPreview data={preview} />
        </div>
      </div>

      <div className="panel" style={{ marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Danger zone</h2>
        <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Transfer ownership</h3>
            <p className="small muted">Exactly one owner per organization. The owner cannot be demoted or removed.</p>
            <div className="row">
              <select className="select" style={{ flex: 1 }} value={transferTarget} onChange={(e) => setTransferTarget(e.target.value)} aria-label="New owner">
                <option value="">Choose a member…</option>
                {state.members.filter((m) => m.status === 'active' && m.role !== 'owner').map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                ))}
              </select>
              <Button variant="navy" disabled={!canTransfer} onClick={() => setConfirmTransfer(true)}>
                Transfer
              </Button>
            </div>
          </div>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Close organization</h3>
            <p className="small muted">Soft-closes your ZPO. History and score ledger stay (append-only); your slot becomes free for a new organization.</p>
            <Button variant="danger" onClick={() => setConfirmClose(true)}>
              Close ZPO
            </Button>
          </div>
        </div>
      </div>

      <Modal open={confirmClose} onClose={() => setConfirmClose(false)} title="Close your organization?" size="sm">
        <div>
          <p>Type <strong>{org.name}</strong> exactly to close your ZPO.</p>
          <TextField label="Confirmation" value={closeText} onChange={(e) => setCloseText(e.target.value)} placeholder={org.name} />
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setConfirmClose(false)}>Cancel</Button>
            <Button variant="danger" onClick={doClose}>Close ZPO</Button>
          </div>
        </div>
      </Modal>

      <Modal open={confirmTransfer} onClose={() => setConfirmTransfer(false)} title="Transfer ownership?" size="sm">
        <div>
          <p>Transfer ownership of {org.name}? You will become an admin.</p>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setConfirmTransfer(false)}>Cancel</Button>
            <Button variant="navy" onClick={doTransfer}>Transfer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
