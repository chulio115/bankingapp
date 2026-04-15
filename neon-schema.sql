-- Neon Schema für Haushalt App
-- Führe dies im Neon SQL Editor aus

-- Users Tabelle (Netlify Identity User-ID als Primary Key)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,  -- Netlify Identity User ID
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Tabelle (composite PK: gleiche Kategorie-ID pro User)
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(100) NOT NULL,
  label VARCHAR(100) NOT NULL,
  bg_color VARCHAR(20) NOT NULL,
  text_color VARCHAR(20) NOT NULL,
  dot_color VARCHAR(20) NOT NULL,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id, user_id)
);

-- Incomes Tabelle
CREATE TABLE IF NOT EXISTS incomes (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  month VARCHAR(7) NOT NULL,  -- Format: YYYY-MM
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expenses Tabelle
CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category_id VARCHAR(100) REFERENCES categories(id) ON DELETE SET NULL,
  month VARCHAR(7) NOT NULL,  -- Format: YYYY-MM
  is_recurring BOOLEAN DEFAULT false,
  notes TEXT,
  debt_details JSONB,  -- Strukturierte Daten für Schulden
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes für Performance
CREATE INDEX IF NOT EXISTS idx_incomes_user_month ON incomes(user_id, month);
CREATE INDEX IF NOT EXISTS idx_expenses_user_month ON expenses(user_id, month);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);

-- Default Categories für jeden neuen User (Trigger)
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO categories (id, label, bg_color, text_color, dot_color, user_id) VALUES
    ('abo', 'Abo', '#2a2a55', '#AFA9EC', '#AFA9EC', NEW.id),
    ('fixkosten', 'Fixkosten', '#1a2a33', '#85B7EB', '#85B7EB', NEW.id),
    ('schulden', 'Schulden', '#2a3322', '#97C459', '#97C459', NEW.id),
    ('versicherung', 'Versicherung', '#2a2233', '#D4537E', '#D4537E', NEW.id),
    ('sonstiges', 'Sonstiges', '#2a2a22', '#EF9F27', '#EF9F27', NEW.id)
  ON CONFLICT (id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_default_categories
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_default_categories();
