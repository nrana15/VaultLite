export type KnowledgeType =
  | 'Concept'
  | 'Process'
  | 'SQL Query'
  | 'Configuration'
  | 'Debug Pattern'
  | 'Architecture'
  | 'Issue Resolution'
  | 'Interview Question'
  | 'Checklist'
  | 'Production Pattern';

export interface VaultItem {
  id: string;
  title: string;
  content: string;
  knowledgeType: KnowledgeType;
  folderId?: string;
  tags: string[];
  pinned: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FlashcardType =
  | 'basic_qa'
  | 'cloze'
  | 'code_completion'
  | 'flow_recall'
  | 'reverse_explanation';

export interface Flashcard {
  id: string;
  itemId: string;
  type: FlashcardType;
  question: string;
  answer: string;
  difficulty: number;
  nextReviewDate: string;
  reviewInterval: number;
  easeFactor: number;
  repetitionCount: number;
}
