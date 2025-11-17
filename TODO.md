# HRM Dashboard Development Tasks

## 1. Backend RBAC Fix (HIGH PRIORITY)

- [x] Add `/auth/navigation` endpoint in `auth.controller.ts` that returns menu items filtered by user permissions (only show admin section if user has "manage:system")

## 2. Frontend Navigation Update

- [x] Modify `layout.tsx` to fetch navigation from backend API instead of hardcoding
- [x] Add descriptive icons to menu items using lucide-react
- [x] Implement active page highlighting based on current pathname

## 3. Timekeeping UI Redesign

- [x] Replace plain buttons with larger, interactive cards/buttons in `timekeeping/page.tsx`
- [x] Add relevant icons (location for IP, QR code for QR, paste for fallback)
- [x] Apply box-shadow and visual depth

## 4. General UI Modernization

- [x] Update color palette in `globals.css` to a more contemporary scheme
- [x] Ensure full responsiveness for desktop and tablet

## Followup Steps

- [ ] Install lucide-react if not present
- [ ] Test RBAC with different user roles (admin vs HR)
- [ ] Verify responsive design on different screen sizes
- [ ] Test timekeeping check-in functionality after UI changes
