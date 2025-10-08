-- Migration to add new campaign fields
-- Run this SQL script on your database

ALTER TABLE campaign 
ADD COLUMN reference_media TEXT COMMENT 'Reference photos/videos URLs (JSON array)';
ADD COLUMN platform VARCHAR(50) COMMENT 'Instagram, TikTok, YouTube, etc.',
ADD COLUMN influencer_count INT DEFAULT 0 COMMENT 'Number of influencers needed',
ADD COLUMN campaign_price DECIMAL(12, 2) COMMENT 'Total campaign budget',
ADD COLUMN start_date DATE COMMENT 'Campaign start date',
ADD COLUMN end_date DATE COMMENT 'Campaign end date',
ADD COLUMN submission_deadline DATE COMMENT 'Content submission deadline',
ADD COLUMN content_guidelines TEXT COMMENT 'Guidelines for content creation',
ADD COLUMN caption_guidelines TEXT COMMENT 'Guidelines for captions',
ADD COLUMN reference_media TEXT COMMENT 'Reference photos/videos URLs (JSON array)';