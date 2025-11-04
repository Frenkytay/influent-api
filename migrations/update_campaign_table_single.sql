-- Migration to update campaign table with all required fields
-- Run this entire script at once

-- Add new columns
ALTER TABLE campaign 
ADD COLUMN campaign_category VARCHAR(100) COMMENT 'Category of campaign (e.g., Fashion, Beauty, Tech)',
ADD COLUMN influencer_category JSON COMMENT 'Array of influencer categories',
ADD COLUMN has_product BOOLEAN DEFAULT FALSE COMMENT 'Whether campaign has a product',
ADD COLUMN product_name VARCHAR(255) COMMENT 'Name of the product',
ADD COLUMN product_value DECIMAL(12, 2) COMMENT 'Value/price of the product',
ADD COLUMN product_desc TEXT COMMENT 'Description of the product',
ADD COLUMN content_reference TEXT COMMENT 'Reference description for content',
ADD COLUMN reference_files JSON COMMENT 'Array of reference file URLs',
ADD COLUMN min_followers INT COMMENT 'Minimum followers required for influencers',
ADD COLUMN selected_gender VARCHAR(50) COMMENT 'Target gender for influencers',
ADD COLUMN selected_age VARCHAR(100) COMMENT 'Target age range for influencers (e.g., 18-25)',
ADD COLUMN criteria_desc TEXT COMMENT 'Description of selection criteria',
ADD COLUMN reference_images JSON COMMENT 'Array of reference image paths',
ADD INDEX idx_campaign_category (campaign_category),
ADD INDEX idx_student_id (student_id),
ADD INDEX idx_status (status),
ADD INDEX idx_created_at (created_at);