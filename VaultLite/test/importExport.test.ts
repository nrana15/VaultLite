import { describe, expect, it } from 'vitest';
import { planRestoreSteps, validateBundle } from '../src/services/importExport';

describe('import/export helpers', () => {
  it('validates bundle shape', () => {
    expect(
      validateBundle({
        vault: [],
        flashcards: [],
        attachments: [],
        analytics: {},
      }),
    ).toBe(true);
  });

  it('includes required restore steps', () => {
    expect(planRestoreSteps()).toEqual([
      'restore-data',
      'restore-attachments',
      'rebuild-fts',
      'recalculate-review-schedule',
    ]);
  });
});
