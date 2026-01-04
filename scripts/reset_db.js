import 'dotenv/config';
import sequelize from '../src/config/db.js';
import * as models from '../src/models/index.js'; // Ensure models are loaded so associations work

async function resetDatabase() {
  console.log('⚠️  WARNING: This script will DELETE ALL DATA in the database.');
  console.log('Tables will be dropped and recreated.');
  console.log('Waiting 5 seconds... Press Ctrl+C to cancel.');

  try {
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('Starting reset...');
    await sequelize.authenticate();
    console.log('Database connected.');

    // Force sync drops all tables and recreates them
    await sequelize.sync({ force: true });

    console.log('✅ Database reset successfully. All data deleted.');
  } catch (error) {
    console.error('❌ Failed to reset database:', error);
  } finally {
    await sequelize.close();
  }
}

resetDatabase();
