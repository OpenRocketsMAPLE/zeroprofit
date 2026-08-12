// Live organization label-page preview (LinkedIn-style onboarding pattern).
// The preview is clearly labeled and NEVER claims an approved verification badge.

import type { Category } from '../../types';
import { CATEGORY_LABELS } from '../../types';
import { initials, hueBackground } from '../../lib/format';
import { Chip } from '../ui/Chip';

export interface OrgPreviewData {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: Category | '';
  foundedYear: string;
  logoHue: number;
}

export function OrgPreview({ data }: { data: OrgPreviewData }) {
  const name = data.name.trim() || 'Your Organization';
  const slug = data.slug.trim() || 'your-club';
  const hue = data.logoHue;
  return (
    <div>
      <div className="preview-banner" style={{ marginBottom: 8 }}>
        ⓘ Preview — not published
      </div>
      <div
        className="label-cover"
        style={{ background: hueBackground(hue), height: 110, borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}
        aria-hidden="true"
      />
      <div className="label-body" style={{ borderTop: 0, borderRadius: '0 0 var(--radius-md) var(--radius-md)' }}>
        <div className="label-head" style={{ marginTop: -40 }}>
          <div className="label-avatar" style={{ width: 72, height: 72, fontSize: '1.5rem', background: hueBackground(hue) }}>
            {initials(name)}
          </div>
          <div>
            <div className="label-title" style={{ fontSize: '1.4rem' }}>
              {name} <Chip tone="outline">ZPO</Chip>
            </div>
            <div className="small muted">{slug}.zeroprofit.org</div>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          {data.tagline.trim() ? <p style={{ fontStyle: 'italic' }}>{data.tagline}</p> : <p className="muted small">Your tagline appears here.</p>}
          <div className="label-meta small muted">
            <span>{data.category ? CATEGORY_LABELS[data.category as Category] : 'Category'}</span>
            <span aria-hidden="true">·</span>
            <span>{data.foundedYear || 'Founded year'}</span>
          </div>
          <div style={{ marginTop: 12 }}>
            <Chip tone="gray">Not verified — badge requires human review</Chip>
          </div>
          <div className="card" style={{ marginTop: 16, background: 'var(--surface-1)' }}>
            <div className="small muted">Impact Factor Score</div>
            <div className="ifs-total" style={{ fontSize: '2.4rem' }}>
              —
            </div>
            <div className="small muted">
              Your IFS appears after your first score period. Preview only — never claims real scores or verification.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
