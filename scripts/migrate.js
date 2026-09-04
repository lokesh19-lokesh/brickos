import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONNECTION_STRING = process.env.DATABASE_URL || 'postgresql://postgres:Brickserp04_09_2026@db.apvacpivgvbuutfdwemx.supabase.co:5432/postgres';

const migrationFiles = [
  '001_initial_schema.sql',
  '002_rls_and_security.sql',
  '003_functions_and_triggers.sql',
  '004_reporting_views.sql',
  '005_storage_buckets.sql',
  '006_seed_data.sql',
];

async function runMigrations() {
  console.log('Connecting to Supabase PostgreSQL...');
  const client = new pg.Client({
    connectionString: CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database successfully.\n');

    for (const file of migrationFiles) {
      const filePath = path.join(__dirname, '../supabase/migrations', file);
      console.log(`Executing migration: ${file}...`);
      const sql = fs.readFileSync(filePath, 'utf-8');
      
      await client.query(sql);
      console.log(`✓ Migration ${file} executed successfully.\n`);
    }

    // Verify created tables
    const res = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `);
    console.log('Total public tables in Supabase:');
    console.table(res.rows);

    console.log('\nAll migrations completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
