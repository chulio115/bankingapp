-- Migration 001: Fix constraints
-- Führe dies im Neon SQL Editor aus

-- 1. Fix categories: Drop alte PK, neue composite PK setzen
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_pkey;
ALTER TABLE categories ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE categories ADD PRIMARY KEY (id, user_id);

-- 2. Sicherstellen dass users PK existiert
-- (sollte schon existieren, aber zur Sicherheit)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_pkey'
  ) THEN
    ALTER TABLE users ADD PRIMARY KEY (id);
  END IF;
END $$;
