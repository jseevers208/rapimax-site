-- Rapimax D1 Schema v2
-- Run: npx wrangler d1 execute rapimax-db --remote --file=./db/schema.sql

-- ============================================
-- CORE: Loan Applications
-- ============================================
CREATE TABLE IF NOT EXISTS loan_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  status TEXT DEFAULT 'nueva',
  assigned_to TEXT,
  priority TEXT DEFAULT 'normal',

  credit_facility_type TEXT,
  requested_credit_amount REAL,
  requested_term_months INTEGER,

  applicant_id_type TEXT,
  applicant_id_number TEXT,
  applicant_full_name TEXT,
  applicant_gender TEXT,
  marital_status TEXT,
  birth_place TEXT,
  birth_location TEXT,
  birth_date TEXT,
  nationality TEXT,
  profession TEXT,

  location TEXT,
  landline_phone TEXT,
  cell_phone TEXT,
  personal_email TEXT,
  home_address TEXT,
  home_country TEXT DEFAULT 'Costa Rica',
  home_province TEXT,
  home_canton TEXT,
  residence_type TEXT,
  housing_payment REAL,
  exact_home_address TEXT,

  employer_name TEXT,
  occupation TEXT,
  gross_monthly_income REAL,
  employment_start_date TEXT,
  business_activity TEXT,
  work_location TEXT,
  work_phone TEXT,
  work_fax TEXT,
  work_email TEXT,
  work_address TEXT,
  work_country TEXT DEFAULT 'Costa Rica',
  work_province TEXT,
  work_canton TEXT,
  specific_work_address TEXT,

  spouse_id_type TEXT,
  spouse_id_number TEXT,
  spouse_full_name TEXT,
  spouse_gender TEXT,
  spouse_nationality TEXT,
  spouse_birth_place TEXT,
  spouse_employment_start_date TEXT,
  spouse_profession TEXT,
  spouse_gross_monthly_income REAL,

  reference1_name TEXT,
  reference1_phone TEXT,
  reference1_relationship TEXT,
  reference2_name TEXT,
  reference2_phone TEXT,
  reference2_relationship TEXT,

  ip_address TEXT,
  user_agent TEXT,
  access_token TEXT
);

-- ============================================
-- CORE: Contact Messages
-- ============================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  status TEXT DEFAULT 'nueva',
  assigned_to TEXT,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  subject TEXT,
  message TEXT,
  ip_address TEXT,
  user_agent TEXT
);

-- ============================================
-- CORE: Calculator Leads
-- ============================================
CREATE TABLE IF NOT EXISTS calculator_leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT DEFAULT (datetime('now')),
  email TEXT,
  full_name TEXT,
  phone TEXT,
  vehicle_type TEXT,
  vehicle_use TEXT,
  currency TEXT,
  vehicle_value REAL,
  vehicle_year INTEGER,
  down_payment REAL,
  term_months INTEGER,
  monthly_payment REAL,
  annual_rate REAL,
  ip_address TEXT,
  user_agent TEXT
);

-- ============================================
-- NOTES: Internal comments per record
-- ============================================
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT DEFAULT (datetime('now')),
  record_type TEXT NOT NULL,
  record_id INTEGER NOT NULL,
  author TEXT DEFAULT 'Admin',
  content TEXT NOT NULL
);

-- ============================================
-- ACTIVITY LOG: Audit trail
-- ============================================
CREATE TABLE IF NOT EXISTS activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT DEFAULT (datetime('now')),
  record_type TEXT NOT NULL,
  record_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  actor TEXT DEFAULT 'system'
);

-- ============================================
-- CMS: Site content blocks
-- ============================================
CREATE TABLE IF NOT EXISTS site_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  field_key TEXT NOT NULL,
  value_es TEXT NOT NULL,
  value_en TEXT,
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(page, section, field_key)
);

-- ============================================
-- CMS: Site settings
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- CMS: Partner/Dealer locations
-- ============================================
CREATE TABLE IF NOT EXISTS partner_locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT,
  address TEXT,
  province TEXT,
  latitude REAL,
  longitude REAL,
  phone TEXT,
  website TEXT,
  is_active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- Waitlist Subscribers
-- ============================================
CREATE TABLE IF NOT EXISTS waitlist_subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT DEFAULT (datetime('now')),
  email TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  converted INTEGER DEFAULT 0
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_applications_status ON loan_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created ON loan_applications(created_at);
CREATE INDEX IF NOT EXISTS idx_applications_priority ON loan_applications(priority);
CREATE INDEX IF NOT EXISTS idx_applications_token ON loan_applications(access_token);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON calculator_leads(created_at);
CREATE INDEX IF NOT EXISTS idx_notes_record ON notes(record_type, record_id);
CREATE INDEX IF NOT EXISTS idx_activity_record ON activity_log(record_type, record_id);
CREATE INDEX IF NOT EXISTS idx_content_page ON site_content(page, section);
CREATE INDEX IF NOT EXISTS idx_settings_key ON site_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_partners_active ON partner_locations(is_active);
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist_subscribers(email);

-- ============================================
-- SEED: Default site settings
-- ============================================
INSERT OR IGNORE INTO site_settings (setting_key, setting_value) VALUES
  ('phone_display', '+506 2222-3333'),
  ('phone_href', 'tel:+50622223333'),
  ('whatsapp_number', '50600000000'),
  ('whatsapp_message', 'Hola RapiMax, necesito ayuda con mi financiamiento.'),
  ('email', 'info@rapimax.com'),
  ('hours', 'Lunes a Viernes · 8:00 a. m. - 6:00 p. m.'),
  ('facebook_url', 'https://facebook.com/rapimax'),
  ('instagram_url', 'https://instagram.com/rapimax'),
  ('linkedin_url', 'https://linkedin.com/company/rapimax'),
  ('address', 'San José, Costa Rica'),
  ('legal_name', 'Rapi Moto Credit S.A.'),
  ('legal_id', '3-101-748267'),
  ('site_language', 'es');
