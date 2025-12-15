/**
 * Migration Runner for sub_status
 * Run this with: node migrations/run-sub-status-migration.js
 */

import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      ssl: { rejectUnauthorized: false },
      multipleStatements: true
    });

    console.log('✅ Connected to database\n');

    // Read the migration file
    const migrationPath = join(__dirname, 'add_sub_status_to_campaign_final.sql');
    const sql = readFileSync(migrationPath, 'utf8');

    console.log('📝 Running migration: add_sub_status_to_campaign_final.sql\n');

    // Check if column exists
    const [checkResult] = await connection.query(`
      SELECT COUNT(*) as count
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'campaign'
        AND COLUMN_NAME = 'sub_status'
    `);

    if (checkResult[0].count > 0) {
      console.log('ℹ️  Column sub_status already exists. Skipping...');
    } else {
      // Execute the migration
      await connection.query(sql);
      console.log('✅ Column sub_status added successfully!');
      
      // Set default for active campaigns
      const [updateResult] = await connection.query(`
        UPDATE campaign 
        SET sub_status = 'registration_open' 
        WHERE status = 'active' 
        AND sub_status IS NULL
      `);
      console.log(`✅ Updated ${updateResult.affectedRows} active campaign(s)`);
    }
    
    // Verification
    const [verification] = await connection.query(`
      SELECT 
        COUNT(*) as total_campaigns,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_campaigns,
        SUM(CASE WHEN sub_status IS NOT NULL THEN 1 ELSE 0 END) as campaigns_with_substatus
      FROM campaign
    `);
    
    console.log('\n📊 Verification:');
    console.table(verification);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

runMigration();
