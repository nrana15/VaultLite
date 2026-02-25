export interface ExportBundle {
  vault: unknown[];
  flashcards: unknown[];
  attachments: string[];
  analytics: Record<string, unknown>;
}

export function validateBundle(bundle: ExportBundle): boolean {
  return Array.isArray(bundle.vault) && Array.isArray(bundle.flashcards) && Array.isArray(bundle.attachments);
}

export function planRestoreSteps() {
  return ['restore-data', 'restore-attachments', 'rebuild-fts', 'recalculate-review-schedule'];
}
