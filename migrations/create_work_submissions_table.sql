-- Create work_submissions table for tracking student work submissions
CREATE TABLE IF NOT EXISTS work_submissions (
  submission_id INT AUTO_INCREMENT PRIMARY KEY,
  campaign_user_id INT NOT NULL COMMENT 'Reference to CampaignUsers (contains campaign_id and student_id)',
  submission_type ENUM('draft', 'final') DEFAULT 'draft' COMMENT 'Type of submission',
  content_type VARCHAR(50) COMMENT 'Type of content (e.g., post, story, reel, video)',
  content_url VARCHAR(255) COMMENT 'URL to the submitted content/media',
  content_files JSON COMMENT 'Array of uploaded file paths/URLs',
  caption TEXT COMMENT 'Caption/description for the content',
  hashtags JSON COMMENT 'Array of hashtags used',
  platform VARCHAR(50) COMMENT 'Social media platform (Instagram, TikTok, etc.)',
  submission_notes TEXT COMMENT 'Additional notes from student',
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'When the work was submitted',
  status ENUM('pending', 'under_review', 'approved', 'rejected', 'revision_requested') DEFAULT 'pending' COMMENT 'Current status of submission',
  reviewed_by INT COMMENT 'User ID of reviewer (campaign owner)',
  reviewed_at DATETIME COMMENT 'When the submission was reviewed',
  review_notes TEXT COMMENT 'Feedback from reviewer',
  approved_at DATETIME COMMENT 'When the submission was accepted',
  rejected_at DATETIME COMMENT 'When the submission was rejected',
  revision_count INT DEFAULT 0 COMMENT 'Number of times revision was requested',
  performance_metrics JSON COMMENT 'Performance data (views, likes, shares, etc.)',
  is_published BOOLEAN DEFAULT FALSE COMMENT 'Whether content has been published on platform',
  published_at DATETIME COMMENT 'When content was published',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key constraint
  CONSTRAINT fk_submission_campaign_user FOREIGN KEY (campaign_user_id) REFERENCES campaignUsers(id) ON DELETE CASCADE,
  
  -- Indexes for performance
  INDEX idx_campaign_user (campaign_user_id),
  INDEX idx_status (status),
  INDEX idx_submitted_at (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
