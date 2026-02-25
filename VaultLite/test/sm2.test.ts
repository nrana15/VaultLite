import { describe, expect, it } from 'vitest';
import { scheduleSm2 } from '../src/services/sm2';

describe('scheduleSm2', () => {
  it('resets interval for Again rating', () => {
    const result = scheduleSm2({ repetitionCount: 4, reviewInterval: 20, easeFactor: 2.5 }, 0, new Date('2026-01-01'));
    expect(result.repetitionCount).toBe(0);
    expect(result.reviewInterval).toBe(1);
  });

  it('applies graduating intervals for successful recalls', () => {
    const first = scheduleSm2({ repetitionCount: 0, reviewInterval: 1, easeFactor: 2.5 }, 2, new Date('2026-01-01'));
    const second = scheduleSm2(first, 3, new Date('2026-01-02'));
    expect(first.reviewInterval).toBe(1);
    expect(second.reviewInterval).toBe(6);
    expect(second.repetitionCount).toBe(2);
  });
});
