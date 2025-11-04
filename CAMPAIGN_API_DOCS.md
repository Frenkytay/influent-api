# Campaign API Documentation

## Database Schema Update

### Run this SQL migration to update your campaign table:

```sql
-- Run: migrations/update_campaign_table.sql
```

### New Campaign Fields:

| Field | Type | Description |
|-------|------|-------------|
| `campaign_category` | VARCHAR(100) | Category of campaign (Fashion, Beauty, Tech) |
| `influencer_category` | JSON | Array of influencer categories |
| `has_product` | BOOLEAN | Whether campaign has a product |
| `product_name` | VARCHAR(255) | Name of the product |
| `product_value` | DECIMAL(12,2) | Value/price of the product |
| `product_desc` | TEXT | Description of the product |
| `content_reference` | TEXT | Reference description for content |
| `reference_files` | JSON | Array of reference file URLs |
| `influencer_count` | INTEGER | Number of influencers needed |
| `price_per_post` | DECIMAL(10,2) | Price per post |
| `min_followers` | INTEGER | Minimum followers required |
| `selected_gender` | VARCHAR(50) | Target gender (Male/Female/All) |
| `selected_age` | VARCHAR(100) | Target age range (e.g., 18-25) |
| `criteria_desc` | TEXT | Description of selection criteria |

## API Endpoints

### 1. Create Campaign
**POST** `/api/v1/campaigns`

**Request Body:**
```json
{
  "title": "Beauty Campaign 2024",
  "student_id": 1,
  "campaign_category": "Beauty",
  "influencer_category": ["Micro", "Macro"],
  "has_product": true,
  "product_name": "Lipstick Pro",
  "product_value": "50.00",
  "product_desc": "Premium lipstick with matte finish",
  "start_date": "2024-11-01",
  "end_date": "2024-11-30",
  "submission_deadline": "2024-11-25",
  "content_guidelines": "Use natural lighting for photos",
  "caption_guidelines": "Must include #BeautyPro",
  "content_reference": "Modern and minimalist style",
  "reference_files": ["https://example.com/ref1.jpg"],
  "influencer_count": 10,
  "price_per_post": "100.00",
  "min_followers": 10000,
  "selected_gender": "Female",
  "selected_age": "18-35",
  "criteria_desc": "Instagram influencers with fashion/beauty focus",
  "contentItems": [
    {
      "content_type": "Instagram Post",
      "post_count": 3
    },
    {
      "content_type": "Instagram Story",
      "post_count": 5
    }
  ],
  "status": "active",
  "banner_image": "/uploads/banner.jpg"
}
```

**Response (201):**
```json
{
  "campaign_id": 1,
  "student_id": 1,
  "title": "Beauty Campaign 2024",
  "campaign_category": "Beauty",
  "influencer_category": ["Micro", "Macro"],
  "has_product": true,
  "product_name": "Lipstick Pro",
  "product_value": "50.00",
  "product_desc": "Premium lipstick with matte finish",
  "start_date": "2024-11-01T00:00:00.000Z",
  "end_date": "2024-11-30T00:00:00.000Z",
  "submission_deadline": "2024-11-25T00:00:00.000Z",
  "content_guidelines": "Use natural lighting for photos",
  "caption_guidelines": "Must include #BeautyPro",
  "content_reference": "Modern and minimalist style",
  "reference_files": ["https://example.com/ref1.jpg"],
  "influencer_count": 10,
  "price_per_post": "100.00",
  "min_followers": 10000,
  "selected_gender": "Female",
  "selected_age": "18-35",
  "criteria_desc": "Instagram influencers with fashion/beauty focus",
  "status": "active",
  "banner_image": "/uploads/banner.jpg",
  "created_at": "2024-11-04T10:30:00.000Z",
  "updated_at": "2024-11-04T10:30:00.000Z"
}
```

### 2. Get All Campaigns
**GET** `/api/v1/campaigns`

**Query Parameters:**
- `limit` (default: 20) - Number of records to fetch
- `offset` (default: 0) - Number of records to skip
- `status` - Filter by status (active/inactive/completed)
- `student_id` - Filter by student ID
- `title` - Search by campaign title
- `campaign_category` - Filter by category
- `sort` - Sort field (e.g., campaign_id, created_at)
- `order` - Sort order (ASC/DESC, default: DESC)

**Example Request:**
```
GET /api/v1/campaigns?campaign_category=Beauty&limit=10&offset=0
```

**Response (200):**
```json
{
  "data": [
    {
      "campaign_id": 1,
      "title": "Beauty Campaign 2024",
      "campaign_category": "Beauty",
      "influencer_count": 10,
      "status": "active",
      "contentTypes": [
        {
          "id": 1,
          "content_type": "Instagram Post",
          "post_count": 3,
          "price_per_post": "100.00"
        }
      ],
      "created_at": "2024-11-04T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 15,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

### 3. Get Campaign by ID
**GET** `/api/v1/campaigns/:id`

**Response (200):**
```json
{
  "campaign_id": 1,
  "title": "Beauty Campaign 2024",
  "campaign_category": "Beauty",
  "influencer_category": ["Micro", "Macro"],
  "has_product": true,
  "product_name": "Lipstick Pro",
  "product_value": "50.00",
  "contentItems": [
    {
      "content_type": "Instagram Post",
      "post_count": 3
    }
  ],
  "contentTypes": [
    {
      "id": 1,
      "campaign_id": 1,
      "content_type": "Instagram Post",
      "post_count": 3,
      "price_per_post": "100.00"
    }
  ]
}
```

### 4. Update Campaign
**PUT** `/api/v1/campaigns/:id`

**Request Body:** Same as Create (all fields optional for partial updates)

### 5. Delete Campaign
**DELETE** `/api/v1/campaigns/:id`

**Response (200):**
```json
{
  "message": "Campaign deleted successfully"
}
```

### 6. Get Campaigns by Category
**GET** `/api/v1/campaigns/category/:category`

**Query Parameters:**
- `limit` (default: 20)
- `offset` (default: 0)

**Response:** Same as Get All Campaigns

## Migration Steps

1. **Backup your database** (recommended)
   ```bash
   mysqldump -u username -p database_name > backup.sql
   ```

2. **Run the SQL migration:**
   ```sql
   -- From migrations/update_campaign_table.sql
   ALTER TABLE campaign 
   ADD COLUMN campaign_category VARCHAR(100),
   ADD COLUMN influencer_category JSON,
   ...
   ```

3. **Restart your backend server:**
   ```bash
   npm start
   ```

## Important Notes

1. **JSON Fields:** `influencer_category`, `reference_files`, and `reference_images` are stored as JSON in the database. They automatically convert to/from arrays in the API.

2. **ContentItems:** When creating/updating a campaign with `contentItems`, the API automatically creates/updates the associated CampaignContentTypes records.

3. **Boolean Conversion:** The `has_product` field automatically converts string values ("true"/"false") to boolean.

4. **Pagination:** Always included in list responses. Use `hasMore` to determine if there are more records.

5. **Timestamps:** `created_at` and `updated_at` are automatically managed by Sequelize.

## Error Handling

All errors include a `details` field with the specific error message:

```json
{
  "error": "Failed to create campaign",
  "details": "Validation error: title is required"
}
```

## Testing with cURL

### Create Campaign:
```bash
curl -X POST http://localhost:3000/api/v1/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Beauty Campaign",
    "student_id": 1,
    "campaign_category": "Beauty",
    "influencer_category": ["Micro"],
    "has_product": true,
    "product_name": "Lipstick",
    "product_value": "50.00",
    "influencer_count": 10,
    "contentItems": [{"content_type": "Instagram Post", "post_count": 3}]
  }'
```

### Get All Campaigns:
```bash
curl http://localhost:3000/api/v1/campaigns?limit=10
```

### Get Campaigns by Category:
```bash
curl http://localhost:3000/api/v1/campaigns/category/Beauty?limit=10
```
