-- Phase 2 Migration — Run on rapimax-prod
-- npx wrangler d1 execute rapimax-prod --remote --file=./db/phase2-migration.sql

-- ============================================
-- ADD missing columns from earlier sessions
-- ============================================

-- access_token for customer portal magic links
ALTER TABLE loan_applications ADD COLUMN access_token TEXT;
CREATE INDEX IF NOT EXISTS idx_applications_token ON loan_applications(access_token);

-- full_name and phone for calculator leads (added in session 1)
ALTER TABLE calculator_leads ADD COLUMN full_name TEXT;
ALTER TABLE calculator_leads ADD COLUMN phone TEXT;

-- ============================================
-- NEW: Waitlist subscribers
-- ============================================
CREATE TABLE IF NOT EXISTS waitlist_subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT DEFAULT (datetime('now')),
  email TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  converted INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist_subscribers(email);
