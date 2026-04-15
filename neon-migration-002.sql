-- Migration 002: is_recurring Spalte zur incomes Tabelle hinzufügen
-- Führe dies im Neon SQL Editor aus

ALTER TABLE incomes ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;
