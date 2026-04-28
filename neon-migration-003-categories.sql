-- Migration 003: Erweiterte Kategorien
-- Führe dies im Neon SQL Editor aus (console.neon.tech)

-- 1. Neue Kategorien für alle existierenden User hinzufügen
INSERT INTO categories (id, label, bg_color, text_color, dot_color, user_id)
SELECT cat.id, cat.label, cat.bg, cat.txt, cat.dot, u.id
FROM users u
CROSS JOIN (VALUES
  ('wohnen', 'Wohnen', '#1a2a33', '#85B7EB', '#85B7EB'),
  ('lebensmittel', 'Lebensmittel', '#2a3322', '#97C459', '#97C459'),
  ('mobilitaet', 'Mobilität', '#1a2a2a', '#5DCAA5', '#5DCAA5'),
  ('freizeit', 'Freizeit', '#2a2244', '#C490E4', '#C490E4'),
  ('gesundheit', 'Gesundheit', '#2a2230', '#E88EB5', '#E88EB5'),
  ('kleidung', 'Kleidung', '#2a2a3a', '#A8B8E8', '#A8B8E8')
) AS cat(id, label, bg, txt, dot)
ON CONFLICT (id, user_id) DO NOTHING;

-- 2. Bestehende Kategorien Labels/Farben aktualisieren
UPDATE categories SET label = 'Abos' WHERE id = 'abo';
UPDATE categories SET bg_color = '#2a2222', text_color = '#F0997B', dot_color = '#F0997B' WHERE id = 'schulden';
UPDATE categories SET bg_color = '#22222a', text_color = '#8888BB', dot_color = '#8888BB' WHERE id = 'fixkosten';
UPDATE categories SET bg_color = '#1a2a28', text_color = '#4ABFA0', dot_color = '#4ABFA0' WHERE id = 'tanken';

-- 3. Trigger aktualisieren (inkl. aller neuen Kategorien)
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO categories (id, label, bg_color, text_color, dot_color, user_id) VALUES
    ('wohnen', 'Wohnen', '#1a2a33', '#85B7EB', '#85B7EB', NEW.id),
    ('lebensmittel', 'Lebensmittel', '#2a3322', '#97C459', '#97C459', NEW.id),
    ('mobilitaet', 'Mobilität', '#1a2a2a', '#5DCAA5', '#5DCAA5', NEW.id),
    ('tanken', 'Tanken', '#1a2a28', '#4ABFA0', '#4ABFA0', NEW.id),
    ('abo', 'Abos', '#2a2a55', '#AFA9EC', '#AFA9EC', NEW.id),
    ('versicherung', 'Versicherung', '#2a2233', '#D4537E', '#D4537E', NEW.id),
    ('freizeit', 'Freizeit', '#2a2244', '#C490E4', '#C490E4', NEW.id),
    ('gesundheit', 'Gesundheit', '#2a2230', '#E88EB5', '#E88EB5', NEW.id),
    ('kleidung', 'Kleidung', '#2a2a3a', '#A8B8E8', '#A8B8E8', NEW.id),
    ('schulden', 'Schulden', '#2a2222', '#F0997B', '#F0997B', NEW.id),
    ('fixkosten', 'Fixkosten', '#22222a', '#8888BB', '#8888BB', NEW.id),
    ('sonstiges', 'Sonstiges', '#2a2a22', '#EF9F27', '#EF9F27', NEW.id)
  ON CONFLICT (id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
