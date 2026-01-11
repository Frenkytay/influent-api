const sequelize = require('./src/config/db.js');

async function fixEnum() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB.');
    
    // Raw query to update the ENUM definition
    await sequelize.query(`
      ALTER TABLE chatRoom 
      MODIFY COLUMN status ENUM('active', 'archived', 'closed') 
      DEFAULT 'active';
    `);
    
    console.log('Successfully updated status column enum.');
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    await sequelize.close();
  }
}

fixEnum();
