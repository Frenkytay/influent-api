-- Step 1: First, update any existing 'rejected' status to 'cancelled'
UPDATE campaign 
SET status = 'cancelled' 
WHERE status = 'rejected';

-- Step 2: Check if rejection_reason column exists and has data
SET @has_rejection_reason = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'campaign' 
  AND COLUMN_NAME = 'rejection_reason'
);

-- Step 3: If rejection_reason exists, rename it to cancellation_reason
SET @sql_rename = IF(@has_rejection_reason > 0, 
  'ALTER TABLE campaign CHANGE COLUMN rejection_reason cancellation_reason TEXT NULL COMMENT "Reason for cancellation (payment timeout or admin rejection)"',
  'SELECT "rejection_reason column does not exist" AS info'
);

PREPARE stmt FROM @sql_rename;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 4: If cancellation_reason doesn't exist yet, create it
SET @has_cancellation = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'campaign' 
  AND COLUMN_NAME = 'cancellation_reason'
);

SET @sql_add = IF(@has_cancellation = 0, 
  'ALTER TABLE campaign ADD COLUMN cancellation_reason TEXT NULL COMMENT "Reason for cancellation (payment timeout or admin rejection)" AFTER admin_reviewed_by',
  'SELECT "cancellation_reason column already exists" AS info'
);

PREPARE stmt2 FROM @sql_add;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- Step 5: Now safe to modify ENUM
ALTER TABLE campaign 
MODIFY COLUMN status ENUM(
  'draft',
  'admin_review', 
  'pending_payment',
  'cancelled',
  'active',
  'completed'
) DEFAULT 'draft' COMMENT 'Campaign workflow status';

-- Verification
SELECT 'Migration completed!' AS status;
SELECT COUNT(*) as cancelled_campaigns FROM campaign WHERE status = 'cancelled';
