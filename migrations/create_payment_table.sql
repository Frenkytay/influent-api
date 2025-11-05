-- Migration to create payment table
CREATE TABLE IF NOT EXISTS payment (
  payment_id INT PRIMARY KEY AUTO_INCREMENT,
  order_id VARCHAR(255) UNIQUE,
  campaign_id INT,
  user_id INT,
  amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(50),
  payment_type VARCHAR(50),
  transaction_time DATETIME,
  raw_response JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_campaign_id (campaign_id),
  INDEX idx_user_id (user_id),
  CONSTRAINT fk_payment_campaign FOREIGN KEY (campaign_id) REFERENCES campaign(campaign_id) ON DELETE SET NULL,
  CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE SET NULL
);
