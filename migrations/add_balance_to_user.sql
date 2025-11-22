    -- Add balance column to user table
    ALTER TABLE user ADD COLUMN balance DECIMAL(12, 2) DEFAULT 0.00 AFTER status;

    -- Add index for balance queries
    CREATE INDEX idx_user_balance ON user(balance);
