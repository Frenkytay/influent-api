-- Migration: Add cancellation_reason column to campaign table
-- This replaces the old rejection_reason field
-- Run this migration to fix: Unknown column 'Campaign.cancellation_reason' error

-- Step 1: Check if rejection_reason exists and rename it
SET @column_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'campaign' 
  AND COLUMN_NAME = 'rejection_reason'
);

-- If rejection_reason exists, rename it to cancellation_reason
SET @sql_rename = IF(@column_exists > 0, 
  'ALTER TABLE campaign CHANGE COLUMN rejection_reason cancellation_reason TEXT NULL COMMENT "Reason for cancellation (payment timeout or admin rejection)";',
  'SELECT "Column rejection_reason does not exist, skipping rename" AS message;'
);

PREPARE stmt_rename FROM @sql_rename;
EXECUTE stmt_rename;
DEALLOCATE PREPARE stmt_rename;

-- Step 2: If cancellation_reason still doesn't exist, create it
SET @column_exists_new = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'campaign' 
  AND COLUMN_NAME = 'cancellation_reason'
);

SET @sql_add = IF(@column_exists_new = 0, 
  'ALTER TABLE campaign ADD COLUMN cancellation_reason TEXT NULL COMMENT "Reason for cancellation (payment timeout or admin rejection)" AFTER admin_reviewed_by;',
  'SELECT "Column cancellation_reason already exists" AS message;'
);

PREPARE stmt_add FROM @sql_add;
EXECUTE stmt_add;
DEALLOCATE PREPARE stmt_add;

-- Step 3: Update status ENUM to use 'cancelled' instead of 'rejected' (if needed)
-- Check current ENUM values
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'campaign' 
AND COLUMN_NAME = 'status';

-- If 'rejected' exists in ENUM, update it to 'cancelled'
-- Note: This is safe only if no data uses 'rejected' status or you've already updated the data
-- UPDATE campaign SET status = 'cancelled' WHERE status = 'rejected';

-- Then modify the ENUM
ALTER TABLE campaign 
MODIFY COLUMN status ENUM(
  'draft',
  'admin_review', 
  'pending_payment',
  'cancelled',
  'active',
  'completed'
) DEFAULT 'draft' COMMENT 'Campaign workflow status';

-- Verification query
SELECT 
  COLUMN_NAME,
  COLUMN_TYPE,
  IS_NULLABLE,
  COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'campaign' 
AND COLUMN_NAME IN ('cancellation_reason', 'status')
ORDER BY ORDINAL_POSITION;

SELECT 'Migration completed successfully!' AS status;
