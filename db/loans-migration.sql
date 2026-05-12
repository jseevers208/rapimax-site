-- Loans & Payments tables — Run on rapimax-prod D1 Console
-- Run each CREATE TABLE separately

-- Active loans table
CREATE TABLE IF NOT EXISTS loans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER,
  borrower_name TEXT NOT NULL,
  borrower_email TEXT NOT NULL,
  borrower_phone TEXT,
  borrower_id_number TEXT,
  loan_number TEXT UNIQUE NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  principal_amount REAL NOT NULL,
  interest_rate REAL NOT NULL,
  term_months INTEGER NOT NULL,
  monthly_payment REAL NOT NULL,
  total_interest REAL NOT NULL,
  total_amount REAL NOT NULL,
  disbursement_date TEXT,
  first_payment_date TEXT,
  bank_name TEXT,
  bank_account TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Payment schedule (amortization)
CREATE TABLE IF NOT EXISTS payment_schedule (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  loan_id INTEGER NOT NULL,
  installment_number INTEGER NOT NULL,
  due_date TEXT NOT NULL,
  principal_portion REAL NOT NULL,
  interest_portion REAL NOT NULL,
  total_due REAL NOT NULL,
  balance_after REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_date TEXT,
  paid_amount REAL,
  payment_method TEXT,
  onvo_payment_id TEXT,
  notes TEXT,
  FOREIGN KEY (loan_id) REFERENCES loans(id)
);

-- Payment transactions log
CREATE TABLE IF NOT EXISTS loan_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  loan_id INTEGER NOT NULL,
  schedule_id INTEGER,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT NOT NULL,
  reference_number TEXT,
  onvo_session_id TEXT,
  onvo_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  recorded_by TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (loan_id) REFERENCES loans(id)
);

-- MOCK DATA: Seed a test loan for jorge@logeek.io
-- Run AFTER creating tables

INSERT INTO loans (application_id, borrower_name, borrower_email, borrower_phone, borrower_id_number, loan_number, currency, principal_amount, interest_rate, term_months, monthly_payment, total_interest, total_amount, disbursement_date, first_payment_date, bank_name, bank_account, status)
VALUES (1, 'JORGE ALBERTO SEEVERS GRILLO', 'jorge@logeek.io', '08089090', '107830451', 'RM-2026-0001', 'USD', 20000.00, 12.5, 46, 531.42, 4445.32, 24445.32, '2026-05-15', '2026-06-15', 'Banco Nacional de Costa Rica', 'CR21015108410026012345', 'active');
