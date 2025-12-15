/**
 * Migration Runner for notifications table
 */

import { Sequelize } from 'sequelize';
import config from '../src/config/config.js';
import fs from 'fs';

const mysqlConfig = config.mysql || config;

const sequelize = new Sequelize(
  mysqlConfig.database, 
  mysqlConfig.user || mysqlConfig.username, 
  mysqlConfig.password, 
  {
    host: mysqlConfig.host,
    port: mysqlConfig.port || 3306,
    dialect: 'mysql',
    logging: console.log
  }
);

async function runMigration() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    console.log('\n🔄 Creating notifications table...');
    
    // Read SQL file
    const sql = fs.readFileSync('./migrations/create_notifications_table.sql', 'utf8');
    
    // Execute SQL
    await sequelize.query(sql);
    
    console.log('✅ Notifications table created successfully');

    console.log('\n🔄 Verifying table...');
    const [tables] = await sequelize.query(`SHOW TABLES LIKE 'notifications'`);
    
    if (tables.length > 0) {
      const [columns] = await sequelize.query(`DESCRIBE notifications`);
      console.log('\n📊 Table structure:');
      columns.forEach(col => {
        console.log(`   - ${col.Field} (${col.Type})`);
      });
      console.log('\n✅ Migration completed successfully!');
    } else {
      console.log('❌ Table was not created');
    }
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Error details:', error);
    await sequelize.close();
    process.exit(1);
  }
}

runMigration();
