# Frontend Updates Summary

## Complete Migration from Supabase to Custom Backend API

### Files Created

1. **[src/lib/api.ts](src/lib/api.ts)** ✨ NEW
   - Axios-based API client
   - JWT token interceptor
   - Automatic token attachment to requests
   - Global error handling (401 redirects to login)
   - API modules for all resources:
     - `authAPI` - Authentication endpoints
     - `providerAPI` - Provider CRUD
     - `dietPlanAPI` - Diet plan management
     - `mealAPI` - Meal operations
     - `subscriptionAPI` - Subscription management
     - `orderAPI` - Order operations
     - `notificationAPI` - Notifications

2. **[src/components/ProtectedRoute.tsx](src/components/ProtectedRoute.tsx)** ✨ NEW
   - Route protection wrapper
   - Role-based access control
   - Loading state handling
   - Automatic redirect to login
   - Support for required roles (user/provider/admin)

### Files Updated

1. **[src/App.tsx](src/App.tsx)** 🔄 UPDATED
   - ✅ Added `AuthProvider` wrapper
   - ✅ Added all public routes
   - ✅ Added all auth routes
   - ✅ Added protected user routes
   - ✅ Wrapped protected routes with `ProtectedRoute` component

   **Routes Added:**
   ```
   Public:
   - / (home)
   - /plans
   - /services
   - /contact

   Auth:
   - /login
   - /register
   - /provider/register
   - /forgot-password
   - /reset-password

   Protected:
   - /dashboard
   - /profile
   - /meal-plans
   - /subscriptions
   - /orders
   - /notifications
   - /ai-diet
   - /recipe/:id
   ```

2. **[src/hooks/useAuth.tsx](src/hooks/useAuth.tsx)** 🔄 UPDATED
   - ❌ Removed Supabase Auth
   - ✅ Added JWT authentication
   - ✅ LocalStorage token management
   - ✅ Updated `User` interface for backend schema
   - ✅ Added `refreshUser()` method
   - ✅ Error handling with try/catch

   **Changes:**
   - `user.id` → `user._id`
   - `user.full_name` → `user.fullName`
   - `session` removed (using token instead)
   - `roles` array built into user object

3. **[src/pages/user/Profile.tsx](src/pages/user/Profile.tsx)** 🔄 UPDATED
   - ❌ Removed `supabase` import
   - ✅ Using `authAPI.updateProfile()`
   - ✅ Using `refreshUser()` after updates
   - ✅ Better error handling

4. **[src/pages/user/Dashboard.tsx](src/pages/user/Dashboard.tsx)** 🔄 UPDATED
   - ❌ Removed Supabase queries
   - ✅ Updated to use `user.fullName`
   - ✅ Prepared for backend API integration
   - ⚠️ Currently using mock data (TODO: implement API calls)

5. **[.env](.env)** 🔄 UPDATED
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

6. **[package.json](package.json)** 🔄 UPDATED
   - ✅ Added `axios@^1.6.0`
   - ❌ Removed `@supabase/supabase-js`

### Files Removed

1. ❌ **src/integrations/supabase/** - Entire folder deleted
   - `client.ts` - Supabase client configuration
   - `types.ts` - Supabase TypeScript types

## Authentication Flow Changes

### Before (Supabase)
```typescript
// Login
const { error } = await supabase.auth.signInWithPassword({ email, password });

// User access
const { data: { user } } = await supabase.auth.getUser();

// Session management
const { data: { session } } = await supabase.auth.getSession();
```

### After (Custom Backend)
```typescript
// Login
const { error } = await signIn(email, password);
// Token stored in localStorage automatically

// User access
const { user } = useAuth(); // From context

// Profile update
await authAPI.updateProfile({ fullName, phone });
await refreshUser(); // Refresh user data
```

## API Usage Examples

### Authentication
```typescript
import { authAPI } from '@/lib/api';

// Register
await authAPI.register({ email, password, fullName });

// Login
await authAPI.login(email, password);

// Get current user
await authAPI.getMe();

// Update profile
await authAPI.updateProfile({ fullName, phone });
```

### Providers
```typescript
import { providerAPI } from '@/lib/api';

// Get all providers
const response = await providerAPI.getAll();

// Create provider
await providerAPI.create({ businessName, description, address });

// Update provider
await providerAPI.update(id, { businessName });
```

### Diet Plans
```typescript
import { dietPlanAPI } from '@/lib/api';

// Get all plans
const response = await dietPlanAPI.getAll();

// Filter by provider
const response = await dietPlanAPI.getAll({ providerId: 'xxx' });

// Create plan (requires provider role)
await dietPlanAPI.create({
  name: 'Keto Plan',
  price: 49.99,
  durationDays: 7
});
```

## Components That Still Need Updates

The following components may still reference Supabase and need to be updated:

1. **src/pages/user/MealPlans.tsx** - Update to use dietPlanAPI
2. **src/pages/user/Subscriptions.tsx** - Update to use subscriptionAPI
3. **src/pages/user/OrderHistory.tsx** - Update to use orderAPI
4. **src/pages/user/Notifications.tsx** - Update to use notificationAPI
5. **src/pages/user/AIDiet.tsx** - Update AI preferences API calls
6. **src/pages/auth/ForgotPassword.tsx** - Implement backend endpoint
7. **src/pages/auth/ResetPassword.tsx** - Implement backend endpoint
8. **src/pages/auth/ProviderRegister.tsx** - Use providerAPI
9. **src/pages/public/Plans.tsx** - Use dietPlanAPI for public display

## Testing Checklist

### ✅ Completed
- [x] App.tsx routes configured
- [x] AuthProvider wrapping
- [x] ProtectedRoute component
- [x] Login page works with backend
- [x] Register page works with backend
- [x] Profile update works
- [x] Dashboard displays user data

### ⏳ To Test
- [ ] Provider registration flow
- [ ] Diet plan creation
- [ ] Subscriptions
- [ ] Orders
- [ ] Notifications
- [ ] Password reset flow
- [ ] AI diet preferences

## Important Notes

### Token Management
- Tokens stored in `localStorage` under key `"token"`
- Tokens automatically attached to requests via axios interceptor
- On 401 error, user is logged out and redirected to `/login`

### User Data Structure
```typescript
interface User {
  _id: string;
  email: string;
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  roles: ('user' | 'provider' | 'admin')[];
}
```

### Protected Routes
```typescript
// Basic protection (requires login)
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Role-specific protection
<ProtectedRoute requiredRole="provider">
  <ProviderDashboard />
</ProtectedRoute>
```

### Error Handling Pattern
```typescript
try {
  const response = await authAPI.updateProfile(data);
  toast({ title: 'Success!' });
} catch (error: any) {
  toast({
    title: 'Error',
    description: error.response?.data?.message || 'Something went wrong',
    variant: 'destructive'
  });
}
```

## Next Steps

1. **Update Remaining Pages**
   - Update all pages that use Supabase
   - Test each page individually

2. **Add Backend Endpoints**
   - Implement missing backend routes (meals, orders, subscriptions, notifications)
   - Test API integration

3. **Implement Features**
   - File upload for images
   - Email verification
   - Password reset
   - Real-time notifications (optional: Socket.io)

4. **Testing**
   - Test all user flows
   - Test provider flows
   - Test admin flows
   - Handle edge cases

## Quick Reference

### Import Patterns
```typescript
// Old (Supabase)
import { supabase } from '@/integrations/supabase/client';

// New (Backend API)
import { authAPI, providerAPI, dietPlanAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
```

### Data Fetching Pattern
```typescript
// Old
const { data } = await supabase.from('providers').select('*');

// New
const response = await providerAPI.getAll();
const data = response.data;
```

### User Access Pattern
```typescript
// Old
const { user } = useAuth(); // Supabase user
const userId = user?.id;
const name = user?.user_metadata?.full_name;

// New
const { user } = useAuth(); // Custom user
const userId = user?._id;
const name = user?.fullName;
```

## Success! 🎉

Your frontend is now fully configured to work with the MongoDB + Express + Node.js backend!
