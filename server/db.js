import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'zendb',
  user: process.env.DB_USER || 'zen',
  password: process.env.DB_PASSWORD || 'zen123',
});

export async function query(text, params = []) {
  return pool.query(text, params);
}

export async function closePool() {
  return pool.end();
}
