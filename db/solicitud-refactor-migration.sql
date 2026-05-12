-- Solicitud form refactor migration — Run on rapimax-prod D1 Console
-- New fields: currency, birth geographic dropdowns, neighborhood

ALTER TABLE loan_applications ADD COLUMN requested_currency TEXT DEFAULT 'USD';
ALTER TABLE loan_applications ADD COLUMN birth_country TEXT;
ALTER TABLE loan_applications ADD COLUMN birth_province TEXT;
ALTER TABLE loan_applications ADD COLUMN birth_canton TEXT;
ALTER TABLE loan_applications ADD COLUMN neighborhood TEXT;
ALTER TABLE loan_applications ADD COLUMN work_neighborhood TEXT;
