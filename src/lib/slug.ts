// Slug (label name) logic for `:slug.zeroprofit.org` — invariant O11 from
// product-architecture.md §5.2: lowercase [a-z0-9-], 3..32 chars, reserved list,
// uniqueness enforced case-insensitively.

export const RESERVED_SLUGS = [
  'admin', 'www', 'api', 'app', 'apps', 'widgets', 'widget', 'link', 'links',
  'org', 'orgs', 'zeroprofit', 'zero', 'about', 'impact', 'methodology', 'free',
  'waitlist', 'news', 'contact', 'privacy', 'terms', 'imprint', 'impressum',
  'legal', 'blog', 'forum', 'forums', 'mail', 'email', 'sso', 'auth', 'accounts',
  'openrockets', 'press', 'status', 'help', 'support', 'cdn', 'static', 'assets',
  'me', 'my', 'dashboard', 'team', 'services', 'deploy', 'verification',
  'settings', 'profile', 'register', 'login', 'logout', 'signup', 'signin',
  'suspended', '403', '404', 'robots', 'sitemap', 'feed', 'rss', 'donate',
  'shop', 'store', 'pricing', 'payment', 'billing', 'adminpanel', 'console',
];

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export interface SlugCheck {
  ok: boolean;
  reason?: string;
}

export function validateSlug(raw: string): SlugCheck {
  const s = raw.trim(); // case-sensitive: callers normalize to lowercase before validating
  if (!s) return { ok: false, reason: 'A label name is required.' };
  if (s.length < 3) return { ok: false, reason: 'At least 3 characters.' };
  if (s.length > 32) return { ok: false, reason: 'At most 32 characters.' };
  if (!/^[a-z0-9-]+$/.test(s)) {
    return { ok: false, reason: 'Lowercase letters, numbers, and hyphens only.' };
  }
  if (/^-|-$/.test(s)) return { ok: false, reason: 'Cannot start or end with a hyphen.' };
  if (/-{2,}/.test(s)) return { ok: false, reason: 'No double hyphens.' };
  if (RESERVED_SLUGS.includes(s)) return { ok: false, reason: 'That label name is reserved.' };
  return { ok: true };
}

/** Case-insensitive availability against an existing slug list (includes samples). */
export function slugAvailable(slug: string, existingSlugs: string[]): boolean {
  const s = slug.trim().toLowerCase();
  return validateSlug(s).ok && !existingSlugs.some((x) => x.toLowerCase() === s);
}

export function suggestSlug(name: string, existingSlugs: string[]): string {
  const base = (slugify(name) || 'club').slice(0, 30);
  if (slugAvailable(base, existingSlugs)) return base;
  for (let i = 2; i <= 99; i++) {
    const cand = `${base.slice(0, 30 - String(i).length)}-${i}`;
    if (slugAvailable(cand, existingSlugs)) return cand;
  }
  return `${base.slice(0, 24)}-zp`;
}
