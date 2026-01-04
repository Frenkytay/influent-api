import 'dotenv/config'; // Loads .env file
import sequelize from '../src/config/db.js';
import CampaignService from '../src/services/CampaignService.js';
import UserRepository from '../src/repositories/UserRepository.js';

import fs from 'fs';

async function test() {
  let userId = null;
  const logs = [];
  const log = (msg) => {
      console.log(msg);
      logs.push(msg);
  };

  try {
    // 1. Connection
    await sequelize.authenticate();
    log('DB connected.');

    // 2. Create Inactive User
    log('Creating inactive user...');
    const email = `test_inactive_${Date.now()}@example.com`;
    const user = await UserRepository.create({
        name: 'Test Inactive',
        email: email,
        password: 'password123',
        role: 'student',
        status: 'inactive'
    });
    userId = user.user_id;
    log(`User created. ID: ${userId}, Status: ${user.status}`);

    // 3. Test Access (Should Fail)
    log('Attempting to fetch campaigns (Expected: Error)...');
    try {
        await CampaignService.getAll({}, {}, { role: 'student', id: userId });
        log('❌ FAILED: Inactive user was able to fetch campaigns.');
    } catch (error) {
        if (error.message.includes('Account is restricted')) {
            if (error.statusCode === 403) {
                log('✅ PASSED: Access blocked with message: ' + error.message + ' and statusCode: ' + error.statusCode);
            } else {
                log('❌ FAILED: Correct message but wrong statusCode: ' + error.statusCode);
            }
        } else {
            log('❌ FAILED: Unexpected error message: ' + error.message);
        }
    }

    // 4. Update to Active
    log('Updating user status to active...');
    await UserRepository.update(userId, { status: 'active' });

    // 5. Test Access (Should Succeed)
    log('Attempting to fetch campaigns (Expected: Success)...');
    try {
        const campaigns = await CampaignService.getAll({}, {}, { role: 'student', id: userId });
        log(`✅ PASSED: Active user fetched ${campaigns.length} campaigns.`);
    } catch (error) {
        log('❌ FAILED: Active user failed to fetch campaigns: ' + error.message);
    }

  } catch (err) {
    log('❌ Global error: ' + err.message);
  } finally {
    if (userId) {
        log('Cleaning up test user...');
        await UserRepository.delete(userId);
    }
    await sequelize.close();
    fs.writeFileSync('verification_result.txt', logs.join('\n'));
  }
}

test();
