-- Add OTP verification fields to user table
ALTER TABLE user 
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE COMMENT 'Whether email is verified',
ADD COLUMN otp_code VARCHAR(6) COMMENT 'OTP code for email verification',
ADD COLUMN otp_expires_at DATETIME COMMENT 'OTP expiration timestamp',
ADD COLUMN otp_attempts INT DEFAULT 0 COMMENT 'Number of failed OTP attempts';

-- Add index for OTP lookups
CREATE INDEX idx_email_verified ON user(email_verified);
CREATE INDEX idx_otp_expires ON user(otp_expires_at);
