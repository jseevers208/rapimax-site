-- Cases CRM table
CREATE TABLE IF NOT EXISTS cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  status TEXT DEFAULT 'lead',
  assigned_to TEXT,
  priority TEXT DEFAULT 'normal',
  follow_up_date TEXT,
  next_steps TEXT,
  source TEXT,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  linked_application_id INTEGER,
  linked_contact_id INTEGER,
  linked_lead_ids TEXT DEFAULT '[]',
  tags TEXT DEFAULT '[]',
  estimated_value REAL,
  notes_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_assigned ON cases(assigned_to);
CREATE INDEX IF NOT EXISTS idx_cases_email ON cases(email);
CREATE INDEX IF NOT EXISTS idx_cases_phone ON cases(phone);
CREATE INDEX IF NOT EXISTS idx_cases_follow_up ON cases(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_cases_created ON cases(created_at);
