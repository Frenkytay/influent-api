-- Create transaction history table
CREATE TABLE IF NOT EXISTS transaction (
  transaction_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  type ENUM('credit', 'debit') NOT NULL,
  category ENUM('campaign_payment', 'withdrawal', 'refund', 'bonus', 'penalty', 'adjustment') NOT NULL,
  reference_type VARCHAR(50) NULL COMMENT 'campaign_users, withdrawal, etc',
  reference_id INT NULL COMMENT 'ID of related record',
  description TEXT NULL,
  balance_before DECIMAL(12, 2) NOT NULL,
  balance_after DECIMAL(12, 2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
  
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_category (category),
  INDEX idx_created_at (created_at),
  INDEX idx_reference (reference_type, reference_id)
);
