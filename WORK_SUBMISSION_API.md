# Work Submission System

## Overview

The Work Submission system allows students to submit their work for campaigns they've been accepted to, and enables campaign owners to review, approve, or request revisions.

## Database Setup

Run the migration to create the table:

```sql
mysql -u your_user -p your_database < migrations/create_work_submissions_table.sql
```

Or manually execute the SQL in your MySQL client.

## API Endpoints

Base URL: `/api/v1/work-submissions`

### 1. Create Submission

**POST** `/api/v1/work-submissions`

Students submit their work for a campaign.

**Request Body:**

```json
{
  "campaign_id": 1,
  "student_id": 5,
  "campaign_user_id": 10,
  "submission_type": "final",
  "content_type": "instagram_post",
  "content_url": "https://instagram.com/p/xyz123",
  "content_files": [
    "/uploads/submission_image1.jpg",
    "/uploads/submission_image2.jpg"
  ],
  "caption": "Amazing product! #sponsored #brandname",
  "hashtags": ["sponsored", "brandname", "influencer"],
  "platform": "Instagram",
  "submission_notes": "Posted during peak hours for maximum engagement"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Work submission created successfully",
  "data": {
    "submission_id": 1,
    "campaign_id": 1,
    "student_id": 5,
    "status": "pending",
    "submitted_at": "2025-11-17T10:30:00.000Z",
    ...
  }
}
```

### 2. Get Campaign Submissions

**GET** `/api/v1/work-submissions/campaign/:campaign_id?status=approved`

Campaign owners view all submissions for their campaign.

**Query Parameters:**

- `status` (optional): Filter by status (pending, under_review, approved, rejected, revision_requested)

**Response:**

```json
{
  "success": true,
  "message": "Submissions retrieved successfully",
  "data": [
    {
      "submission_id": 1,
      "campaign_id": 1,
      "student_id": 5,
      "status": "approved",
      "content_url": "https://instagram.com/p/xyz123",
      "Student": {
        "user_id": 5,
        "university": "Stanford",
        "User": {
          "name": "John Doe",
          "email": "john@example.com",
          "profile_image": "/uploads/profile.jpg"
        }
      },
      ...
    }
  ]
}
```

### 3. Get Student Submissions

**GET** `/api/v1/work-submissions/student/:student_id?status=pending`

Students view their own submissions.

**Response:**

```json
{
  "success": true,
  "message": "Submissions retrieved successfully",
  "data": [
    {
      "submission_id": 1,
      "campaign_id": 1,
      "status": "approved",
      "Campaign": {
        "campaign_id": 1,
        "title": "Summer Fashion Campaign",
        "banner_image": "/uploads/banner.jpg"
      },
      ...
    }
  ]
}
```

### 4. Get Submission by ID

**GET** `/api/v1/work-submissions/:submission_id`

Get detailed information about a specific submission.

**Response:**

```json
{
  "success": true,
  "message": "Submission retrieved successfully",
  "data": {
    "submission_id": 1,
    "campaign_id": 1,
    "student_id": 5,
    "content_url": "https://instagram.com/p/xyz123",
    "caption": "Amazing product!",
    "status": "approved",
    "review_notes": "Great work! Content meets all requirements.",
    "Campaign": { ... },
    "Student": { ... }
  }
}
```

### 5. Update Submission

**PUT** `/api/v1/work-submissions/:submission_id`

Students can update their submission if status is "pending" or "revision_requested".

**Request Body:**

```json
{
  "content_url": "https://instagram.com/p/updated_xyz123",
  "caption": "Updated caption with more hashtags",
  "hashtags": ["sponsored", "brandname", "newhash"],
  "submission_notes": "Updated based on feedback"
}
```

### 6. Review Submission

**POST** `/api/v1/work-submissions/:submission_id/review`

Campaign owners review and approve/reject submissions.

**Request Body:**

```json
{
  "status": "approved",
  "review_notes": "Excellent work! Content aligns perfectly with brand guidelines.",
  "reviewed_by": 1
}
```

**Status Options:**

- `approved` - Accept the submission
- `rejected` - Reject the submission
- `revision_requested` - Ask for changes
- `under_review` - Mark as being reviewed

**Response:**

```json
{
  "success": true,
  "message": "Submission reviewed successfully",
  "data": {
    "submission_id": 1,
    "status": "approved",
    "reviewed_at": "2025-11-17T14:30:00.000Z",
    "approved_at": "2025-11-17T14:30:00.000Z",
    "review_notes": "Excellent work!",
    ...
  }
}
```

### 7. Mark as Published

**POST** `/api/v1/work-submissions/:submission_id/publish`

Mark approved content as published on the platform.

**Request Body:**

```json
{
  "performance_metrics": {
    "views": 10000,
    "likes": 850,
    "comments": 42,
    "shares": 15,
    "engagement_rate": 8.5
  }
}
```

### 8. Update Performance Metrics

**PUT** `/api/v1/work-submissions/:submission_id/metrics`

Update performance data for published content.

**Request Body:**

```json
{
  "performance_metrics": {
    "views": 15000,
    "likes": 1200,
    "comments": 68,
    "shares": 25,
    "engagement_rate": 9.2,
    "reach": 20000
  }
}
```

### 9. Delete Submission

**DELETE** `/api/v1/work-submissions/:submission_id`

Delete a submission (only if status is "pending" or "rejected").

**Response:**

```json
{
  "success": true,
  "message": "Submission deleted successfully",
  "data": null
}
```

## Workflow

### Student Workflow:

1. Get accepted to a campaign (status: "accepted" in `campaignUsers`)
2. Create work submission with `POST /api/v1/work-submissions`
3. Wait for review
4. If revision requested, update submission with `PUT /api/v1/work-submissions/:id`
5. Once approved, publish content and update with `POST .../publish`

### Campaign Owner Workflow:

1. View all submissions: `GET /api/v1/work-submissions/campaign/:campaign_id`
2. Review individual submissions: `GET /api/v1/work-submissions/:submission_id`
3. Approve/reject/request revision: `POST /api/v1/work-submissions/:submission_id/review`
4. Track performance metrics after publication

## Status Flow

```
pending → under_review → approved → published
                      ↓
                   rejected
                      ↓
              revision_requested → (back to pending when updated)
```

## Field Descriptions

### Submission Fields:

- **submission_type**: `draft` or `final` - type of submission
- **content_type**: Type of content (e.g., "instagram_post", "tiktok_video", "story")
- **content_url**: Direct URL to the published content
- **content_files**: Array of uploaded media files
- **caption**: Post caption/description
- **hashtags**: Array of hashtags used
- **platform**: Social media platform name
- **submission_notes**: Additional notes from student
- **status**: Current status of submission
- **review_notes**: Feedback from campaign owner
- **revision_count**: Number of times revision was requested
- **performance_metrics**: JSON object with engagement data
- **is_published**: Boolean indicating if content is live

## Authorization

All endpoints require authentication via Bearer token:

```
Authorization: Bearer <your_jwt_token>
```

The system verifies:

- Students can only submit for campaigns they're accepted to
- Campaign owners can only review their own campaigns
- Students can only edit pending/revision_requested submissions

## Database Relationships

```
Campaign (1) ----→ (many) WorkSubmission
Student (1) ----→ (many) WorkSubmission
CampaignUsers (1) ----→ (many) WorkSubmission
User (reviewer) (1) ----→ (many) WorkSubmission
```

## Error Handling

Common error responses:

**403 Forbidden:**

```json
{
  "success": false,
  "message": "Student is not accepted for this campaign",
  "data": null
}
```

**404 Not Found:**

```json
{
  "success": false,
  "message": "Submission not found",
  "data": null
}
```

## Testing

Example test flow:

```bash
# 1. Student creates submission
curl -X POST http://localhost:3000/api/v1/work-submissions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_id": 1,
    "student_id": 5,
    "campaign_user_id": 10,
    "content_url": "https://instagram.com/p/test123",
    "caption": "Test submission"
  }'

# 2. Campaign owner reviews
curl -X POST http://localhost:3000/api/v1/work-submissions/1/review \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "review_notes": "Looks great!",
    "reviewed_by": 1
  }'

# 3. Mark as published
curl -X POST http://localhost:3000/api/v1/work-submissions/1/publish \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "performance_metrics": {
      "views": 5000,
      "likes": 400
    }
  }'
```
