import { describe, expect, it } from 'vitest';
import { buildFtsQuery } from '../src/services/search';

describe('buildFtsQuery', () => {
  it('converts input into wildcard FTS tokens', () => {
    expect(buildFtsQuery('avaloq booking')).toBe('avaloq* booking*');
  });
});
