import { neon } from '@neondatabase/serverless';

const connectionString = import.meta.env.VITE_NEON_DATABASE_URL || process.env.VITE_NEON_DATABASE_URL;

console.log('Neon connection string exists:', !!connectionString);
console.log('Connection string (truncated):', connectionString ? connectionString.substring(0, 30) + '...' : 'none');

let sql: ReturnType<typeof neon>;

if (!connectionString) {
  console.error('VITE_NEON_DATABASE_URL not set!');
  sql = neon('postgresql://localhost:5432/haushalt');
} else {
  try {
    sql = neon(connectionString);
    console.log('Neon connection initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Neon connection:', error);
    sql = neon('postgresql://localhost:5432/haushalt');
  }
}

export { sql };
