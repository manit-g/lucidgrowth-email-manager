# Lucid Growth Email Manager - API Documentation

## Overview

The Lucid Growth Email Manager API provides comprehensive email management capabilities including IMAP connections, email synchronization, analytics, and search functionality.

**Base URL:** `http://localhost:3001/api`

## Authentication

All API endpoints (except login) require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "name": "Manit",
      "company": "Lucid Growth"
    }
  }
}
```

## Email Accounts

### Get All Accounts
```http
GET /api/accounts
Authorization: Bearer <token>
```

### Add New Account
```http
POST /api/accounts
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Gmail Account",
  "email": "user@gmail.com",
  "imapHost": "imap.gmail.com",
  "imapPort": 993,
  "useTLS": true,
  "authMethod": "PLAIN",
  "password": "app-password"
}
```

### Test Connection
```http
POST /api/accounts/{accountId}/test
Authorization: Bearer <token>
```

### Get Account Statistics
```http
GET /api/accounts/{accountId}/stats
Authorization: Bearer <token>
```

### Update Account
```http
PUT /api/accounts/{accountId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Account Name",
  "isActive": false
}
```

### Delete Account
```http
DELETE /api/accounts/{accountId}
Authorization: Bearer <token>
```

## Email Synchronization

### Start Sync
```http
POST /api/sync/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "accountId": "account-id-here",
  "batchSize": 50,
  "maxEmails": 0,
  "folders": "INBOX,Sent"
}
```

### Pause Sync
```http
POST /api/sync/pause/{accountId}
Authorization: Bearer <token>
```

### Resume Sync
```http
POST /api/sync/resume/{accountId}
Authorization: Bearer <token>
```

### Stop Sync
```http
POST /api/sync/stop/{accountId}
Authorization: Bearer <token>
```

### Get Sync Status
```http
GET /api/sync/status/{accountId}
Authorization: Bearer <token>
```

### Start All Sync
```http
POST /api/sync/start-all
Authorization: Bearer <token>
```

## Email Analytics

### Dashboard Analytics
```http
GET /api/analytics/dashboard
Authorization: Bearer <token>
```

**Query Parameters:**
- `accountId` (optional): Filter by account ID
- `dateFrom` (optional): Start date (ISO string)
- `dateTo` (optional): End date (ISO string)

### ESP Analytics
```http
GET /api/analytics/esp
Authorization: Bearer <token>
```

**Query Parameters:**
- `accountId` (optional): Filter by account ID
- `dateFrom` (optional): Start date (ISO string)
- `dateTo` (optional): End date (ISO string)

### Domain Analytics
```http
GET /api/analytics/domains
Authorization: Bearer <token>
```

**Query Parameters:**
- `accountId` (optional): Filter by account ID
- `limit` (optional): Number of results (default: 50)
- `dateFrom` (optional): Start date (ISO string)
- `dateTo` (optional): End date (ISO string)

### TLS Analytics
```http
GET /api/analytics/tls
Authorization: Bearer <token>
```

### Time Delta Analytics
```http
GET /api/analytics/time-delta
Authorization: Bearer <token>
```

### Open Relay Analytics
```http
GET /api/analytics/open-relay
Authorization: Bearer <token>
```

### Account Analytics
```http
GET /api/analytics/account/{accountId}
Authorization: Bearer <token>
```

## Email Search

### Full-Text Search
```http
GET /api/search
Authorization: Bearer <token>
```

**Query Parameters:**
- `q` (required): Search query
- `accountId` (optional): Filter by account ID
- `folder` (optional): Filter by folder
- `espType` (optional): Filter by ESP type
- `dateFrom` (optional): Start date (ISO string)
- `dateTo` (optional): End date (ISO string)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)
- `sortBy` (optional): Sort field (date, subject, from)
- `sortOrder` (optional): Sort order (asc, desc)

### Search Suggestions
```http
GET /api/search/suggestions
Authorization: Bearer <token>
```

**Query Parameters:**
- `q` (required): Partial search query
- `limit` (optional): Number of suggestions (default: 10)

### Advanced Search
```http
GET /api/search/advanced
Authorization: Bearer <token>
```

**Query Parameters:**
- `subject` (optional): Search in subject
- `from` (optional): Search in sender
- `to` (optional): Search in recipient
- `content` (optional): Search in email content
- `accountId` (optional): Filter by account ID
- `folder` (optional): Filter by folder
- `espType` (optional): Filter by ESP type
- `hasAttachment` (optional): Filter by attachment presence
- `dateFrom` (optional): Start date (ISO string)
- `dateTo` (optional): End date (ISO string)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)

### Search Statistics
```http
GET /api/search/stats
Authorization: Bearer <token>
```

### Popular Search Terms
```http
GET /api/search/popular
Authorization: Bearer <token>
```

## Data Models

### Email Account
```typescript
interface EmailAccount {
  _id: string;
  name: string;
  email: string;
  imapHost: string;
  imapPort: number;
  useTLS: boolean;
  authMethod: 'PLAIN' | 'LOGIN' | 'OAUTH2';
  password?: string;
  oauth2Token?: string;
  oauth2RefreshToken?: string;
  isActive: boolean;
  isConnected: boolean;
  lastSyncAt?: Date;
  totalEmails: number;
  syncedEmails: number;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Email
```typescript
interface Email {
  _id: string;
  accountId: string;
  messageId: string;
  subject: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  date: Date;
  receivedDate: Date;
  content: string;
  htmlContent?: string;
  textContent?: string;
  folder: string;
  flags: string[];
  size: number;
  sendingDomain?: string;
  espType?: string;
  espName?: string;
  sendingServer?: string;
  isOpenRelay: boolean;
  supportsTLS: boolean;
  hasValidCertificate: boolean;
  timeDelta?: number;
  certificateDetails?: {
    issuer?: string;
    subject?: string;
    validFrom?: Date;
    validTo?: Date;
    fingerprint?: string;
  };
  searchableContent?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Sync Status
```typescript
interface SyncStatus {
  _id: string;
  accountId: string;
  status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'ERROR';
  totalEmails: number;
  processedEmails: number;
  failedEmails: number;
  currentFolder?: string;
  lastProcessedMessageId?: string;
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  folderProgress: Record<string, {
    total: number;
    processed: number;
    failed: number;
  }>;
  syncSpeed: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Responses

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per minute per IP address
- 1000 requests per hour per authenticated user

## WebSocket Events (Future Enhancement)

Real-time updates for sync progress and new emails:

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:3001/ws');

// Listen for sync progress updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'sync_progress') {
    console.log('Sync progress:', data.progress);
  }
};
```

## SDK Examples

### JavaScript/TypeScript
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Search emails
const searchEmails = async (query: string) => {
  const response = await api.get('/search', {
    params: { q: query }
  });
  return response.data;
};

// Get analytics
const getAnalytics = async () => {
  const response = await api.get('/analytics/dashboard');
  return response.data;
};
```

### Python
```python
import requests

class EmailManagerAPI:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {'Authorization': f'Bearer {token}'}
    
    def search_emails(self, query):
        response = requests.get(
            f'{self.base_url}/search',
            params={'q': query},
            headers=self.headers
        )
        return response.json()
    
    def get_analytics(self):
        response = requests.get(
            f'{self.base_url}/analytics/dashboard',
            headers=self.headers
        )
        return response.json()
```

## Testing

Use the provided Postman collection or test with curl:

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Search emails
curl -X GET "http://localhost:3001/api/search?q=test" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Support

For API support and questions, contact the development team at Lucid Growth.
