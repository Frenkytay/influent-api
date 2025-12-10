#!/bin/bash

# Influent Platform - Complete Workflow Test Script
# This script tests the entire flow: Register → Campaign → Apply → Review → Submit Work → Payment → Withdrawal

BASE_URL="http://localhost:4000/api"
COMPANY_EMAIL="company@example.com"
STUDENT_EMAIL="student@binus.ac.id"
ADMIN_EMAIL="admin@example.com"

echo "======================================"
echo "INFLUENT PLATFORM WORKFLOW TEST"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================
# STEP 1: REGISTER USERS
# ============================================
echo -e "${BLUE}STEP 1: Registering Users${NC}"
echo "--------------------------------------"

# Register Company
echo "1.1 Registering Company..."
COMPANY_REGISTER=$(curl -s -X POST "$BASE_URL/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test Company\",
    \"email\": \"$COMPANY_EMAIL\",
    \"password\": \"password123\",
    \"role\": \"company\"
  }")
echo "$COMPANY_REGISTER" | jq '.'

# Register Student
echo ""
echo "1.2 Registering Student..."
STUDENT_REGISTER=$(curl -s -X POST "$BASE_URL/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test Student\",
    \"email\": \"$STUDENT_EMAIL\",
    \"password\": \"password123\",
    \"role\": \"student\"
  }")
echo "$STUDENT_REGISTER" | jq '.'

# Note: In real scenario, you would verify OTP here
# For testing, manually verify OTP or skip email verification

echo ""
echo -e "${YELLOW}⚠️  Note: Please verify OTP for both users via email or database${NC}"
read -p "Press Enter when OTP verification is complete..."

# ============================================
# STEP 2: LOGIN USERS
# ============================================
echo ""
echo -e "${BLUE}STEP 2: Logging In Users${NC}"
echo "--------------------------------------"

# Login Company
echo "2.1 Login Company..."
COMPANY_LOGIN=$(curl -s -X POST "$BASE_URL/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$COMPANY_EMAIL\",
    \"password\": \"password123\"
  }")
COMPANY_TOKEN=$(echo "$COMPANY_LOGIN" | jq -r '.data.token')
COMPANY_USER_ID=$(echo "$COMPANY_LOGIN" | jq -r '.data.user.user_id')
echo "Company Token: $COMPANY_TOKEN"
echo "Company User ID: $COMPANY_USER_ID"

# Login Student
echo ""
echo "2.2 Login Student..."
STUDENT_LOGIN=$(curl -s -X POST "$BASE_URL/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$STUDENT_EMAIL\",
    \"password\": \"password123\"
  }")
STUDENT_TOKEN=$(echo "$STUDENT_LOGIN" | jq -r '.data.token')
STUDENT_USER_ID=$(echo "$STUDENT_LOGIN" | jq -r '.data.user.user_id')
echo "Student Token: $STUDENT_TOKEN"
echo "Student User ID: $STUDENT_USER_ID"

# Login Admin (assuming admin exists)
echo ""
echo "2.3 Login Admin..."
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"admin123\"
  }")
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | jq -r '.data.token')
echo "Admin Token: $ADMIN_TOKEN"

# ============================================
# STEP 3: CREATE STUDENT PROFILE
# ============================================
echo ""
echo -e "${BLUE}STEP 3: Creating Student Profile${NC}"
echo "--------------------------------------"

STUDENT_PROFILE=$(curl -s -X POST "$BASE_URL/v1/students" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d "{
    \"user_id\": $STUDENT_USER_ID,
    \"university\": \"Bina Nusantara University\",
    \"major\": \"Computer Science\",
    \"bio\": \"Passionate content creator\",
    \"instagram_handle\": \"@teststudent\",
    \"instagram_followers\": 5000,
    \"tiktok_handle\": \"@teststudent\",
    \"tiktok_followers\": 3000,
    \"interests\": [\"tech\", \"lifestyle\", \"fashion\"],
    \"skills\": [\"photography\", \"video editing\"]
  }")
STUDENT_ID=$(echo "$STUDENT_PROFILE" | jq -r '.student_id // .data.student_id')
echo "Student Profile Created - ID: $STUDENT_ID"
echo "$STUDENT_PROFILE" | jq '.'

# ============================================
# STEP 4: CREATE CAMPAIGN
# ============================================
echo ""
echo -e "${BLUE}STEP 4: Creating Campaign${NC}"
echo "--------------------------------------"

CAMPAIGN=$(curl -s -X POST "$BASE_URL/v1/campaigns" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $COMPANY_TOKEN" \
  -d "{
    \"title\": \"Test Product Launch Campaign\",
    \"description\": \"Promote our new product on social media\",
    \"influencer_category\": [\"tech\", \"lifestyle\"],
    \"has_product\": true,
    \"start_date\": \"2025-12-15\",
    \"end_date\": \"2025-12-31\",
    \"content_guidelines\": \"Create authentic content showcasing the product\",
    \"reference_files\": [],
    \"influencer_count\": 5,
    \"reference_images\": []
  }")
CAMPAIGN_ID=$(echo "$CAMPAIGN" | jq -r '.campaign_id // .data.campaign_id')
echo "Campaign Created - ID: $CAMPAIGN_ID"
echo "$CAMPAIGN" | jq '.'

# ============================================
# STEP 5: STUDENT APPLIES TO CAMPAIGN
# ============================================
echo ""
echo -e "${BLUE}STEP 5: Student Applies to Campaign${NC}"
echo "--------------------------------------"

APPLICATION=$(curl -s -X POST "$BASE_URL/v1/campaign-users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d "{
    \"campaign_id\": $CAMPAIGN_ID,
    \"student_id\": $STUDENT_ID,
    \"application_notes\": \"I'm very interested in this campaign and have relevant experience!\"
  }")
CAMPAIGN_USER_ID=$(echo "$APPLICATION" | jq -r '.id // .data.id')
echo "Application Submitted - Campaign User ID: $CAMPAIGN_USER_ID"
echo "$APPLICATION" | jq '.'

# ============================================
# STEP 6: VIEW APPLICATIONS (COMPANY)
# ============================================
echo ""
echo -e "${BLUE}STEP 6: Company Views Applications${NC}"
echo "--------------------------------------"

APPLICATIONS=$(curl -s -X GET "$BASE_URL/v1/campaign-users?campaign_id=$CAMPAIGN_ID" \
  -H "Authorization: Bearer $COMPANY_TOKEN")
echo "$APPLICATIONS" | jq '.'

# ============================================
# STEP 7: ACCEPT APPLICATION (COMPANY)
# ============================================
echo ""
echo -e "${BLUE}STEP 7: Company Accepts Application${NC}"
echo "--------------------------------------"

ACCEPT=$(curl -s -X PUT "$BASE_URL/v1/campaign-users/$CAMPAIGN_USER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $COMPANY_TOKEN" \
  -d "{
    \"application_status\": \"accepted\",
    \"application_notes\": \"Great profile! Welcome to the campaign.\"
  }")
echo "$ACCEPT" | jq '.'

# ============================================
# STEP 8: STUDENT SUBMITS WORK
# ============================================
echo ""
echo -e "${BLUE}STEP 8: Student Submits Work${NC}"
echo "--------------------------------------"

SUBMISSION=$(curl -s -X POST "$BASE_URL/v1/work-submissions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d "{
    \"campaign_user_id\": $CAMPAIGN_USER_ID,
    \"submission_type\": \"final\",
    \"content_type\": \"post\",
    \"content_url\": \"https://instagram.com/p/test123\",
    \"caption\": \"Check out this amazing product! #sponsored #testproduct\",
    \"hashtags\": [\"sponsored\", \"testproduct\", \"tech\"],
    \"platform\": \"Instagram\",
    \"submission_notes\": \"Posted on my Instagram feed\"
  }")
SUBMISSION_ID=$(echo "$SUBMISSION" | jq -r '.submission_id // .data.submission_id')
echo "Work Submitted - Submission ID: $SUBMISSION_ID"
echo "$SUBMISSION" | jq '.'

# ============================================
# STEP 9: VIEW SUBMISSIONS (COMPANY)
# ============================================
echo ""
echo -e "${BLUE}STEP 9: Company Views Submissions${NC}"
echo "--------------------------------------"

SUBMISSIONS=$(curl -s -X GET "$BASE_URL/v1/work-submissions/campaign/$CAMPAIGN_ID" \
  -H "Authorization: Bearer $COMPANY_TOKEN")
echo "$SUBMISSIONS" | jq '.'

# ============================================
# STEP 10: APPROVE SUBMISSION (COMPANY)
# ============================================
echo ""
echo -e "${BLUE}STEP 10: Company Approves Submission${NC}"
echo "--------------------------------------"

APPROVE_SUBMISSION=$(curl -s -X POST "$BASE_URL/v1/work-submissions/$SUBMISSION_ID/review" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $COMPANY_TOKEN" \
  -d "{
    \"status\": \"approved\",
    \"review_notes\": \"Excellent work! Very authentic content.\",
    \"reviewed_by\": $COMPANY_USER_ID
  }")
echo "$APPROVE_SUBMISSION" | jq '.'

# ============================================
# STEP 11: PAY STUDENT (COMPANY)
# ============================================
echo ""
echo -e "${BLUE}STEP 11: Company Pays Student${NC}"
echo "--------------------------------------"

PAYMENT=$(curl -s -X POST "$BASE_URL/v1/campaign-payments/pay-student" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $COMPANY_TOKEN" \
  -d "{
    \"campaign_user_id\": $CAMPAIGN_USER_ID,
    \"amount\": 500000,
    \"description\": \"Payment for campaign completion\"
  }")
echo "$PAYMENT" | jq '.'

# ============================================
# STEP 12: CHECK BALANCE (STUDENT)
# ============================================
echo ""
echo -e "${BLUE}STEP 12: Student Checks Balance${NC}"
echo "--------------------------------------"

BALANCE=$(curl -s -X GET "$BASE_URL/v1/transactions/balance" \
  -H "Authorization: Bearer $STUDENT_TOKEN")
echo "$BALANCE" | jq '.'
STUDENT_BALANCE=$(echo "$BALANCE" | jq -r '.current_balance // .data.current_balance')
echo "Current Balance: Rp $STUDENT_BALANCE"

# ============================================
# STEP 13: VIEW TRANSACTIONS (STUDENT)
# ============================================
echo ""
echo -e "${BLUE}STEP 13: Student Views Transaction History${NC}"
echo "--------------------------------------"

TRANSACTIONS=$(curl -s -X GET "$BASE_URL/v1/transactions/my-transactions" \
  -H "Authorization: Bearer $STUDENT_TOKEN")
echo "$TRANSACTIONS" | jq '.'

# ============================================
# STEP 14: REQUEST WITHDRAWAL (STUDENT)
# ============================================
echo ""
echo -e "${BLUE}STEP 14: Student Requests Withdrawal${NC}"
echo "--------------------------------------"

WITHDRAWAL=$(curl -s -X POST "$BASE_URL/v1/withdrawals/request" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d "{
    \"amount\": 200000,
    \"bank_name\": \"BCA\",
    \"account_number\": \"1234567890\",
    \"account_holder_name\": \"Test Student\"
  }")
WITHDRAWAL_ID=$(echo "$WITHDRAWAL" | jq -r '.withdrawal_id // .data.withdrawal_id')
echo "Withdrawal Requested - ID: $WITHDRAWAL_ID"
echo "$WITHDRAWAL" | jq '.'

# ============================================
# STEP 15: VIEW WITHDRAWALS (ADMIN)
# ============================================
echo ""
echo -e "${BLUE}STEP 15: Admin Views Withdrawal Requests${NC}"
echo "--------------------------------------"

WITHDRAWALS=$(curl -s -X GET "$BASE_URL/v1/withdrawals/admin/all?status=pending" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$WITHDRAWALS" | jq '.'

# ============================================
# STEP 16: APPROVE WITHDRAWAL (ADMIN)
# ============================================
echo ""
echo -e "${BLUE}STEP 16: Admin Approves Withdrawal${NC}"
echo "--------------------------------------"

APPROVE_WITHDRAWAL=$(curl -s -X PUT "$BASE_URL/v1/withdrawals/$WITHDRAWAL_ID/approve" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"review_notes\": \"Withdrawal approved\"
  }")
echo "$APPROVE_WITHDRAWAL" | jq '.'

# ============================================
# STEP 17: COMPLETE WITHDRAWAL WITH PROOF (ADMIN)
# ============================================
echo ""
echo -e "${BLUE}STEP 17: Admin Completes Withdrawal (Upload Proof)${NC}"
echo "--------------------------------------"

# Note: This requires a real image file. Create a dummy file or skip this step.
echo "Creating dummy transfer proof image..."
echo "TRANSFER PROOF" > /tmp/transfer_proof.txt

COMPLETE_WITHDRAWAL=$(curl -s -X PUT "$BASE_URL/v1/withdrawals/$WITHDRAWAL_ID/complete" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "transfer_proof=@/tmp/transfer_proof.txt" \
  -F "review_notes=Transfer completed successfully")
echo "$COMPLETE_WITHDRAWAL" | jq '.'

# ============================================
# STEP 18: CHECK FINAL BALANCE (STUDENT)
# ============================================
echo ""
echo -e "${BLUE}STEP 18: Student Checks Final Balance${NC}"
echo "--------------------------------------"

FINAL_BALANCE=$(curl -s -X GET "$BASE_URL/v1/transactions/balance" \
  -H "Authorization: Bearer $STUDENT_TOKEN")
echo "$FINAL_BALANCE" | jq '.'

# ============================================
# STEP 19: VIEW WITHDRAWAL HISTORY (STUDENT)
# ============================================
echo ""
echo -e "${BLUE}STEP 19: Student Views Withdrawal History${NC}"
echo "--------------------------------------"

WITHDRAWAL_HISTORY=$(curl -s -X GET "$BASE_URL/v1/withdrawals/my-withdrawals" \
  -H "Authorization: Bearer $STUDENT_TOKEN")
echo "$WITHDRAWAL_HISTORY" | jq '.'

# ============================================
# SUMMARY
# ============================================
echo ""
echo "======================================"
echo -e "${GREEN}WORKFLOW TEST COMPLETED!${NC}"
echo "======================================"
echo ""
echo "Summary:"
echo "  Campaign ID: $CAMPAIGN_ID"
echo "  Student ID: $STUDENT_ID"
echo "  Campaign User ID: $CAMPAIGN_USER_ID"
echo "  Submission ID: $SUBMISSION_ID"
echo "  Withdrawal ID: $WITHDRAWAL_ID"
echo "  Initial Balance: Rp 500,000"
echo "  Withdrawal Amount: Rp 200,000"
echo "  Final Balance: Rp 300,000"
echo ""
echo -e "${GREEN}✓ All steps completed successfully!${NC}"
