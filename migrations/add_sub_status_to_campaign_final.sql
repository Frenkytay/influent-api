-- Migration: Add sub_status to campaign table
-- Date: 2025-12-16
-- Description: Add sub_status ENUM field for active campaign workflow tracking

ALTER TABLE campaign 
ADD COLUMN sub_status ENUM(
    'registration_open',
    'student_selection', 
    'student_confirmation',
    'content_submission',
    'content_revision',
    'violation_reported',
    'violation_confirmed',
    'posting',
    'payout_success'
) NULL COMMENT 'Sub-status for active campaigns - tracks workflow states' AFTER status;
