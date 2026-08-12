// LinkedIn-inspired onboarding: org creation form with a live label-page
// preview on the right (invariant O1: one created org per account).

import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../../store/StoreContext';
import { createOrg } from '../../store/store';
import { allSampleSlugs } from '../../store/seed';
import { CATEGORY_LABELS, type Category } from '../../types';
import { validateSlug, slugAvailable } from '../../lib/slug';
import { checkFoundedYear, checkLength } from '../../lib/validation';
import { Button } from '../../components/ui/Button';
import { SelectField, TextAreaField, TextField } from '../../components/ui/Form';
import { Alert, DemoNote } from '../../components/ui/Misc';
import { useToast } from '../../components/ui/Toast';
import { OrgPreview } from '../../components/org/OrgPreview';

const CATEGORY_OPTIONS = (Object.keys(CATEGORY_LABELS) as Category[]).map((c) => ({ value: c, label: CATEGORY_LABELS[c] }));
const HUES = [210, 130, 25, 330, 260, 45];

export function OnboardingPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [foundedYear, setFoundedYear] = useState('');
  const [hue, setHue] = useState(210);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const org = state.org && state.org.status !== 'closed' ? state.org : null;
  const existingSlugs = useMemo(() => {
    const slugs = [...allSampleSlugs()];
    if (org) slugs.push(org.slug);
    return slugs;
  }, [org]);

  if (!state.account) return <Navigate to="/login" replace />;
  if (org) return <Navigate to="/dashboard" replace />;

  const slugCheck = slug.trim() ? validateSlug(slug) : null;
  const slugFree = slugCheck?.ok ? slugAvailable(slug, existingSlugs) : false;

  const submit = () => {
    const next: Record<string, string | null> = {
      name: checkLength(name, 3, 80, 'Organization name'),
      slug: slugCheck && !slugCheck.ok ? slugCheck.reason ?? 'Invalid label name.' : !slugFree ? 'This label name is unavailable.' : null,
      tagline: checkLength(tagline, 0, 120, 'Tagline') ?? (tagline.trim() ? null : 'A short tagline helps people understand your club.'),
      category: category ? null : 'Choose a category.',
      foundedYear: foundedYear ? checkFoundedYear(Number(foundedYear)) : 'Enter the founding year.',
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    const res = createOrg({
      name,
      slug,
      tagline,
      description,
      category: category as Category,
      foundedYear: Number(foundedYear),
      logoHue: hue,
    });
    if (!res.ok) {
      toast.push(res.error);
      setErrors({ slug: res.error });
      return;
    }
    toast.push('Your ZPO label page was created (local demo).');
    navigate('/dashboard', { replace: true });
  };

  const preview = {
    name,
    slug,
    tagline,
    description,
    category,
    foundedYear,
    logoHue: hue,
  };

  return (
    <div className="onboarding-grid">
      <div>
        <div className="page-head">
          <h1>Create your organization</h1>
          <p>
            One organization per account. Your ZPO is the record-label-style identity page that will live at{' '}
            <strong>{slug || 'your-club'}.zeroprofit.org</strong>.
          </p>
        </div>

        <Alert tone="info" >
          Everything here is a local demo. The preview on the right is a preview — it never claims a live score
          or an approved verification badge.
        </Alert>

        <TextField
          label="Organization name"
          placeholder="e.g. Future Coders Collective"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <TextField
          label="Label name (slug)"
          hint="3–32 chars, lowercase letters, numbers, hyphens. This becomes your subdomain."
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase())}
          error={errors.slug}
        />
        {slug.trim() && !errors.slug ? (
          <span className="field-hint" style={{ marginTop: -8, display: 'block' }}>
            {slugFree ? (
              <span style={{ color: 'var(--forest)' }}>✓ {slug}.zeroprofit.org is available</span>
            ) : (
              <span style={{ color: 'var(--amber)' }}>{slugCheck && !slugCheck.ok ? slugCheck.reason : `${slug}.zeroprofit.org is taken`}</span>
            )}
          </span>
        ) : null}
        <TextField
          label="Tagline"
          placeholder="One line about what your club does"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          error={errors.tagline}
        />
        <TextAreaField
          label="Description"
          hint="Shown on your public label page."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="grid-2">
          <SelectField
            label="Category"
            options={[{ value: '', label: 'Choose…' }, ...CATEGORY_OPTIONS]}
            value={category}
            onChange={(e) => setCategory(e.target.value as Category | '')}
            error={errors.category}
          />
          <TextField
            label="Founded year"
            type="number"
            min={1990}
            max={new Date().getFullYear()}
            value={foundedYear}
            onChange={(e) => setFoundedYear(e.target.value)}
            error={errors.foundedYear}
          />
        </div>

        <div className="field">
          <span className="field-label">Brand color</span>
          <div className="row" role="radiogroup" aria-label="Brand color">
            {HUES.map((h) => (
              <button
                key={h}
                type="button"
                role="radio"
                aria-checked={hue === h}
                aria-label={`Color ${h}`}
                onClick={() => setHue(h)}
                style={{
                  width: 34,
                  height: 34,
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

        <Button variant="rust" size="lg" onClick={submit} block>
          Create your ZPO
        </Button>
        <p className="small muted" style={{ marginTop: 12 }}>
          <DemoNote /> Creating a ZPO seeds sample score history so the dashboard is explorable immediately.
        </p>
      </div>

      <div className="preview-pane">
        <OrgPreview data={preview} />
      </div>
    </div>
  );
}
