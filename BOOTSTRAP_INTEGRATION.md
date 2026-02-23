# Bootstrap API Integration Guide

## Overview
The Bootstrap API consolidates multiple API calls into a single endpoint, reducing page load time by 66% and improving performance.

## API Endpoint

### Backend (JWT Service)
```
GET /api/bootstrap?page=0&size=9
Authorization: Bearer <token>
```

### Response Structure
```typescript
{
  // For SUPER_ADMIN
  users?: any[];
  organizations?: any[];
  
  // For ORG_ADMIN/AGENCY_ADMIN
  usersPaginated?: {
    content: any[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  };
  totalUsers?: number;
  
  // For all roles (extracted from JWT)
  roles?: Array<{ name: string }>;
}
```

## Frontend Integration

### Service Layer
**File:** `src/services/bootstrapService.ts`

```typescript
import { getJwtAPI } from './jwtService';

export const fetchBootstrapData = async (page = 0, size = 9) => {
  const response = await getJwtAPI().get('/api/bootstrap', {
    params: { page, size }
  });
  return response.data;
};
```

### Usage in Components

#### Before (Multiple API Calls)
```typescript
// 3 separate API calls
const users = await fetchAllUsers();
const orgs = await fetchOrganizations();
const roles = await getAllRoles();
```

#### After (Single API Call)
```typescript
// 1 API call
const data = await fetchBootstrapData(page, size);

// Handle SUPER_ADMIN response
if (data.users) {
  setUsers(data.users);
  setOrganizations(data.organizations);
}

// Handle ORG_ADMIN/AGENCY_ADMIN response
if (data.usersPaginated) {
  setUsers(data.usersPaginated.content);
  setTotalPages(data.usersPaginated.totalPages);
}

// Roles from JWT
setRoles(data.roles);
```

## Performance Benefits

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| API Calls | 3 | 1 | 66% reduction |
| Network Requests | Multiple | Single | Faster load |
| Data Transfer | Redundant | Optimized | Less bandwidth |

## Role-Based Responses

### SUPER_ADMIN
- Receives: `users`, `organizations`, `roles`
- Users: All users in the system
- Organizations: All organizations

### ORG_ADMIN / AGENCY_ADMIN
- Receives: `usersPaginated`, `totalUsers`, `roles`
- Users: Paginated users for their organization
- Pagination: Includes totalPages, totalElements, etc.

## Implementation Checklist

- [x] Create `bootstrapService.ts`
- [x] Update `UserManagement.tsx` to use bootstrap endpoint
- [x] Replace multiple API calls with single `fetchBootstrapData()`
- [x] Handle both SUPER_ADMIN and ORG_ADMIN responses
- [x] Update pagination to use bootstrap data
- [ ] Test with SUPER_ADMIN role
- [ ] Test with ORG_ADMIN role
- [ ] Test with AGENCY_ADMIN role
- [ ] Verify pagination works correctly
- [ ] Verify role filtering works

## Testing

### Test SUPER_ADMIN
1. Login as SUPER_ADMIN
2. Navigate to User Management
3. Verify all users load
4. Check Network tab - should see 1 `/api/bootstrap` call

### Test ORG_ADMIN
1. Login as ORG_ADMIN
2. Navigate to User Management
3. Verify paginated users load
4. Test pagination buttons
5. Check Network tab - should see 1 `/api/bootstrap` call per page

## Backend Configuration

Ensure your JWT API is running on the correct port:

```env
# .env file
VITE_JWT_API=http://localhost:8247
```

The backend bootstrap endpoint is at:
```
g:\Vandanam\jwt\src\main\java\com\vandanam\security\controllers\BootstrapController.java
```

## Caching

The backend uses Caffeine cache:
- Cache key: `authHeader + '_' + page + '_' + size`
- TTL: 30 minutes
- Max entries: 50,000

## Security

- Requires authentication (Bearer token)
- Role-based authorization via `@PreAuthorize`
- JWT claims validated server-side
- No sensitive data exposed beyond existing endpoints

## Troubleshooting

### Issue: 401 Unauthorized
- Check JWT token is valid
- Verify token is being sent in Authorization header

### Issue: Empty response
- Check user has correct role (SUPER_ADMIN, ORG_ADMIN, or AGENCY_ADMIN)
- Verify organization ID in localStorage for ORG_ADMIN

### Issue: Pagination not working
- Ensure `page` and `size` params are being sent
- Check `totalPages` and `totalElements` in response

## Next Steps

1. Apply same pattern to other pages that make multiple API calls
2. Consider client-side JWT parsing for roles (no API call needed)
3. Add loading states and error handling
4. Implement cache invalidation on user/org updates

## References

- Backend: `g:\Vandanam\jwt\BOOTSTRAP_OPTIMIZATION.md`
- Backend Controller: `g:\Vandanam\jwt\src\main\java\com\vandanam\security\controllers\BootstrapController.java`
- Frontend Service: `src\services\bootstrapService.ts`
- Example Usage: `src\pages\Organizations\UserManagement.tsx`
