// Form validation helpers. Each returns an error message string or null.

export type FieldError = string | null;

export function checkRequired(value: string, label: string): FieldError {
  if (!value.trim()) return `${label} is required.`;
  return null;
}

export function checkLength(value: string, min: number, max: number, label: string): FieldError {
  const v = value.trim();
  if (v.length < min) return `${label} needs at least ${min} characters.`;
  if (v.length > max) return `${label} can be at most ${max} characters.`;
  return null;
}

export function checkEmail(value: string): FieldError {
  if (!value.trim()) return 'An email address is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())) return 'Enter a valid email address.';
  return null;
}

export function checkUrlHttps(value: string): FieldError {
  const v = value.trim();
  if (!v) return 'A destination URL is required.';
  if (!/^https:\/\//.test(v)) return 'Only https:// links are allowed (security rule).';
  try {
    const u = new URL(v);
    if (u.protocol !== 'https:') return 'Only https:// links are allowed (security rule).';
  } catch {
    return 'Enter a valid absolute URL, e.g. https://example.org/page.';
  }
  return null;
}

export function checkLinkSlug(value: string): FieldError {
  const v = value.trim().toLowerCase();
  if (!v) return 'A short link name is required.';
  if (!/^[a-z0-9-]{2,40}$/.test(v)) return 'Lowercase letters, numbers, and hyphens only (2–40).';
  if (/^-|-$/.test(v) || /-{2,}/.test(v)) return 'No leading, trailing, or double hyphens.';
  return null;
}

/** Bare hostname/domain (optionally with subdomain), e.g. projects.myclub.org */
export function checkDomain(value: string): FieldError {
  const v = value.trim().toLowerCase();
  if (!v) return 'A domain is required.';
  if (v.length > 253) return 'Domain is too long.';
  if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/.test(v)) {
    return 'Enter a valid domain, e.g. projects.myclub.org.';
  }
  return null;
}

export function checkFoundedYear(value: number): FieldError {
  const year = Math.round(value);
  const now = new Date().getFullYear();
  if (Number.isNaN(year) || year < 1990 || year > now) {
    return `Founded year must be between 1990 and ${now}.`;
  }
  return null;
}

export function checkConfirmMatch(value: string, expected: string, label: string): FieldError {
  if (value.trim() !== expected.trim()) return `Type ${label} exactly to confirm.`;
  return null;
}

/** Age in whole years from an ISO date string. */
export function ageFromDob(dobIso: string): number {
  const dob = new Date(dobIso);
  if (Number.isNaN(dob.getTime())) return NaN;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age;
}
