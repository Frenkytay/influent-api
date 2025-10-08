-- Migration to create campaign_content_types table
-- This table handles multiple content types per campaign

CREATE TABLE campaign_content_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT NOT NULL,
  content_type VARCHAR(100) NOT NULL COMMENT 'Instagram Post, Instagram Story, TikTok Video, etc.',
  post_count INT DEFAULT 1 COMMENT 'Number of posts for this content type',
  price_per_post DECIMAL(10, 2) COMMENT 'Price per post for this content type',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (campaign_id) REFERENCES campaign(campaign_id) ON DELETE CASCADE,
  INDEX idx_campaign_id (campaign_id)
) COMMENT 'Content types and quantities for each campaign';