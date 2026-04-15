# Haushalt – Personal Finance PWA

Eine persönliche Finanz-App als Progressive Web App.

## Tech Stack

- **React 18** + Vite + TypeScript
- **Tailwind CSS** für Styling
- **Recharts** für Donut-Charts
- **Zustand** für State Management
- **netlify-identity-widget** für Auth
- **vite-plugin-pwa** für PWA-Funktionalität
- **localStorage** als Datenspeicher (v1)

## Setup

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
4. Registration Preferences nach Bedarf konfigurieren

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

## Datenformat

Alle Geldbeträge werden in deutscher Formatierung angezeigt: `1.234,56 €`

Daten werden pro Monat (Format `YYYY-MM`) in localStorage gespeichert.
