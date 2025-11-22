# Influent Platform - Complete Frontend Development Prompt

## Project Overview
Build a comprehensive influencer marketing platform frontend using **Next.js 14+** (App Router), **Material-UI (MUI) v6**, and **TypeScript**. The platform connects university students (influencers) with companies for social media campaigns.

---

## Technical Stack Requirements

### Core Framework
- **Next.js 14+** with App Router (not Pages Router)
- **TypeScript** for type safety
- **Material-UI (MUI) v6** for UI components
- **React 18+**

### Essential Libraries
```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "typescript": "^5.0.0",
    "@mui/material": "^6.0.0",
    "@mui/icons-material": "^6.0.0",
    "@emotion/react": "^11.13.0",
    "@emotion/styled": "^11.13.0",
    "axios": "^1.7.0",
    "react-hook-form": "^7.53.0",
    "zod": "^3.23.0",
    "@hookform/resolvers": "^3.9.0",
    "socket.io-client": "^4.8.0",
    "next-auth": "^5.0.0-beta",
    "swr": "^2.2.0",
    "react-query": "^3.39.0",
    "dayjs": "^1.11.0",
    "notistack": "^3.0.0",
    "recharts": "^2.12.0",
    "react-dropzone": "^14.2.0"
  }
}
```

---

## API Backend Configuration

### Base URL
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-api-domain.com/api';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://your-websocket-domain.com';
```

### Authentication
- **Type:** JWT Bearer Token
- **Storage:** httpOnly cookies (preferred) or localStorage
- **Header:** `Authorization: Bearer <token>`

---

## User Roles & Access Control

### 1. **Student** (Influencer)
- Dashboard with earnings, active campaigns, submissions
- Browse and apply for campaigns
- Submit work (posts, stories, reels)
- Track application status
- Manage portfolio/profile
- View balance and request withdrawals
- Chat with companies

### 2. **Company** (Campaign Creator)
- Dashboard with campaign analytics
- Create and manage campaigns
- Review student applications (accept/reject)
- Review work submissions (approve/reject/request revision)
- Chat with accepted students
- Manage payments to students
- View campaign performance metrics

### 3. **Admin**
- Overview dashboard with platform statistics
- User management (all users)
- Campaign moderation
- Review and process withdrawal requests
- View all transactions
- Platform analytics

---

## Complete API Endpoints Documentation

### Authentication Endpoints (`/api/v1/auth`)

#### 1. POST `/auth/login`
```typescript
// Request
{
  email: string;        // Must end with .ac.id for students
  password: string;
}

// Response
{
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      user_id: number;
      name: string;
      email: string;
      role: 'student' | 'company' | 'admin';
      profile_image?: string;
    }
  }
}
```

#### 2. POST `/auth/register`
```typescript
// Request
{
  name: string;
  email: string;        // Must end with .ac.id for student role
  password: string;
  role: 'student' | 'company';
  profile_image?: string;
}

// Response - Sends OTP to email
{
  success: boolean;
  message: "OTP sent to email";
  data: {
    user_id: number;
    email: string;
  }
}
```

#### 3. POST `/auth/verify-otp`
```typescript
// Request
{
  email: string;
  otp: string;          // 6-digit code
}

// Response
{
  success: boolean;
  message: "Email verified successfully";
  data: {
    token: string;
    user: UserObject;
  }
}
```

#### 4. POST `/auth/resend-otp`
```typescript
// Request
{
  email: string;
}

// Response
{
  success: boolean;
  message: "OTP resent";
}
```

#### 5. POST `/auth/forgot-password`
```typescript
// Request
{
  email: string;
}

// Response
{
  success: boolean;
  message: "OTP sent to email for password reset";
}
```

#### 6. POST `/auth/reset-password`
```typescript
// Request
{
  email: string;
  otp: string;
  new_password: string;
}

// Response
{
  success: boolean;
  message: "Password reset successful";
}
```

---

### User Management (`/api/v1/users`)

#### 1. GET `/users` (Admin only)
- List all users with filters
- Query params: `role`, `status`, `page`, `limit`

#### 2. GET `/users/{id}`
- Get user profile by ID

#### 3. PUT `/users/{id}`
- Update user profile
```typescript
{
  name?: string;
  profile_image?: string;
  status?: 'active' | 'inactive' | 'suspended';
}
```

#### 4. DELETE `/users/{id}` (Admin only)

---

### Student Profiles (`/api/v1/students`)

#### 1. POST `/students`
```typescript
{
  user_id: number;
  university: string;
  major: string;
  bio?: string;
  instagram_handle?: string;
  instagram_followers?: number;
  tiktok_handle?: string;
  tiktok_followers?: number;
  youtube_handle?: string;
  youtube_subscribers?: number;
  portfolio_url?: string;
  interests?: string[];         // JSON array
  skills?: string[];            // JSON array
}
```

#### 2. GET `/students`
- List all student profiles
- Query params: `university`, `min_followers`, `interests`

#### 3. GET `/students/{id}`

#### 4. PUT `/students/{id}`

#### 5. DELETE `/students/{id}`

---

### Campaign Management (`/api/v1/campaigns`)

#### 1. POST `/campaigns` (Company only)
```typescript
{
  title: string;
  description: string;
  requirements: string;
  budget: number;                    // Total campaign budget
  start_date: string;                // ISO date
  end_date: string;                  // ISO date
  max_participants: number;
  banner_image?: string;
  status?: 'draft' | 'open' | 'closed' | 'completed';
  campaign_type?: string;
  target_audience?: object;          // JSON
  deliverables?: string[];           // JSON array
  payment_terms?: string;
}
```

#### 2. GET `/campaigns`
- List all campaigns
- Query params: `status`, `user_id`, `search`, `page`, `limit`
- Public endpoint (no auth required)

#### 3. GET `/campaigns/{id}`
- Get campaign details with accepted students count

#### 4. PUT `/campaigns/{id}` (Owner only)

#### 5. DELETE `/campaigns/{id}` (Owner only)

---

### Campaign Applications (`/api/v1/campaign-users`)

#### 1. POST `/campaign-users` (Student applies to campaign)
```typescript
{
  campaign_id: number;
  student_id: number;
  application_notes?: string;
}

// Response
{
  success: boolean;
  message: "Application submitted";
  data: {
    id: number;                      // campaign_users.id
    campaign_id: number;
    student_id: number;
    application_status: 'pending';
    applied_at: string;
  }
}
```

#### 2. GET `/campaign-users`
- List applications
- Query params: `campaign_id`, `student_id`, `application_status`

#### 3. GET `/campaign-users/{id}`

#### 4. PUT `/campaign-users/{id}` (Company reviews application)
```typescript
{
  application_status: 'accepted' | 'rejected';
  application_notes?: string;
}
```

---

### Work Submissions (`/api/v1/work-submissions`)

#### 1. POST `/work-submissions` (Student submits work)
```typescript
{
  campaign_user_id: number;          // From campaign_users.id (not student_id!)
  submission_type: 'draft' | 'final';
  content_type?: string;             // 'post', 'story', 'reel', 'video'
  content_url?: string;              // URL to published content
  content_files?: string[];          // Uploaded file URLs
  caption?: string;
  hashtags?: string[];
  platform?: string;                 // 'Instagram', 'TikTok', 'YouTube'
  submission_notes?: string;
}
```

#### 2. GET `/work-submissions/campaign/{campaign_id}`
- Get all submissions for a campaign (Company view)
- Query params: `status`

#### 3. GET `/work-submissions/student/{student_id}`
- Get all submissions by a student
- Query params: `status`

#### 4. GET `/work-submissions/{submission_id}`

#### 5. PUT `/work-submissions/{submission_id}` (Student updates)
- Only allowed if status is 'pending' or 'revision_requested'

#### 6. POST `/work-submissions/{submission_id}/review` (Company reviews)
```typescript
{
  status: 'under_review' | 'approved' | 'rejected' | 'revision_requested';
  review_notes?: string;
  reviewed_by: number;               // user_id of reviewer
}
```

#### 7. POST `/work-submissions/{submission_id}/publish`
```typescript
{
  performance_metrics?: {
    views?: number;
    likes?: number;
    shares?: number;
    comments?: number;
    engagement_rate?: number;
  }
}
```

#### 8. PUT `/work-submissions/{submission_id}/metrics`
```typescript
{
  performance_metrics: {
    views?: number;
    likes?: number;
    shares?: number;
    comments?: number;
  }
}
```

#### 9. DELETE `/work-submissions/{submission_id}`
- Only if status is 'pending' or 'rejected'

---

### Campaign Content Types (`/api/v1/campaign-content-types`)

#### 1. POST `/campaign-content-types`
```typescript
{
  campaign_id: number;
  content_type: string;              // 'post', 'story', 'reel'
  platform: string;                  // 'Instagram', 'TikTok'
  quantity: number;
  requirements?: string;
}
```

#### 2. GET `/campaign-content-types?campaign_id={id}`

#### 3. PUT `/campaign-content-types/{id}`

#### 4. DELETE `/campaign-content-types/{id}`

---

### Real-time Chat (`/api/v1/chat-rooms`, `/api/v1/chat-messages`)

#### WebSocket Connection
```typescript
import io from 'socket.io-client';

const socket = io(WS_URL, {
  auth: { token: 'Bearer <jwt_token>' }
});

// Join room
socket.emit('joinRoom', { roomId: 'room_123' });

// Send message
socket.emit('sendMessage', {
  room_id: 'room_123',
  message: 'Hello!',
  message_type: 'text'
});

// Listen for messages
socket.on('newMessage', (message) => {
  console.log(message);
});
```

#### HTTP Endpoints

##### 1. POST `/chat-rooms`
```typescript
{
  campaign_id: number;
  name?: string;
}
```

##### 2. GET `/chat-rooms`
- Query params: `user_id`, `campaign_id`

##### 3. GET `/chat-rooms/{id}`

##### 4. POST `/chat-messages`
```typescript
{
  room_id: string;
  sender_id: number;
  message: string;
  message_type: 'text' | 'image' | 'file';
  attachment_url?: string;
}
```

##### 5. GET `/chat-messages?room_id={id}`
- Returns message history

---

### Reviews & Ratings (`/api/v1/reviews`)

#### 1. POST `/reviews`
```typescript
{
  campaign_id: number;
  reviewer_id: number;              // user_id of reviewer
  reviewee_id: number;              // user_id being reviewed
  rating: number;                   // 1-5
  comment?: string;
}
```

#### 2. GET `/reviews`
- Query params: `campaign_id`, `reviewee_id`

#### 3. GET `/reviews/{id}`

#### 4. PUT `/reviews/{id}`

#### 5. DELETE `/reviews/{id}`

---

### Notifications (`/api/v1/notifications`)

#### 1. GET `/notifications`
- Get user's notifications
- Query params: `is_read`, `page`, `limit`

#### 2. GET `/notifications/{id}`

#### 3. PUT `/notifications/{id}/read`
- Mark notification as read

#### 4. PUT `/notifications/read-all`
- Mark all as read

#### 5. DELETE `/notifications/{id}`

---

### File Uploads (`/api/v1/upload`)

#### 1. POST `/upload/image`
- Content-Type: `multipart/form-data`
- Field name: `image`
- Max size: 5MB
- Allowed: jpg, jpeg, png, gif, webp

```typescript
// Request
const formData = new FormData();
formData.append('image', fileBlob);

// Response
{
  success: boolean;
  message: "Image uploaded successfully";
  data: {
    url: string;                     // Full URL to uploaded image
    filename: string;
  }
}
```

---

### Balance & Transactions (`/api/v1/transactions`)

#### 1. GET `/transactions/balance`
```typescript
// Response
{
  success: boolean;
  data: {
    balance: number;                 // Current balance
    total_earned: number;            // Total credits
    total_withdrawn: number;         // Total debits
  }
}
```

#### 2. GET `/transactions/my-transactions`
- Query params: `type` (credit/debit), `category`, `page`, `limit`
```typescript
// Response
{
  success: boolean;
  data: {
    transactions: [
      {
        transaction_id: number;
        user_id: number;
        amount: number;
        type: 'credit' | 'debit';
        category: 'campaign_payment' | 'withdrawal' | 'refund' | 'bonus' | 'penalty' | 'adjustment';
        reference_type: string;      // 'campaign_users', 'withdrawal'
        reference_id: number;
        description: string;
        balance_before: number;
        balance_after: number;
        created_at: string;
      }
    ];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
    current_balance: number;
  }
}
```

#### 3. GET `/transactions/{id}`

#### 4. GET `/transactions/admin/all` (Admin only)
- Query params: `user_id`, `type`, `category`, `page`, `limit`

---

### Withdrawals (`/api/v1/withdrawals`)

#### Student Endpoints

##### 1. POST `/withdrawals/request`
```typescript
{
  amount: number;                    // Must be <= balance
  bank_name: string;
  account_number: string;
  account_holder_name: string;
}

// Response - Balance deducted immediately
{
  success: boolean;
  message: "Withdrawal request submitted";
  data: {
    withdrawal_id: number;
    user_id: number;
    amount: number;
    status: 'pending';
    bank_name: string;
    account_number: string;
    account_holder_name: string;
    request_date: string;
  }
}
```

##### 2. GET `/withdrawals/my-withdrawals`
- Query params: `status`, `page`, `limit`

##### 3. GET `/withdrawals/{id}`

##### 4. PUT `/withdrawals/{id}/cancel`
- Only if status is 'pending'
- Refunds balance automatically

#### Admin Endpoints

##### 5. GET `/withdrawals/admin/all` (Admin only)
- Query params: `status`, `user_id`, `page`, `limit`

##### 6. PUT `/withdrawals/{id}/approve` (Admin only)
```typescript
{
  review_notes?: string;
}
```

##### 7. PUT `/withdrawals/{id}/reject` (Admin only)
```typescript
{
  rejection_reason: string;
}
// Automatically refunds balance to user
```

##### 8. PUT `/withdrawals/{id}/complete` (Admin only)
- Content-Type: `multipart/form-data`
- Field: `transfer_proof` (image file)
```typescript
{
  review_notes?: string;
}
// Sends email with transfer proof to user
```

---

### Campaign Payments (`/api/v1/campaign-payments`) - Company/Admin Only

#### 1. POST `/campaign-payments/pay-student`
```typescript
{
  campaign_user_id: number;          // From campaign_users.id (not student_id!)
  amount: number;
  description?: string;
}

// Response
{
  success: boolean;
  message: "Payment successful";
  data: {
    transaction_id: number;
    student_user_id: number;
    amount: number;
    new_balance: number;
  }
}
```

#### 2. POST `/campaign-payments/pay-all`
```typescript
{
  campaign_id: number;
  amount_per_student: number;
}

// Response - Pays all accepted students
{
  success: boolean;
  message: "Bulk payment processed";
  paid_count: number;
  failed_count: number;
  results: Array<{
    campaign_user_id: number;
    student_name: string;
    success: boolean;
    amount?: number;
    error?: string;
  }>;
}
```

#### 3. POST `/campaign-payments/pay-custom`
```typescript
{
  payments: [
    {
      campaign_user_id: number;
      amount: number;
      description?: string;
    }
  ]
}
```

---

### Payments (Midtrans) (`/api/v1/payments`)

#### 1. POST `/payments/create-transaction`
```typescript
{
  campaign_id: number;
  amount: number;
  customer_details: {
    first_name: string;
    last_name?: string;
    email: string;
    phone: string;
  }
}

// Response
{
  success: boolean;
  data: {
    token: string;                   // Midtrans Snap token
    redirect_url: string;            // Payment page URL
  }
}
```

#### 2. POST `/payments/notification` (Webhook - Backend handles this)

#### 3. GET `/payments/{order_id}`

---

## Page Structure & Routes

### Public Pages
```
/                               → Landing page
/login                          → Login page
/register                       → Register (Student/Company selection)
/verify-email                   → OTP verification page
/forgot-password                → Request password reset
/reset-password                 → Reset password with OTP
/campaigns                      → Browse all campaigns (public)
/campaigns/[id]                 → Campaign details (public view)
```

### Student Dashboard
```
/student/dashboard              → Overview (earnings, active campaigns, stats)
/student/campaigns              → Browse campaigns
/student/campaigns/[id]         → Campaign details (apply)
/student/my-campaigns           → My applications & accepted campaigns
/student/submissions            → My work submissions
/student/submissions/new        → Submit new work
/student/submissions/[id]       → Submission details & edit
/student/profile                → Edit profile & portfolio
/student/balance                → View balance & transaction history
/student/withdrawals            → Request & track withdrawals
/student/chat                   → Messages with companies
/student/chat/[roomId]          → Specific chat room
/student/notifications          → Notifications center
```

### Company Dashboard
```
/company/dashboard              → Overview (campaigns, analytics)
/company/campaigns              → My campaigns list
/company/campaigns/new          → Create new campaign
/company/campaigns/[id]         → Campaign details & management
/company/campaigns/[id]/applicants → Review applications
/company/campaigns/[id]/students   → Manage accepted students
/company/campaigns/[id]/submissions → Review work submissions
/company/campaigns/[id]/payments   → Pay students
/company/campaigns/[id]/analytics  → Campaign performance
/company/chat                   → Messages with students
/company/chat/[roomId]          → Specific chat room
/company/profile                → Edit company profile
/company/notifications          → Notifications center
```

### Admin Dashboard
```
/admin/dashboard                → Platform overview & statistics
/admin/users                    → User management
/admin/students                 → Student profiles
/admin/companies                → Company profiles
/admin/campaigns                → All campaigns
/admin/withdrawals              → Review & process withdrawals
/admin/transactions             → All transactions
/admin/analytics                → Platform analytics
```

---

## UI Components to Build

### 1. Authentication Components
- `LoginForm` - Email/password with validation
- `RegisterForm` - Multi-step (role selection → details → email verification)
- `OTPInput` - 6-digit OTP entry with countdown timer
- `ForgotPasswordForm` - Email submission
- `ResetPasswordForm` - OTP + new password

### 2. Layout Components
- `AppShell` - Main layout with sidebar/navbar
- `Sidebar` - Role-based navigation
- `TopBar` - User menu, notifications, search
- `Footer`
- `MobileNav` - Responsive hamburger menu

### 3. Campaign Components
- `CampaignCard` - Grid/list view card
- `CampaignFilters` - Search, status, budget filters
- `CampaignForm` - Create/edit campaign (multi-step)
- `CampaignDetails` - Full campaign view
- `CampaignStats` - Analytics dashboard
- `ApplyToCampaignModal` - Application form

### 4. Application Management
- `ApplicationCard` - Student application display
- `ApplicationList` - Filterable list
- `ApplicationReviewModal` - Accept/reject with notes
- `ApplicationStatusBadge` - Color-coded status

### 5. Work Submission Components
- `SubmissionForm` - Multi-step submission form with file upload
- `SubmissionCard` - Display submitted work
- `SubmissionList` - Filterable/sortable list
- `SubmissionReviewModal` - Approve/reject/request revision
- `SubmissionStatusBadge`
- `PerformanceMetricsForm` - Update metrics

### 6. Chat Components
- `ChatRoomList` - List of conversations
- `ChatWindow` - Messages display with WebSocket
- `MessageBubble` - Individual message
- `ChatInput` - Send text/files
- `TypingIndicator`
- `OnlineStatusBadge`

### 7. Profile Components
- `StudentProfileForm` - Social media handles, portfolio
- `CompanyProfileForm` - Company details
- `ProfileAvatar` - Upload/crop image
- `SocialMediaInput` - Instagram/TikTok/YouTube handles
- `PortfolioGallery` - Image gallery

### 8. Financial Components
- `BalanceCard` - Current balance display
- `TransactionTable` - Filterable transaction history
- `WithdrawalRequestForm` - Bank details input
- `WithdrawalCard` - Withdrawal status
- `WithdrawalReviewModal` (Admin) - Approve/reject/complete
- `PayStudentModal` (Company) - Single payment
- `BulkPaymentModal` (Company) - Pay all students
- `TransferProofUpload` (Admin) - Upload proof image

### 9. Notification Components
- `NotificationBell` - Badge with unread count
- `NotificationList` - Dropdown/drawer list
- `NotificationItem` - Individual notification

### 10. Dashboard Components
- `StatCard` - Key metric display
- `EarningsChart` - Line/bar chart (Recharts)
- `CampaignStatusChart` - Pie/donut chart
- `RecentActivityFeed`
- `TopPerformersTable` (Admin)

### 11. Shared Components
- `DataTable` - Sortable, filterable table
- `SearchBar` - Debounced search input
- `DateRangePicker` - Date filtering
- `StatusBadge` - Color-coded badges
- `EmptyState` - No data placeholder
- `LoadingSpinner` - Loading states
- `ConfirmDialog` - Confirmation modals
- `ImageUpload` - Drag & drop upload with preview
- `RichTextEditor` - For descriptions

---

## State Management Strategy

### API Layer (using Axios + SWR/React Query)

```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // or get from cookies
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Custom Hooks (using SWR)

```typescript
// hooks/useCampaigns.ts
import useSWR from 'swr';
import api from '@/lib/api';

export const useCampaigns = (params?: {
  status?: string;
  user_id?: number;
  page?: number;
}) => {
  const { data, error, mutate } = useSWR(
    ['/v1/campaigns', params],
    ([url, params]) => api.get(url, { params }).then(res => res.data)
  );

  return {
    campaigns: data?.data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};

// hooks/useBalance.ts
export const useBalance = () => {
  const { data, error, mutate } = useSWR(
    '/v1/transactions/balance',
    (url) => api.get(url).then(res => res.data)
  );

  return {
    balance: data?.data?.balance || 0,
    totalEarned: data?.data?.total_earned || 0,
    totalWithdrawn: data?.data?.total_withdrawn || 0,
    isLoading: !error && !data,
    mutate,
  };
};
```

### Context Providers

```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  isLoading: boolean;
}

// contexts/SocketContext.tsx
interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  joinRoom: (roomId: string) => void;
  sendMessage: (data: MessageData) => void;
}
```

---

## Form Validation Schema (Zod)

```typescript
// schemas/auth.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerStudentSchema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email().endsWith('.ac.id', 'Must be a university email (.ac.id)'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.literal('student'),
});

// schemas/campaign.ts
export const campaignSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  requirements: z.string(),
  budget: z.number().positive('Budget must be positive'),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  max_participants: z.number().int().positive(),
  banner_image: z.string().url().optional(),
  campaign_type: z.string().optional(),
  deliverables: z.array(z.string()).optional(),
});

// schemas/withdrawal.ts
export const withdrawalSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  bank_name: z.string().min(2, 'Bank name required'),
  account_number: z.string().min(5, 'Account number required'),
  account_holder_name: z.string().min(2, 'Account holder name required'),
});

// schemas/workSubmission.ts
export const workSubmissionSchema = z.object({
  campaign_user_id: z.number().int().positive(),
  submission_type: z.enum(['draft', 'final']),
  content_type: z.string().optional(),
  content_url: z.string().url().optional(),
  content_files: z.array(z.string().url()).optional(),
  caption: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
  platform: z.string().optional(),
  submission_notes: z.string().optional(),
});
```

---

## MUI Theme Configuration

```typescript
// theme/theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#6366F1', // Indigo
      light: '#818CF8',
      dark: '#4F46E5',
    },
    secondary: {
      main: '#EC4899', // Pink
      light: '#F472B6',
      dark: '#DB2777',
    },
    success: {
      main: '#10B981',
    },
    warning: {
      main: '#F59E0B',
    },
    error: {
      main: '#EF4444',
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});
```

---

## Key Features to Implement

### 1. Authentication Flow
- Email/password login with JWT
- Student registration requires `.ac.id` email
- Email OTP verification (6-digit, 10-minute expiration)
- Forgot password with OTP
- Protected routes based on role
- Auto-logout on token expiration

### 2. Student Features
- **Dashboard:**
  - Total earnings card
  - Active campaigns count
  - Pending submissions count
  - Recent transactions list
  - Earnings chart (last 6 months)
  
- **Campaign Discovery:**
  - Grid/list view toggle
  - Filters: status, budget range, platform, start date
  - Search by title/description
  - Campaign details modal
  - One-click apply with notes
  
- **My Campaigns:**
  - Tabs: Applied, Accepted, Completed
  - Application status badges
  - Submit work button for accepted campaigns
  
- **Work Submissions:**
  - Multi-step form: type selection → content upload → details → preview
  - File upload (images/videos) with drag & drop
  - Social media URL input
  - Caption & hashtags editor
  - Draft save functionality
  - Edit/delete pending submissions
  - Track review status
  
- **Balance & Withdrawals:**
  - Current balance display
  - Transaction history table with filters
  - Request withdrawal form with bank details
  - Withdrawal status tracker
  - Email notifications on status change

### 3. Company Features
- **Dashboard:**
  - Active campaigns count
  - Total applicants count
  - Submissions pending review
  - Campaign performance metrics
  - Recent activities feed
  
- **Campaign Management:**
  - Create campaign wizard (multi-step)
  - Rich text editor for description
  - Image upload for banner
  - Set budget, dates, max participants
  - Define deliverables & requirements
  - Edit/delete campaigns
  
- **Application Review:**
  - List all applicants per campaign
  - View student profiles & portfolios
  - Instagram/TikTok follower counts
  - Accept/reject with notes
  - Bulk actions
  
- **Submission Review:**
  - Grid view of all submissions
  - Filter by status, student, date
  - Approve/reject/request revision
  - Add review feedback
  - Track revision count
  
- **Payment Management:**
  - Pay individual student
  - Bulk payment (all accepted students)
  - Custom payment amounts
  - Payment confirmation dialog
  - Transaction history

### 4. Admin Features
- **Dashboard:**
  - Total users (students/companies)
  - Active campaigns count
  - Pending withdrawals count
  - Total platform revenue
  - User growth chart
  - Campaign trends chart
  
- **User Management:**
  - List all users with filters
  - Search by name/email
  - View user details
  - Suspend/activate accounts
  - Delete users
  
- **Withdrawal Processing:**
  - List all withdrawal requests
  - Filter by status (pending/approved/rejected/completed)
  - View student details & balance
  - Approve/reject with notes
  - Upload transfer proof image
  - Email notification on completion
  
- **Transaction Monitoring:**
  - View all transactions
  - Filter by user, type, category, date
  - Export to CSV
  
- **Analytics:**
  - Platform statistics
  - Revenue charts
  - User activity heatmap
  - Campaign performance leaderboard

### 5. Real-time Chat
- WebSocket connection with Socket.IO
- Chat room list with unread badges
- Real-time message delivery
- Typing indicators
- Online status indicators
- Message history pagination
- Image/file attachments
- Message timestamps

### 6. Notifications
- Real-time notifications bell
- Unread count badge
- Notification types:
  - Application status change
  - New message received
  - Submission reviewed
  - Payment received
  - Withdrawal status updated
- Mark as read/unread
- Mark all as read
- Delete notifications

---

## Responsive Design Requirements

### Breakpoints
- Mobile: < 600px
- Tablet: 600px - 960px
- Desktop: > 960px

### Mobile Optimization
- Hamburger menu navigation
- Touch-friendly buttons (min 44px height)
- Swipeable cards
- Bottom navigation for primary actions
- Collapsible filters
- Responsive tables (horizontal scroll or cards)
- Mobile-optimized forms (one column)

### Desktop Features
- Sidebar navigation (collapsible)
- Multi-column layouts
- Hover states
- Keyboard shortcuts
- Drag & drop file upload

---

## Performance Optimization

### Code Splitting
- Dynamic imports for heavy components
- Route-based code splitting
- Lazy load images

### Data Fetching
- SWR for caching & revalidation
- Pagination for large lists
- Infinite scroll for feeds
- Debounced search inputs

### Image Optimization
- Next.js `<Image>` component
- WebP format with fallback
- Lazy loading
- Responsive images

---

## Error Handling

### Display Errors
- Toast notifications (notistack) for API errors
- Inline form validation errors
- Empty states for no data
- 404 page for not found
- 500 page for server errors
- Network offline detection

### Retry Logic
- Automatic retry for failed requests (SWR)
- Manual retry button
- Optimistic updates with rollback

---

## Testing Requirements

### Unit Tests (Jest + React Testing Library)
- Component rendering
- Form validation
- Custom hooks
- Utility functions

### Integration Tests
- Authentication flow
- Campaign creation flow
- Submission workflow
- Payment flow

### E2E Tests (Playwright/Cypress)
- User registration → verification → login
- Student applies to campaign → submits work
- Company creates campaign → reviews applications
- Admin processes withdrawal

---

## Deployment Checklist

### Environment Variables
```env
NEXT_PUBLIC_API_URL=https://your-api.com/api
NEXT_PUBLIC_WS_URL=wss://your-websocket.com
NEXT_PUBLIC_ENV=production
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://your-frontend.com
```

### Build & Deploy
- Build: `npm run build`
- Deploy to Vercel/Netlify/AWS
- Configure CDN for static assets
- Set up SSL certificate
- Configure domain & DNS

### Monitoring
- Error tracking (Sentry)
- Analytics (Google Analytics/Plausible)
- Performance monitoring (Web Vitals)
- Uptime monitoring

---

## Additional Notes

### Important Backend Details
1. **campaign_user_id vs student_id:**
   - When submitting work, use `campaign_user_id` (from `campaign_users.id`)
   - NOT `student_id` - this is a common mistake!
   
2. **application_status field:**
   - Use `application_status` (not just `status`)
   - Values: 'pending', 'accepted', 'rejected'
   
3. **Balance deduction:**
   - Withdrawals deduct balance immediately on request
   - If rejected, balance is automatically refunded
   
4. **Email verification:**
   - OTP is 6 digits, valid for 10 minutes
   - Max 5 failed attempts before lockout
   - Can resend OTP after 1 minute
   
5. **File uploads:**
   - Max 5MB per image
   - Allowed formats: jpg, jpeg, png, gif, webp
   - Returns full URL in response

### Security Best Practices
- Store JWT in httpOnly cookies (not localStorage)
- Implement CSRF protection
- Sanitize user inputs
- Validate file uploads (size, type)
- Rate limiting on API calls
- Content Security Policy headers

### Accessibility (A11y)
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management
- Color contrast (WCAG AA)
- Screen reader support

---

## Project Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   ├── verify-email/
│   │   └── forgot-password/
│   ├── (public)/
│   │   ├── page.tsx                 # Landing page
│   │   └── campaigns/
│   │       ├── page.tsx             # Browse campaigns
│   │       └── [id]/page.tsx        # Campaign details
│   ├── student/
│   │   ├── dashboard/
│   │   ├── campaigns/
│   │   ├── my-campaigns/
│   │   ├── submissions/
│   │   ├── balance/
│   │   ├── withdrawals/
│   │   ├── chat/
│   │   └── profile/
│   ├── company/
│   │   ├── dashboard/
│   │   ├── campaigns/
│   │   ├── chat/
│   │   └── profile/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── campaigns/
│   │   ├── withdrawals/
│   │   └── transactions/
│   ├── layout.tsx
│   └── providers.tsx
├── components/
│   ├── auth/
│   ├── campaigns/
│   ├── submissions/
│   ├── chat/
│   ├── financial/
│   ├── layout/
│   └── shared/
├── hooks/
│   ├── useCampaigns.ts
│   ├── useBalance.ts
│   ├── useAuth.ts
│   ├── useSocket.ts
│   └── useNotifications.ts
├── lib/
│   ├── api.ts
│   ├── socket.ts
│   └── utils.ts
├── contexts/
│   ├── AuthContext.tsx
│   └── SocketContext.tsx
├── schemas/
│   ├── auth.ts
│   ├── campaign.ts
│   ├── submission.ts
│   └── withdrawal.ts
├── theme/
│   └── theme.ts
├── types/
│   └── index.ts
└── public/
```

---

## Deliverables

1. **Fully functional Next.js application** with all features implemented
2. **TypeScript types** for all API responses
3. **Responsive UI** that works on mobile, tablet, and desktop
4. **Role-based access control** with protected routes
5. **Real-time features** using WebSocket
6. **Comprehensive error handling** and loading states
7. **Form validation** with user-friendly error messages
8. **File upload functionality** with preview
9. **Search and filter capabilities** on all list pages
10. **Documentation** (README.md) with setup instructions

---

## Success Criteria

- ✅ All API endpoints successfully integrated
- ✅ Authentication flow works end-to-end
- ✅ Students can browse, apply, and submit work
- ✅ Companies can create campaigns and review submissions
- ✅ Real-time chat functions properly
- ✅ Balance, transactions, and withdrawals work correctly
- ✅ Admin can manage users and process withdrawals
- ✅ Responsive design on all devices
- ✅ No console errors or warnings
- ✅ Fast page load times (< 3s)
- ✅ Accessible (WCAG AA compliance)

---

**Start by setting up the Next.js project with TypeScript, MUI, and essential dependencies. Then build authentication, followed by the core features for each user role. Test thoroughly with the backend API. Good luck! 🚀**
