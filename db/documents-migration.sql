-- Documents table — tracks R2 file uploads
-- Run on rapimax-prod D1 Console

CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT DEFAULT (datetime('now')),
  application_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  r2_key TEXT NOT NULL UNIQUE,
  content_type TEXT,
  file_size INTEGER,
  uploaded_by TEXT DEFAULT 'customer'
);

CREATE INDEX IF NOT EXISTS idx_documents_app ON documents(application_id);
