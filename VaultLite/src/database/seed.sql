INSERT INTO folders (id, name) VALUES
  ('f-avaloq-core', 'Avaloq Core'),
  ('f-sql-patterns', 'SQL Patterns'),
  ('f-gl-posting', 'GL & Posting'),
  ('f-prod-lessons', 'Production Lessons');

INSERT INTO vault_items (id, title, content, knowledge_type, folder_id, pinned) VALUES
  (
    'n-booking-vs-settlement',
    'Booking vs Settlement',
    'Booking records the accounting transaction. Settlement moves funds and finalizes value transfer.',
    'Concept',
    'f-avaloq-core',
    1
  ),
  (
    'n-plsql-cursor',
    'PL/SQL Cursor Pattern',
    'DECLARE CURSOR c_txn IS SELECT txn_id, amount FROM txn_queue WHERE status = ''PENDING''; BEGIN FOR r IN c_txn LOOP UPDATE txn_queue SET status = ''DONE'' WHERE txn_id = r.txn_id; END LOOP; END;',
    'SQL Query',
    'f-sql-patterns',
    0
  ),
  (
    'n-deadlock-pattern',
    'Deadlock in posting batch',
    'Symptom: posting batch freezes. Root cause: lock inversion across GL posting + fee posting jobs. Fix: enforce deterministic lock order and shorter transaction scope.',
    'Debug Pattern',
    'f-prod-lessons',
    0
  );

INSERT INTO flashcards (id, item_id, card_type, question, answer, difficulty, next_review_date, review_interval, ease_factor, repetition_count) VALUES
  (
    'c-booking-settlement',
    'n-booking-vs-settlement',
    'basic_qa',
    'What is the difference between booking and settlement?',
    'Booking records transaction; settlement moves funds and finalizes.',
    2,
    datetime('now', '+1 day'),
    1,
    2.5,
    0
  );

INSERT INTO production_patterns (
  id, item_id, problem_description, root_cause, fix, sql_used, prevention, lessons_learned
) VALUES (
  'p-deadlock-001',
  'n-deadlock-pattern',
  'Deadlock observed during end-of-day posting cycle.',
  'Two procedures acquired account and ledger locks in opposite order.',
  'Refactored procedures to follow strict lock ordering and reduced transaction scope.',
  'SELECT object_name, session_id FROM v$locked_object;',
  'Introduce lock-order checklist in code review.',
  'Concurrency design must be explicit in financial batch jobs.'
);
