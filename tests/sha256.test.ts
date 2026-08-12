import { describe, expect, it } from 'vitest';
import { sha256Hex } from '../src/lib/sha256';

describe('sha256Hex', () => {
  it('matches the empty-string test vector', () => {
    expect(sha256Hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  it('matches the "abc" test vector', () => {
    expect(sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('is deterministic', () => {
    const input = '{"orgId":"o1","inputs":{"services":{"forumPosts":10}}}';
    expect(sha256Hex(input)).toBe(sha256Hex(input));
  });

  it('differs for different inputs', () => {
    expect(sha256Hex('a')).not.toBe(sha256Hex('b'));
  });
});
