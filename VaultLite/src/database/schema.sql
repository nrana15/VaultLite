PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(parent_id) REFERENCES folders(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS vault_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  knowledge_type TEXT NOT NULL,
  folder_id TEXT,
  pinned INTEGER NOT NULL DEFAULT 0,
  archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(folder_id) REFERENCES folders(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS item_tags (
  item_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY(item_id, tag_id),
  FOREIGN KEY(item_id) REFERENCES vault_items(id) ON DELETE CASCADE,
  FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE VIRTUAL TABLE IF NOT EXISTS vault_fts USING fts5(
  item_id UNINDEXED,
  title,
  content,
  tags,
  knowledge_type,
  tokenize='porter unicode61'
);

CREATE TABLE IF NOT EXISTS flashcards (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  card_type TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  difficulty INTEGER NOT NULL DEFAULT 0,
  next_review_date TEXT NOT NULL,
  review_interval INTEGER NOT NULL DEFAULT 1,
  ease_factor REAL NOT NULL DEFAULT 2.5,
  repetition_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(item_id) REFERENCES vault_items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS production_patterns (
  id TEXT PRIMARY KEY,
  item_id TEXT,
  problem_description TEXT NOT NULL,
  root_cause TEXT NOT NULL,
  fix TEXT NOT NULL,
  sql_used TEXT,
  prevention TEXT,
  lessons_learned TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(item_id) REFERENCES vault_items(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS process_flows (
  id TEXT PRIMARY KEY,
  item_id TEXT,
  flow_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(item_id) REFERENCES vault_items(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS review_events (
  id TEXT PRIMARY KEY,
  flashcard_id TEXT NOT NULL,
  rating INTEGER NOT NULL,
  reviewed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(flashcard_id) REFERENCES flashcards(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_flashcards_next_review ON flashcards(next_review_date);
CREATE INDEX IF NOT EXISTS idx_vault_items_knowledge_type ON vault_items(knowledge_type);

CREATE TRIGGER IF NOT EXISTS vault_items_ai AFTER INSERT ON vault_items BEGIN
  INSERT INTO vault_fts (item_id, title, content, tags, knowledge_type)
  VALUES (
    NEW.id,
    NEW.title,
    NEW.content,
    COALESCE((
      SELECT GROUP_CONCAT(t.name, ' ')
      FROM item_tags it
      JOIN tags t ON t.id = it.tag_id
      WHERE it.item_id = NEW.id
    ), ''),
    NEW.knowledge_type
  );
END;

CREATE TRIGGER IF NOT EXISTS vault_items_au AFTER UPDATE ON vault_items BEGIN
  DELETE FROM vault_fts WHERE item_id = OLD.id;
  INSERT INTO vault_fts (item_id, title, content, tags, knowledge_type)
  VALUES (
    NEW.id,
    NEW.title,
    NEW.content,
    COALESCE((
      SELECT GROUP_CONCAT(t.name, ' ')
      FROM item_tags it
      JOIN tags t ON t.id = it.tag_id
      WHERE it.item_id = NEW.id
    ), ''),
    NEW.knowledge_type
  );
END;

CREATE TRIGGER IF NOT EXISTS vault_items_ad AFTER DELETE ON vault_items BEGIN
  DELETE FROM vault_fts WHERE item_id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS item_tags_ai AFTER INSERT ON item_tags BEGIN
  DELETE FROM vault_fts WHERE item_id = NEW.item_id;
  INSERT INTO vault_fts (item_id, title, content, tags, knowledge_type)
  SELECT
    v.id,
    v.title,
    v.content,
    COALESCE((
      SELECT GROUP_CONCAT(t.name, ' ')
      FROM item_tags it
      JOIN tags t ON t.id = it.tag_id
      WHERE it.item_id = v.id
    ), ''),
    v.knowledge_type
  FROM vault_items v
  WHERE v.id = NEW.item_id;
END;

CREATE TRIGGER IF NOT EXISTS item_tags_ad AFTER DELETE ON item_tags BEGIN
  DELETE FROM vault_fts WHERE item_id = OLD.item_id;
  INSERT INTO vault_fts (item_id, title, content, tags, knowledge_type)
  SELECT
    v.id,
    v.title,
    v.content,
    COALESCE((
      SELECT GROUP_CONCAT(t.name, ' ')
      FROM item_tags it
      JOIN tags t ON t.id = it.tag_id
      WHERE it.item_id = v.id
    ), ''),
    v.knowledge_type
  FROM vault_items v
  WHERE v.id = OLD.item_id;
END;
