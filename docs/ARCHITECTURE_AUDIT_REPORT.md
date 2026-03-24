# ARCHITECTURE AUDIT REPORT

Date: 2026-03-15
Scope: Local SkillPath Academy (Next.js App Router, Prisma, Zustand, Tailwind)

## 1. Systems In Conflict

- AI routing fragmentation:
  - Existing routes: `/api/mentor`, `/api/interview`, `/api/quiz/ai-review`, `/api/exercise/ai-review`
  - Newer route: `/api/ai/remediation`
  - Result: duplicated request/response contracts and split integration points in UI.
- Learning model split:
  - Student side uses Prisma `Track/Module/Lesson/Quiz/Question`.
  - Academy Studio uses `Course/CourseModule/CourseLesson/CourseQuiz/...` + client-side persisted store.
  - Result: no formal bridge contract between published course content and student runtime.
- Career/personalization data split:
  - Dashboard mixes real Prisma data and mock personalization seeds without a single aggregation facade.
- Community layer overlap:
  - `/community` and `/groups` + `/discussions` have overlapping responsibilities.
- Type domain drift:
  - Rich domain types in `types/personalization.ts` but limited segregation into `types/ai`, `types/career`, `types/learning`, `types/courses`.
- UI primitive divergence:
  - Repeated ad-hoc progress/timeline/panel variants instead of shared UI primitives.

## 2. Duplications Identified

- Skill radar wrappers:
  - `components/skill-radar/skill-radar.tsx` and `components/radar/skill-radar-chart.tsx`.
- AI review endpoints:
  - Quiz and exercise review implemented separately with similar validation/response pattern.
- Mentor integration endpoint naming:
  - UI uses `/api/mentor`, while broader architecture expects `/api/ai/*`.
- Feature overlap:
  - `features/career` and `features/career-readiness` split concerns that should be composed via one facade.

## 3. Pages With Overlapping Functionality

- `/community` vs `/groups` and `/discussions`.
- `/career` and dashboard career preview pulling related logic from different layers.
- Interview trainer has route `/interview`, but AI namespace did not mirror with `/api/ai/interview`.

## 4. Prisma Model Risks / Migration Needs

- Parallel learning schemas (`Track/*` and `Course/*`) are intentional but need bridge policy:
  - define how `Course.status=PUBLISHED` feeds student-side content.
- New personalization models exist in schema, but runtime is still mostly mock-driven.
- Recommended migration sequence:
  1. Keep current student schema live.
  2. Add bridge read model/adapters for `Course -> UnifiedLearningTrack`.
  3. Gradually switch student pages to unified read-model interface (not direct schema coupling).

## 5. Consolidation Plan (Migration)

1. Consolidate AI routes to `/api/ai/*` and keep old endpoints as compatibility wrappers.
2. Introduce unified AI service layer in `lib/ai/*` used by all endpoints.
3. Introduce learning bridge contract (`types/learning/*`, `lib/learning/*`) between Studio and student runtime.
4. Add segmented type domains (`types/ai`, `types/career`, `types/learning`, `types/courses`) with re-exports for backward compatibility.
5. Normalize state structure with `store/learning`, `store/admin`, `store/user` slices while keeping existing stores stable.
6. Create shared UI primitives for panel/progress/chart shell and migrate high-traffic widgets first.
7. Keep mock providers but route all UI through service facades so real Prisma/API replacement is incremental.

## 6. Modules to Split / Keep

- Keep:
  - App Router page boundaries and admin route tree.
  - Existing Prisma entities.
- Split and compose:
  - AI logic into `lib/ai` unified handlers.
  - Career + planner + matching composition into career service facade.
  - Learning runtime adapters into `lib/learning/content-bridge.ts`.

## 7. Implemented In This Pass

- Consolidated AI endpoints under `/api/ai/*`:
  - Added `/api/ai/mentor`, `/api/ai/review`, `/api/ai/interview`, `/api/ai/recommendations`.
  - Kept old endpoints as backward-compatible wrappers.
- Added unified AI service layer:
  - `lib/ai/mentor-service.ts`
  - `lib/ai/review-service.ts`
  - `lib/ai/interview-service.ts`
  - `lib/ai/recommendations-service.ts`
- Added typed domains and normalization contracts:
  - `types/ai`, `types/career`, `types/learning`, `types/courses`.
  - `lib/learning/content-bridge.ts` for Studio-to-student DTO mapping.
- Integrated Course Builder preview with unified learning DTO:
  - `components/admin/preview/course-student-preview.tsx` now consumes mapped unified track shape.
- Introduced segmented store entry points with compatibility:
  - `store/admin/use-course-builder-store.ts`
  - `store/learning/use-quiz-store.ts`
  - `store/user/use-ui-store.ts`
  - Admin components switched to `store/admin/*` imports.
- Added shared UI primitives for migration:
  - `components/ui/panel.tsx`
  - `components/ui/progress-bar.tsx`
  - `components/ui/chart-shell.tsx`
