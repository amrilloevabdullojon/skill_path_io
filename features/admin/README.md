# Admin Feature Boundary

This folder is reserved for admin-specific feature modules and server-side orchestration.
Current Academy Studio implementation is split across:

- `app/admin/*` route layer
- `components/admin/*` UI layer
- `store/builder/*` client state layer
- `lib/admin/*`, `lib/course-builder/*`, `lib/permissions/*`, `lib/validation/*` helper layer

Add domain services here when moving mock flows to Prisma-backed production services.
