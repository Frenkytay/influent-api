-- Create withdrawal table
CREATE TABLE IF NOT EXISTS withdrawal (
  withdrawal_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  bank_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  account_holder_name VARCHAR(100) NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
  request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_by INT NULL,
  reviewed_date DATETIME NULL,
  review_notes TEXT NULL,
  transfer_proof_url VARCHAR(500) NULL,
  completed_date DATETIME NULL,
  rejection_reason TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES user(user_id) ON DELETE SET NULL,
  
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_request_date (request_date)
);
