

## Problem
When an admin user logs in, they are redirected to `/` (the regular user home page) instead of `/admin`. The `AuthRoute` component redirects all authenticated users to `/` regardless of their role.

## Plan

### 1. Update AuthRoute to redirect admins to /admin
Modify the `AuthRoute` component in `src/App.tsx` to check if the logged-in user has the admin role. If they do, redirect to `/admin` instead of `/`.

### 2. Add admin redirect on the home page
As a safety net, update `src/pages/Index.tsx` to check if the user is an admin and automatically redirect them to `/admin` so they never see the regular user dashboard.

### Technical Details

**File: `src/App.tsx`**
- Modify the `AuthRoute` component to use `useAdmin` hook
- If user is admin, `Navigate to="/admin"` instead of `to="/"`

**File: `src/pages/Index.tsx`**
- Import `useAdmin` and `useNavigate`
- Add a `useEffect` that redirects to `/admin` when `isAdmin` is true
- Show loading spinner while admin status is being checked

This ensures that admin users always land on the admin panel, whether they come from the login page or navigate to `/` directly.

