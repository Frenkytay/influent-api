-- Migration to add image fields to existing tables

-- Add image fields to campaign table
ALTER TABLE campaign 
ADD COLUMN banner_image VARCHAR(255) COMMENT 'Campaign banner image path',
ADD COLUMN reference_images TEXT COMMENT 'JSON array of reference image paths';

-- Add image field to user table  
ALTER TABLE user 
ADD COLUMN profile_image VARCHAR(255) COMMENT 'User profile image path';