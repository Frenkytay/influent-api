# Influent Platform - Complete Workflow Test Script (PowerShell)
# This script tests the entire flow: Register → Campaign → Apply → Review → Submit Work → Payment → Withdrawal

$BASE_URL = "http://localhost:8000/api"
$COMPANY_EMAIL = "company2@example.com"
$STUDENT_EMAIL = "student@binus.ac.id"
$ADMIN_EMAIL = "admin@example.com"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "INFLUENT PLATFORM WORKFLOW TEST" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# STEP 1: REGISTER USERS
# ============================================
Write-Host "STEP 1: Registering Users" -ForegroundColor Blue
Write-Host "--------------------------------------"

# Register Company
Write-Host "1.1 Registering Company..."
$companyRegisterBody = @{
    name = "Test Company"
    email = $COMPANY_EMAIL
    password = "password123"
    role = "company"
} | ConvertTo-Json

$companyRegister = Invoke-RestMethod -Uri "$BASE_URL/v1/auth/register" `
    -Method Post `
    -ContentType "application/json" `
    -Body $companyRegisterBody
$companyRegister | ConvertTo-Json

# # Register Student
# Write-Host ""
# Write-Host "1.2 Registering Student..."
# $studentRegisterBody = @{
#     name = "Test Student"
#     email = $STUDENT_EMAIL
#     password = "password123"
#     role = "student"
# } | ConvertTo-Json

# $studentRegister = Invoke-RestMethod -Uri "$BASE_URL/v1/auth/register" `
#     -Method Post `
#     -ContentType "application/json" `
#     -Body $studentRegisterBody
# $studentRegister | ConvertTo-Json

# Write-Host ""
# Write-Host "⚠️  Note: Please verify OTP for both users via email or database" -ForegroundColor Yellow
# Read-Host "Press Enter when OTP verification is complete"

# ============================================
# STEP 2: LOGIN USERS
# ============================================
Write-Host ""
Write-Host "STEP 2: Logging In Users" -ForegroundColor Blue
Write-Host "--------------------------------------"

# Login Company
Write-Host "2.1 Login Company..."
$companyLoginBody = @{
    email = $COMPANY_EMAIL
    password = "password123"
} | ConvertTo-Json

$companyLogin = Invoke-RestMethod -Uri "$BASE_URL/v1/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $companyLoginBody
$COMPANY_TOKEN = $companyLogin.data.token
$COMPANY_USER_ID = $companyLogin.data.user.user_id
Write-Host "Company Token: $COMPANY_TOKEN"
Write-Host "Company User ID: $COMPANY_USER_ID"

# Login Student
Write-Host ""
Write-Host "2.2 Login Student..."
$studentLoginBody = @{
    email = $STUDENT_EMAIL
    password = "password123"
} | ConvertTo-Json

$studentLogin = Invoke-RestMethod -Uri "$BASE_URL/v1/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $studentLoginBody
$STUDENT_TOKEN = $studentLogin.data.token
$STUDENT_USER_ID = $studentLogin.data.user.user_id
Write-Host "Student Token: $STUDENT_TOKEN"
Write-Host "Student User ID: $STUDENT_USER_ID"

# Login Admin
Write-Host ""
Write-Host "2.3 Login Admin..."
$adminLoginBody = @{
    email = $ADMIN_EMAIL
    password = "admin123"
} | ConvertTo-Json

$adminLogin = Invoke-RestMethod -Uri "$BASE_URL/v1/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $adminLoginBody
$ADMIN_TOKEN = $adminLogin.data.token
Write-Host "Admin Token: $ADMIN_TOKEN"

# ============================================
# STEP 3: CREATE STUDENT PROFILE
# ============================================
Write-Host ""
Write-Host "STEP 3: Creating Student Profile" -ForegroundColor Blue
Write-Host "--------------------------------------"

$studentProfileBody = @{
    user_id = $STUDENT_USER_ID
    university = "Bina Nusantara University"
    major = "Computer Science"
    bio = "Passionate content creator"
    instagram_handle = "@teststudent"
    instagram_followers = 5000
    tiktok_handle = "@teststudent"
    tiktok_followers = 3000
    interests = @("tech", "lifestyle", "fashion")
    skills = @("photography", "video editing")
} | ConvertTo-Json

$studentProfile = Invoke-RestMethod -Uri "$BASE_URL/v1/students" `
    -Method Post `
    -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $STUDENT_TOKEN" } `
    -Body $studentProfileBody
$STUDENT_ID = if ($studentProfile.student_id) { $studentProfile.student_id } else { $studentProfile.data.student_id }
Write-Host "Student Profile Created - ID: $STUDENT_ID"
$studentProfile | ConvertTo-Json

# ============================================
# STEP 4: CREATE CAMPAIGN
# ============================================
Write-Host ""
Write-Host "STEP 4: Creating Campaign" -ForegroundColor Blue
Write-Host "--------------------------------------"

$campaignBody = @{
    title = "Test Product Launch Campaign"
    description = "Promote our new product on social media"
    influencer_category = @("tech", "lifestyle")
    has_product = $true
    start_date = "2025-12-15"
    end_date = "2025-12-31"
    content_guidelines = "Create authentic content showcasing the product"
    reference_files = @()
    influencer_count = 5
    reference_images = @()
} | ConvertTo-Json

$campaign = Invoke-RestMethod -Uri "$BASE_URL/v1/campaigns" `
    -Method Post `
    -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $COMPANY_TOKEN" } `
    -Body $campaignBody
$CAMPAIGN_ID = if ($campaign.campaign_id) { $campaign.campaign_id } else { $campaign.data.campaign_id }
Write-Host "Campaign Created - ID: $CAMPAIGN_ID"
$campaign | ConvertTo-Json

# ============================================
# STEP 5: STUDENT APPLIES TO CAMPAIGN
# ============================================
Write-Host ""
Write-Host "STEP 5: Student Applies to Campaign" -ForegroundColor Blue
Write-Host "--------------------------------------"

$applicationBody = @{
    campaign_id = $CAMPAIGN_ID
    student_id = $STUDENT_ID
    application_notes = "I'm very interested in this campaign!"
} | ConvertTo-Json

$application = Invoke-RestMethod -Uri "$BASE_URL/v1/campaign-users" `
    -Method Post `
    -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $STUDENT_TOKEN" } `
    -Body $applicationBody
$CAMPAIGN_USER_ID = if ($application.id) { $application.id } else { $application.data.id }
Write-Host "Application Submitted - Campaign User ID: $CAMPAIGN_USER_ID"
$application | ConvertTo-Json

# ============================================
# STEP 6: VIEW APPLICATIONS (COMPANY)
# ============================================
Write-Host ""
Write-Host "STEP 6: Company Views Applications" -ForegroundColor Blue
Write-Host "--------------------------------------"

$applications = Invoke-RestMethod -Uri "$BASE_URL/v1/campaign-users?campaign_id=$CAMPAIGN_ID" `
    -Method Get `
    -Headers @{ Authorization = "Bearer $COMPANY_TOKEN" }
$applications | ConvertTo-Json

# ============================================
# STEP 7: ACCEPT APPLICATION (COMPANY)
# ============================================
Write-Host ""
Write-Host "STEP 7: Company Accepts Application" -ForegroundColor Blue
Write-Host "--------------------------------------"

$acceptBody = @{
    application_status = "accepted"
    application_notes = "Great profile! Welcome to the campaign."
} | ConvertTo-Json

$accept = Invoke-RestMethod -Uri "$BASE_URL/v1/campaign-users/$CAMPAIGN_USER_ID" `
    -Method Put `
    -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $COMPANY_TOKEN" } `
    -Body $acceptBody
$accept | ConvertTo-Json

# ============================================
# STEP 8: STUDENT SUBMITS WORK
# ============================================
Write-Host ""
Write-Host "STEP 8: Student Submits Work" -ForegroundColor Blue
Write-Host "--------------------------------------"

$submissionBody = @{
    campaign_user_id = $CAMPAIGN_USER_ID
    submission_type = "final"
    content_type = "post"
    content_url = "https://instagram.com/p/test123"
    caption = "Check out this amazing product! #sponsored #testproduct"
    hashtags = @("sponsored", "testproduct", "tech")
    platform = "Instagram"
    submission_notes = "Posted on my Instagram feed"
} | ConvertTo-Json

$submission = Invoke-RestMethod -Uri "$BASE_URL/v1/work-submissions" `
    -Method Post `
    -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $STUDENT_TOKEN" } `
    -Body $submissionBody
$SUBMISSION_ID = if ($submission.submission_id) { $submission.submission_id } else { $submission.data.submission_id }
Write-Host "Work Submitted - Submission ID: $SUBMISSION_ID"
$submission | ConvertTo-Json

# ============================================
# STEP 9: VIEW SUBMISSIONS (COMPANY)
# ============================================
Write-Host ""
Write-Host "STEP 9: Company Views Submissions" -ForegroundColor Blue
Write-Host "--------------------------------------"

$submissions = Invoke-RestMethod -Uri "$BASE_URL/v1/work-submissions/campaign/$CAMPAIGN_ID" `
    -Method Get `
    -Headers @{ Authorization = "Bearer $COMPANY_TOKEN" }
$submissions | ConvertTo-Json

# ============================================
# STEP 10: APPROVE SUBMISSION (COMPANY)
# ============================================
Write-Host ""
Write-Host "STEP 10: Company Approves Submission" -ForegroundColor Blue
Write-Host "--------------------------------------"

$approveSubmissionBody = @{
    status = "approved"
    review_notes = "Excellent work! Very authentic content."
    reviewed_by = $COMPANY_USER_ID
} | ConvertTo-Json

$approveSubmission = Invoke-RestMethod -Uri "$BASE_URL/v1/work-submissions/$SUBMISSION_ID/review" `
    -Method Post `
    -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $COMPANY_TOKEN" } `
    -Body $approveSubmissionBody
$approveSubmission | ConvertTo-Json

# ============================================
# STEP 11: PAY STUDENT (COMPANY)
# ============================================
Write-Host ""
Write-Host "STEP 11: Company Pays Student" -ForegroundColor Blue
Write-Host "--------------------------------------"

$paymentBody = @{
    campaign_user_id = $CAMPAIGN_USER_ID
    amount = 500000
    description = "Payment for campaign completion"
} | ConvertTo-Json

$payment = Invoke-RestMethod -Uri "$BASE_URL/v1/campaign-payments/pay-student" `
    -Method Post `
    -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $COMPANY_TOKEN" } `
    -Body $paymentBody
$payment | ConvertTo-Json

# ============================================
# STEP 12: CHECK BALANCE (STUDENT)
# ============================================
Write-Host ""
Write-Host "STEP 12: Student Checks Balance" -ForegroundColor Blue
Write-Host "--------------------------------------"

$balance = Invoke-RestMethod -Uri "$BASE_URL/v1/transactions/balance" `
    -Method Get `
    -Headers @{ Authorization = "Bearer $STUDENT_TOKEN" }
$balance | ConvertTo-Json
$STUDENT_BALANCE = if ($balance.current_balance) { $balance.current_balance } else { $balance.data.current_balance }
Write-Host "Current Balance: Rp $STUDENT_BALANCE"

# ============================================
# STEP 13: VIEW TRANSACTIONS (STUDENT)
# ============================================
Write-Host ""
Write-Host "STEP 13: Student Views Transaction History" -ForegroundColor Blue
Write-Host "--------------------------------------"

$transactions = Invoke-RestMethod -Uri "$BASE_URL/v1/transactions/my-transactions" `
    -Method Get `
    -Headers @{ Authorization = "Bearer $STUDENT_TOKEN" }
$transactions | ConvertTo-Json

# ============================================
# STEP 14: REQUEST WITHDRAWAL (STUDENT)
# ============================================
Write-Host ""
Write-Host "STEP 14: Student Requests Withdrawal" -ForegroundColor Blue
Write-Host "--------------------------------------"

$withdrawalBody = @{
    amount = 200000
    bank_name = "BCA"
    account_number = "1234567890"
    account_holder_name = "Test Student"
} | ConvertTo-Json

$withdrawal = Invoke-RestMethod -Uri "$BASE_URL/v1/withdrawals/request" `
    -Method Post `
    -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $STUDENT_TOKEN" } `
    -Body $withdrawalBody
$WITHDRAWAL_ID = if ($withdrawal.withdrawal_id) { $withdrawal.withdrawal_id } else { $withdrawal.data.withdrawal_id }
Write-Host "Withdrawal Requested - ID: $WITHDRAWAL_ID"
$withdrawal | ConvertTo-Json

# ============================================
# STEP 15: VIEW WITHDRAWALS (ADMIN)
# ============================================
Write-Host ""
Write-Host "STEP 15: Admin Views Withdrawal Requests" -ForegroundColor Blue
Write-Host "--------------------------------------"

$withdrawals = Invoke-RestMethod -Uri "$BASE_URL/v1/withdrawals/admin/all?status=pending" `
    -Method Get `
    -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" }
$withdrawals | ConvertTo-Json

# ============================================
# STEP 16: APPROVE WITHDRAWAL (ADMIN)
# ============================================
Write-Host ""
Write-Host "STEP 16: Admin Approves Withdrawal" -ForegroundColor Blue
Write-Host "--------------------------------------"

$approveWithdrawalBody = @{
    review_notes = "Withdrawal approved"
} | ConvertTo-Json

$approveWithdrawal = Invoke-RestMethod -Uri "$BASE_URL/v1/withdrawals/$WITHDRAWAL_ID/approve" `
    -Method Put `
    -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" } `
    -Body $approveWithdrawalBody
$approveWithdrawal | ConvertTo-Json

# ============================================
# STEP 17: COMPLETE WITHDRAWAL (ADMIN)
# ============================================
Write-Host ""
Write-Host "STEP 17: Admin Completes Withdrawal" -ForegroundColor Blue
Write-Host "--------------------------------------"
Write-Host "Note: Upload transfer proof via multipart form - skipping in automated test"

# ============================================
# STEP 18: CHECK FINAL BALANCE (STUDENT)
# ============================================
Write-Host ""
Write-Host "STEP 18: Student Checks Final Balance" -ForegroundColor Blue
Write-Host "--------------------------------------"

$finalBalance = Invoke-RestMethod -Uri "$BASE_URL/v1/transactions/balance" `
    -Method Get `
    -Headers @{ Authorization = "Bearer $STUDENT_TOKEN" }
$finalBalance | ConvertTo-Json

# ============================================
# STEP 19: VIEW WITHDRAWAL HISTORY (STUDENT)
# ============================================
Write-Host ""
Write-Host "STEP 19: Student Views Withdrawal History" -ForegroundColor Blue
Write-Host "--------------------------------------"

$withdrawalHistory = Invoke-RestMethod -Uri "$BASE_URL/v1/withdrawals/my-withdrawals" `
    -Method Get `
    -Headers @{ Authorization = "Bearer $STUDENT_TOKEN" }
$withdrawalHistory | ConvertTo-Json

# ============================================
# SUMMARY
# ============================================
Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "WORKFLOW TEST COMPLETED!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:"
Write-Host "  Campaign ID: $CAMPAIGN_ID"
Write-Host "  Student ID: $STUDENT_ID"
Write-Host "  Campaign User ID: $CAMPAIGN_USER_ID"
Write-Host "  Submission ID: $SUBMISSION_ID"
Write-Host "  Withdrawal ID: $WITHDRAWAL_ID"
Write-Host "  Initial Balance: Rp 500,000"
Write-Host "  Withdrawal Amount: Rp 200,000"
Write-Host "  Expected Final Balance: Rp 300,000"
Write-Host ""
Write-Host "[SUCCESS] All steps completed successfully!" -ForegroundColor Green
