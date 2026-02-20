# API Service Layer - New Structure

This is the improved API service layer for the Hostel Management System. All endpoints and data structures are preserved exactly as they were.

## Structure

```
src/service/
├── core/
│   ├── apiClient.js      # Centralized HTTP client with interceptors
│   ├── errors.js         # Custom error classes
│   └── index.js          # Core exports
├── modules/
│   ├── admin.api.js
│   ├── alert.api.js
│   ├── auth.api.js
│   ├── certificate.api.js
│   ├── complaint.api.js
│   ├── dashboard.api.js
│   ├── disco.api.js
│   ├── events.api.js
│   ├── feedback.api.js
│   ├── health.api.js
│   ├── hostel.api.js
│   ├── hostelGate.api.js
│   ├── idCard.api.js
│   ├── insuranceProvider.api.js
│   ├── inventory.api.js
│   ├── leave.api.js
│   ├── liveCheckInOut.api.js
│   ├── lostAndFound.api.js
│   ├── maintenance.api.js
│   ├── notification.api.js
│   ├── onlineUsers.api.js
│   ├── security.api.js
│   ├── sheet.api.js
│   ├── stats.api.js
│   ├── student.api.js
│   ├── studentProfile.api.js
│   ├── superAdmin.api.js
│   ├── task.api.js
│   ├── undertaking.api.js
│   ├── upload.api.js
│   ├── user.api.js
│   ├── visitor.api.js
│   ├── warden.api.js
│   └── index.js          # Module exports
└── index.js              # Central exports
```

## Key Improvements

### 1. Centralized API Client (`core/apiClient.js`)
- Single point of configuration
- Automatic error handling
- Request/response interceptors ready
- HTTP method shortcuts: `get`, `post`, `put`, `patch`, `delete`, `upload`
- URL building utilities

### 2. Custom Error Classes (`core/errors.js`)
- `ApiError` - Base error with status code
- `NetworkError` - Connection issues
- `ValidationError` - Input validation failures
- `AuthError` - Authentication failures
- `ForbiddenError` - Permission denied
- `NotFoundError` - Resource not found

### 3. Consistent Module Pattern
- Each module follows the same pattern
- JSDoc documentation for all methods
- Clear separation of concerns
- Easy to test and maintain

## Usage

### Named Imports (Recommended)
```javascript
import { authApi, studentApi, hostelApi } from '@/service'

// Login
const user = await authApi.login({ email, password })

// Get students
const students = await studentApi.getStudents({ page: 1, limit: 10 })
```

### Default Import
```javascript
import api from '@/service'

// Login
const user = await api.auth.login({ email, password })

// Get students
const students = await api.student.getStudents({ page: 1, limit: 10 })
```

### Error Handling
```javascript
import { authApi, ApiError, NetworkError } from '@/service'

try {
  const user = await authApi.login(credentials)
} catch (error) {
  if (error instanceof NetworkError) {
    console.error('Network issue:', error.message)
  } else if (error instanceof ApiError) {
    if (error.isAuthError()) {
      console.error('Authentication failed:', error.message)
    } else if (error.isValidationError()) {
      console.error('Validation error:', error.message)
    }
  }
}
```

### Direct API Client Usage
```javascript
import { apiClient } from '@/service'

// Custom endpoint
const data = await apiClient.get('/custom-endpoint', {
  params: { foo: 'bar' }
})

// File upload
const result = await apiClient.upload('/upload/file', formData)
```

## Migration Guide

When ready to switch from old `/services` to new `/service`:

1. Rename `/src/services` to `/src/services-old` (backup)
2. Rename `/src/service` to `/src/services`
3. Update imports in your components:

**Before:**
```javascript
import { authApi } from '../services/apiService'
import { visitorApi } from '../services/visitorApi'
```

**After:**
```javascript
import { authApi, visitorApi } from '@/service'
// or
import { authApi, visitorApi } from '../services'
```

## Notes

- All API endpoints remain exactly the same
- All request/response data structures are preserved
- Error messages are unchanged
- Authentication (credentials: 'include') is maintained
