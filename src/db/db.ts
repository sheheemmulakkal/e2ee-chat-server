// src/db.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Helper to query the DB (provides type safety for parameters)
export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export default pool;