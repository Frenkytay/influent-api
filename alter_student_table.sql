ALTER TABLE student
ADD COLUMN instagram_id VARCHAR(255) UNIQUE COMMENT 'Instagram Business Account ID',
ADD COLUMN facebook_access_token TEXT COMMENT 'Long-lived Facebook User Access Token',
ADD COLUMN instagram_followers_count INT DEFAULT 0 COMMENT 'Instagram Followers Count',
ADD COLUMN instagram_username VARCHAR(255) COMMENT 'Instagram Username';
