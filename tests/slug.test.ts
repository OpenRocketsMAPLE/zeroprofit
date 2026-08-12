import { describe, expect, it } from 'vitest';
import { RESERVED_SLUGS, slugAvailable, slugify, suggestSlug, validateSlug } from '../src/lib/slug';

describe('slugify', () => {
  it('lowercases and normalizes', () => {
    expect(slugify('Future Coders Collective')).toBe('future-coders-collective');
    expect(slugify('  Hello   World!! ')).toBe('hello-world');
    expect(slugify('---')).toBe('');
  });
});

describe('validateSlug', () => {
  it('accepts valid slugs', () => {
    expect(validateSlug('future-coders').ok).toBe(true);
    expect(validateSlug('abc').ok).toBe(true);
    expect(validateSlug('a-b-c').ok).toBe(true);
  });

  it('rejects invalid slugs', () => {
    expect(validateSlug('').ok).toBe(false);
    expect(validateSlug('ab').ok).toBe(false);
    expect(validateSlug('a'.repeat(33)).ok).toBe(false);
    expect(validateSlug('UPPER').ok).toBe(false);
    expect(validateSlug('-lead').ok).toBe(false);
    expect(validateSlug('trail-').ok).toBe(false);
    expect(validateSlug('double--dash').ok).toBe(false);
    expect(validateSlug('under_score').ok).toBe(false);
  });

  it('rejects reserved slugs', () => {
    expect(RESERVED_SLUGS.length).toBeGreaterThan(10);
    expect(validateSlug('admin').ok).toBe(false);
    expect(validateSlug('www').ok).toBe(false);
    expect(validateSlug('zeroprofit').ok).toBe(false);
  });
});

describe('slugAvailable', () => {
  it('is case-insensitive against existing slugs', () => {
    expect(slugAvailable('future-coders', ['Future-Coders'])).toBe(false);
    expect(slugAvailable('future-coders', ['other-club'])).toBe(true);
  });
});

describe('suggestSlug', () => {
  it('returns the base when free', () => {
    expect(suggestSlug('My Club', ['taken'])).toBe('my-club');
  });

  it('appends a number when taken', () => {
    const s = suggestSlug('My Club', ['my-club']);
    expect(s).toBe('my-club-2');
  });
});
