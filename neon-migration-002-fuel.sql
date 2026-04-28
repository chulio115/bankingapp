-- Migration 002: Tanken Feature
-- Führe dies im Neon SQL Editor aus (console.neon.tech)

-- 1. "Tanken" als Default-Kategorie für alle existierenden User
INSERT INTO categories (id, label, bg_color, text_color, dot_color, user_id)
SELECT 'tanken', 'Tanken', '#1a2a2a', '#5DCAA5', '#5DCAA5', id
FROM users
ON CONFLICT (id, user_id) DO NOTHING;

-- 2. Default-Kategorie-Trigger aktualisieren (inkl. Tanken)
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO categories (id, label, bg_color, text_color, dot_color, user_id) VALUES
    ('abo', 'Abo', '#2a2a55', '#AFA9EC', '#AFA9EC', NEW.id),
    ('fixkosten', 'Fixkosten', '#1a2a33', '#85B7EB', '#85B7EB', NEW.id),
    ('schulden', 'Schulden', '#2a3322', '#97C459', '#97C459', NEW.id),
    ('versicherung', 'Versicherung', '#2a2233', '#D4537E', '#D4537E', NEW.id),
    ('sonstiges', 'Sonstiges', '#2a2a22', '#EF9F27', '#EF9F27', NEW.id),
    ('tanken', 'Tanken', '#1a2a2a', '#5DCAA5', '#5DCAA5', NEW.id)
  ON CONFLICT (id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Fuel Entries Tabelle
CREATE TABLE IF NOT EXISTS fuel_entries (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  price_per_liter DECIMAL(5, 3) NOT NULL,  -- z.B. 1.729
  liters DECIMAL(7, 2) NOT NULL,            -- z.B. 42.31
  total_amount DECIMAL(10, 2) NOT NULL,     -- z.B. 73.15
  odometer INTEGER,                          -- Kilometerstand (optional)
  is_full_tank BOOLEAN DEFAULT true,
  station_name VARCHAR(255),                 -- Tankstelle (optional)
  expense_id VARCHAR(100) REFERENCES expenses(id) ON DELETE SET NULL,
  month VARCHAR(7) NOT NULL,                 -- Format: YYYY-MM
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_fuel_entries_user_month ON fuel_entries(user_id, month);
CREATE INDEX IF NOT EXISTS idx_fuel_entries_user_date ON fuel_entries(user_id, date);
