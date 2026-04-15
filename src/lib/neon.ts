import { neon } from '@neondatabase/serverless';

export const connectionString: string | undefined =
  import.meta.env.VITE_NEON_DATABASE_URL || undefined;

export const hasNeon = !!connectionString;

export const sql = hasNeon
  ? neon(connectionString as string)
  : null;
