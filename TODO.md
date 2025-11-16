# TODO: Implement Dynamic QR System

## Task 1: Setup Backend (NestJS + Redis)

- [ ] Add ioredis and cache-manager dependencies to backend/package.json
- [ ] Run npm install in backend directory
- [ ] Update backend/src/app.module.ts to import CacheModule with Redis
- [ ] Update backend/src/modules/timekeeping/timekeeping.module.ts to import CacheModule
- [ ] Modify backend/src/modules/timekeeping/timekeeping.controller.ts: add GET /api/timekeeping/dynamic-qr endpoint
- [ ] Modify backend/src/modules/timekeeping/timekeeping.controller.ts: update POST /api/timekeeping/check-in/qr logic
- [ ] Update backend/src/modules/timekeeping/timekeeping.service.ts: implement Redis operations for check-in

## Task 2: Create Frontend Display Page

- [ ] Check frontend/package.json for QR code library (add if needed, e.g., qrcode.react)
- [ ] Create frontend/app/(dashboard)/admin/qr-display/page.tsx
- [ ] Implement page to fetch GET /api/timekeeping/dynamic-qr every 3 seconds
- [ ] Display the live-changing QR code on the page
