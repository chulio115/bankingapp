# Haushalt – Personal Finance PWA

Eine persönliche Finanz-App als Progressive Web App mit Neon PostgreSQL Datenbank.

## Tech Stack

- **React 18** + Vite + TypeScript
- **Tailwind CSS** für Styling
- **Recharts** für Donut-Charts
- **Zustand** für State Management
- **netlify-identity-widget** für Auth
- **Neon PostgreSQL** für Datenbank (kostenlos bis 3GB)
- **@neondatabase/serverless** für Serverless DB-Verbindung

## Setup

### 1. Neon Datenbank erstellen

1. Gehe zu https://neon.tech
2. **Sign up** (kostenlos mit GitHub)
3. **New Project** → Name: `haushalt-db`, Region: Frankfurt
4. Nach Erstellung: **SQL Editor** öffnen
5. Kopiere den Inhalt von `neon-schema.sql` und führe ihn aus

### 2. Connection String konfigurieren

1. Im Neon Dashboard: **Connection Details** → **Connection string** kopieren
2. Lokal: `.env` Datei erstellen:
   ```bash
   cp .env.example .env
   # .env öffnen und VITE_NEON_DATABASE_URL einfügen
   ```
3. Netlify: **Site Settings → Environment variables**
   - `VITE_NEON_DATABASE_URL` = dein Connection String

### 3. App starten

```bash
npm install
npm run dev
```

## Netlify Deployment

1. Repository mit Netlify verbinden
2. Build-Einstellungen:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Identity aktivieren unter **Site Settings → Identity**
4. Environment Variable `VITE_NEON_DATABASE_URL` hinzufügen
5. Registration Preferences nach Bedarf konfigurieren

## PWA Installation (iPhone)

1. App im Safari öffnen
2. Share-Button (Teilen) antippen
3. "Zum Home-Bildschirm" wählen
4. "Hinzufügen" bestätigen

## Features

- **Übersicht:** Monatsübersicht mit Donut-Chart, freies Geld, Einnahmen/Ausgaben
- **Positionen:** Alle Einnahmen und Ausgaben verwalten, nach Kategorie gruppiert
- **Schulden:** Detailansicht mit Fortschrittsbalken und Restlaufzeit
- **Einstellungen:** Profil, Kategorien verwalten, JSON-Export, Abmelden
- **Multi-Device:** Daten werden in Neon gespeichert, auf allen Geräten synchron

## Datenformat

Alle Geldbeträge werden in deutscher Formatierung angezeigt: `1.234,56 €`

Daten werden pro Monat (Format `YYYY-MM`) in Neon PostgreSQL gespeichert mit User-Isolation über Netlify Identity.
