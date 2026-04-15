import { neon } from '@neondatabase/serverless';

const connectionString = import.meta.env.VITE_NEON_DATABASE_URL || process.env.VITE_NEON_DATABASE_URL;

if (!connectionString) {
  console.warn('VITE_NEON_DATABASE_URL not set. Using localStorage fallback.');
}

export const sql = neon(connectionString || 'postgresql://localhost:5432/haushalt');
