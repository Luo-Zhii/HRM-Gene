# Security Fix: Dynamic Navigation Menu

## Tasks

- [x] Add state for navigation data and loading in layout.tsx
- [x] Implement useEffect to fetch navigation from /api/auth/navigation when user is available
- [x] Modify Sidebar component to render links dynamically based on API response
- [x] Remove hardcoded navigation menu array
- [x] Ensure admin section only renders if navigation.admin has items
- [x] Test that HR users cannot see admin links
