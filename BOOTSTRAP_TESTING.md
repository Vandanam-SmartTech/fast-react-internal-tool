# Bootstrap API - Quick Testing Guide

## Prerequisites

1. **Backend Running**
   ```bash
   cd g:\Vandanam\jwt
   mvn spring-boot:run -Dspring-boot.run.profiles=local
   ```

2. **Frontend Running**
   ```bash
   cd g:\Vandanam\fast-react-internal-tool
   npm run dev
   ```

3. **Environment Variables**
   ```env
   VITE_JWT_API=http://localhost:8247
   ```

## Quick Test Commands

### Test Backend Endpoint Directly

```bash
# Get JWT token first (replace with actual credentials)
curl -X POST http://localhost:8247/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin","password":"password"}'

# Save the token from response
TOKEN="your_jwt_token_here"

# Test bootstrap endpoint
curl -X GET "http://localhost:8247/api/bootstrap?page=0&size=9" \
  -H "Authorization: Bearer $TOKEN"
```

### PowerShell Version

```powershell
# Login
$response = Invoke-RestMethod -Uri "http://localhost:8247/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"identifier":"admin","password":"password"}'

$token = $response.accessToken

# Test bootstrap
Invoke-RestMethod -Uri "http://localhost:8247/api/bootstrap?page=0&size=9" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $token"}
```

## Browser Testing

### 1. Open Developer Tools
- Press `F12` or `Ctrl+Shift+I`
- Go to **Network** tab
- Filter by **Fetch/XHR**

### 2. Login and Navigate
1. Login with SUPER_ADMIN credentials
2. Navigate to User Management
3. Check Network tab

### 3. Verify Single API Call
You should see:
```
✅ GET /api/bootstrap?page=0&size=9
❌ No GET /api/users/all
❌ No GET /api/organizations
❌ No GET /api/roles
```

### 4. Check Response
Click on the bootstrap request and verify response contains:
```json
{
  "users": [...],
  "organizations": [...],
  "roles": [...]
}
```

## Testing Checklist

### SUPER_ADMIN Tests
```
□ Login as SUPER_ADMIN
□ Navigate to User Management
□ Verify page loads
□ Check Network tab shows 1 API call
□ Verify all users are displayed
□ Verify organizations are loaded (if used)
□ Verify roles are available in filters
□ Check console for errors (should be none)
```

### ORG_ADMIN Tests
```
□ Login as ORG_ADMIN
□ Navigate to User Management
□ Verify page loads
□ Check Network tab shows 1 API call
□ Verify paginated users are displayed
□ Verify user count is correct
□ Test "First" pagination button
□ Test "Previous" pagination button
□ Test "Next" pagination button
□ Test "Last" pagination button
□ Verify each page change makes 1 API call
□ Check console for errors (should be none)
```

### AGENCY_ADMIN Tests
```
□ Login as AGENCY_ADMIN
□ Navigate to User Management
□ Verify page loads
□ Check Network tab shows 1 API call
□ Verify paginated users are displayed
□ Test pagination
□ Check console for errors (should be none)
```

## Performance Verification

### Measure Page Load Time

1. **Open Performance Tab** in DevTools
2. **Start Recording**
3. **Navigate to User Management**
4. **Stop Recording**
5. **Check Metrics:**
   - Total load time should be < 500ms
   - Should see 1 API call
   - No waterfall of multiple requests

### Network Timing

Check the bootstrap request timing:
```
Queueing:     < 10ms
DNS Lookup:   < 5ms
Initial Conn: < 50ms
SSL:          < 100ms
Request sent: < 5ms
Waiting:      < 400ms  ← Backend processing
Content DL:   < 50ms
Total:        < 500ms
```

## Debugging

### Check Backend Logs

```bash
# View live logs
tail -f g:\Vandanam\jwt\logs\application.log

# Search for bootstrap logs
findstr /i "BOOTSTRAP" g:\Vandanam\jwt\logs\application.log
```

Expected log output:
```
[BOOTSTRAP] Starting bootstrap data load - page: 0, size: 9
[BOOTSTRAP] JWT extraction took 5ms
[BOOTSTRAP] Role extraction took 2ms
[BOOTSTRAP] Role mapping took 3ms
[BOOTSTRAP] getAllUsers took 150ms
[BOOTSTRAP] getAllOrganizations took 80ms
[BOOTSTRAP] Total bootstrap data load completed in 240ms for user: admin
```

### Check Frontend Console

Open browser console and look for:
```javascript
// Should NOT see these
❌ "Failed to load users"
❌ "Failed to load organizations"
❌ "Failed to load roles"

// Should see this
✅ Network request to /api/bootstrap
✅ No errors
```

### Verify Cache

Make the same request twice and check timing:
```
First request:  ~400ms (database query)
Second request: ~50ms  (cached response)
```

## Common Issues & Solutions

### Issue: 401 Unauthorized
```
Solution:
1. Check JWT token is valid
2. Verify token in localStorage
3. Check token expiration
4. Try logging out and back in
```

### Issue: Empty Response
```
Solution:
1. Check user has correct role
2. Verify organization ID in localStorage
3. Check backend logs for errors
4. Verify database has data
```

### Issue: Pagination Not Working
```
Solution:
1. Check page and size params in URL
2. Verify totalPages in response
3. Check currentPage state
4. Look for console errors
```

### Issue: Multiple API Calls Still Happening
```
Solution:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard reload (Ctrl+Shift+R)
3. Check if old code is still running
4. Verify bootstrapService.ts exists
5. Check imports in UserManagement.tsx
```

## Performance Benchmarks

### Expected Results

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| API Calls | 1 | 1 | >1 |
| Load Time | <400ms | <600ms | >800ms |
| Cache Hit | <50ms | <100ms | >200ms |
| Total Page Load | <1s | <2s | >3s |

### Measure with Browser DevTools

```javascript
// Run in console
performance.mark('start');
// Navigate to page
performance.mark('end');
performance.measure('pageLoad', 'start', 'end');
console.log(performance.getEntriesByName('pageLoad')[0].duration);
```

## Rollback Commands

If you need to revert changes:

```bash
# Restore UserManagement.tsx
git checkout HEAD -- src/pages/Organizations/UserManagement.tsx

# Remove bootstrap service
del src\services\bootstrapService.ts

# Remove documentation
del BOOTSTRAP_INTEGRATION.md
del BOOTSTRAP_SUMMARY.md
del BOOTSTRAP_FLOW.md
del BOOTSTRAP_TESTING.md
```

## Success Criteria

✅ **All tests pass**
✅ **Single API call per page load**
✅ **Page loads in < 500ms**
✅ **No console errors**
✅ **Pagination works correctly**
✅ **All user roles work**
✅ **Cache improves performance**

## Next Steps After Testing

1. **Monitor Production**
   - Check error rates
   - Monitor API response times
   - Track user feedback

2. **Optimize Further**
   - Apply to other pages
   - Implement client-side JWT parsing
   - Add optimistic updates

3. **Document Learnings**
   - Update team wiki
   - Share performance gains
   - Create best practices guide

---

**Quick Reference:**
- Backend: `http://localhost:8247/api/bootstrap`
- Frontend: `http://localhost:5173`
- Logs: `g:\Vandanam\jwt\logs\application.log`
- Docs: `BOOTSTRAP_INTEGRATION.md`
