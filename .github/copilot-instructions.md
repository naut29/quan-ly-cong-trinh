# AI Copilot Instructions for Quan Lý Công Trình

## Architecture Overview

**Quan Lý Công Trình** is a multi-tenant construction project management platform built with Vite, React, TypeScript, and shadcn-ui. The app supports role-based access control and manages complex construction workflows (projects, materials, costs, contracts, etc.).

### Key Architectural Layers

1. **Routing & Layouts** ([src/App.tsx](src/App.tsx))
   - Public routes: Landing (`/`), Login (`/login`), Pricing, Demo
   - App routes: Dashboard + Projects under `/app`, then project-specific modules under `/app/projects/:id/:module`
     - Main modules: `overview`, `wbs`, `boq`, `materials`, `norms`, `costs`, `contracts`, `payments`, `approvals`, `progress`, `reports`
     - Admin modules: `/app/admin/*` (company, users, roles, audit-log, integrations, billing)
   - Platform routes: Super-admin dashboards under `/platform/*` (tenants, users, billing)
   - Nested guards: `ProjectGuard` → `PermissionGuard` → page component (strictly this order)

2. **Authentication & Authorization** ([src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx))
   - Mock-based auth with localStorage persistence (user ID saved on login)
   - 7 roles: `super_admin` (platform-wide), `company_owner`, `project_manager`, `qs_controller`, `warehouse`, `accountant`, `viewer`
   - Module-level permissions: each role has view/edit/approve flags per module (e.g., `materials`, `costs`, `contracts`)
   - Tenant switching: users belong to a single tenant; company_owner can only manage their tenant
   - Critical: super_admin has no tenantId, accesses `/platform/*` only; regular users access `/app/*`

3. **Data & Mock API** ([src/data/mockData.ts](src/data/mockData.ts))
   - Types: User, Tenant, Project; also rolePermissions matrix (role → module → view/edit/approve)
   - **No real backend yet** — all data is in-memory, only auth user ID persists to localStorage
   - Mock users: 2 tenants (Hòa Bình, Thành Công) with representative users for each role
   - Supabase client initialized ([src/lib/supabaseClient.ts](src/lib/supabaseClient.ts)) but **not wired** to any queries yet
   - When backend ready: replace mock data fetches with useQuery calls to Supabase

4. **Component Structure**
   - **UI Layer**: [src/components/ui/](src/components/ui/) (shadcn-ui primitives)
   - **Domain Components**: [src/components/](src/components/) organized by feature (materials, projects, costs, etc.)
   - **Page Components**: [src/pages/app/](src/pages/app/) and [src/pages/platform/](src/pages/platform/)
   - **Guards**: [src/components/guards/](src/components/guards/) (PermissionGuard, ProjectGuard)

## Critical Patterns & Conventions

### Guard Stacking Pattern
Routes requiring both project access + permission checks use nested guards:
```tsx
<Route path="projects/:id/materials" 
  element={<ProjectGuard><PermissionGuard module="materials"><Materials /></PermissionGuard></ProjectGuard>} />
```
- **ProjectGuard** validates user has access to the project
- **PermissionGuard** validates role has permission for the module
- Always order guards from outer (project) to inner (permission)

### Permission Checking
```tsx
const { hasPermission } = useAuth();
if (!hasPermission('materials', 'edit')) { /* deny */ }
```
Permission matrix: roles → modules → actions (view/edit/approve). Check [src/data/mockData.ts](src/data/mockData.ts) `rolePermissions` object for the matrix.

**Common patterns:**
- `hasPermission('materials', 'view')` — can user see materials? Used in PermissionGuard
- `hasPermission('costs', 'approve')` — can user approve costs? Only accountant/company_owner
- `hasPermission('admin', 'view')` — can user access admin panel? Only company_owner/super_admin

**Important:** Always wrap sensitive routes with `PermissionGuard` — it returns a denial UI if permission fails

### State Management
- **Auth state**: React Context ([src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx)) with useAuth() hook
- **Server state**: TanStack React Query (QueryClient in [src/App.tsx](src/App.tsx))
- **Form state**: react-hook-form + @hookform/resolvers (no manual form state)
- **UI state**: useState for component-local UI (modals, filters, etc.)

### Dialog/Modal Pattern
- Import from [src/components/ui/dialog.tsx](src/components/ui/dialog.tsx) or [src/components/ui/drawer.tsx](src/components/ui/drawer.tsx)
- Use controlled `open` + `onOpenChange` state
- Example: [src/components/materials/MaterialRequestFormDialog.tsx](src/components/materials/MaterialRequestFormDialog.tsx)

### Styling & Layout
- **Tailwind CSS** with CSS variables (shadcn default)
- **Layout**: [src/components/layout/AppLayout.tsx](src/components/layout/AppLayout.tsx) (main), [src/components/layout/AppSidebar.tsx](src/components/layout/AppSidebar.tsx), [src/components/layout/AppTopbar.tsx](src/components/layout/AppTopbar.tsx)
- Use `cn()` utility ([src/lib/utils.ts](src/lib/utils.ts)) for conditional class merging
- Consistent color scheme: foreground/background, primary, warning, destructive

### Notifications & Toasts
- **shadcn Toaster**: [src/components/ui/toaster.tsx](src/components/ui/toaster.tsx)
- **Sonner Toast**: [src/components/ui/sonner.tsx](src/components/ui/sonner.tsx)
- Use `useToast()` hook for imperative notifications

### i18n Conventions
- UI uses Vietnamese text strings (messages in Vietnamese)
- Look at [src/components/guards/PermissionGuard.tsx](src/components/guards/PermissionGuard.tsx) for Vietnamese messaging pattern
- No i18n library currently; hardcoded strings

### Chart & Data Export
- Chart components: [src/components/materials/MaterialCharts.tsx](src/components/materials/MaterialCharts.tsx)
- Export utilities: [src/lib/export-utils.ts](src/lib/export-utils.ts)
- Uses html2canvas for client-side exports

## Developer Workflows

### Development
```bash
npm install          # Install deps
npm run dev          # Start Vite dev server (http://localhost:8080)
npm run lint         # Run ESLint
```
**Dev server runs on port 8080.** Hot module reloading enabled. Component tagger active in dev mode ([vite.config.ts](vite.config.ts)).

### Testing
```bash
npm run test         # Run vitest once
npm run test:watch   # Watch mode
```
- Test config: [vitest.config.ts](vitest.config.ts)
- Test files: [src/test/](src/test/) (example.test.ts)
- Setup: [src/test/setup.ts](src/test/setup.ts)

### Build & Deployment
```bash
npm run build        # Production build to dist/
npm run build:dev    # Dev mode build (for debugging)
npm run preview      # Preview built app locally (port 4173)
```
- Deployed via Lovable platform. Commits to GitHub sync automatically.

### ESLint & Type Checking
- Config: [eslint.config.js](eslint.config.js)
- TypeScript: [tsconfig.json](tsconfig.json) with baseUrl "@" alias
- `noImplicitAny: false` and `strictNullChecks: false` (relaxed for speed)

**Quick debugging tips:**
- Login with mock users from [src/data/mockData.ts](src/data/mockData.ts) — e.g., `owner@hbc.vn` (company_owner role)
- Check localStorage: `localStorage.getItem('auth_user_id')` shows current user
- Permission denied? Check user's role + module permissions in mockData.ts `rolePermissions`
- Component not rendering? Check PermissionGuard + ProjectGuard stacking order in route

## File Organization Rules

- **Feature-based**: Group by domain (materials/, projects/, costs/) not by layer (components/, hooks/)
- **Page files**: [src/pages/app/FeatureName.tsx](src/pages/app/) - top-level page components
- **Dialog/Form files**: [src/components/FeatureName/FeatureNameFormDialog.tsx](src/components/) - suffixed with "Dialog"
- **Hooks**: [src/hooks/](src/hooks/) - `use*` convention
- **Utils & Lib**: [src/lib/](src/lib/) for exported utilities, [src/data/](src/data/) for mock data

## Cross-Component Communication

1. **Parent → Child**: Props (type-safe via TypeScript)
2. **Child → Parent**: Callbacks via props (onSave, onChange, etc.)
3. **Global State**: useAuth() from AuthContext (permissions, user, tenant)
4. **Server State**: useQuery/useMutation from React Query
5. **Sibling Communication**: Lift state to parent or use Context for related features

## Integration Points

- **Supabase**: Currently unused; client initialized at [src/lib/supabaseClient.ts](src/lib/supabaseClient.ts), awaiting backend setup
- **External Imports**: shadcn-ui (Radix UI primitives), date-fns, cmdk (command palette), embla-carousel (carousels)
- **Mock Data**: Replace with Supabase queries as backend develops

## Important Implementation Notes

- **No strict null checks**: Handle undefined/null gracefully but don't enforce strict types
- **Lovable component tagger**: Used in dev mode ([vite.config.ts](vite.config.ts)) for UX tracking
- **Mobile support**: Use `use-mobile` hook ([src/hooks/use-mobile.tsx](src/hooks/use-mobile.tsx)) for responsive design
- **Dialog accessibility**: shadcn dialogs auto-manage focus; ensure proper semantic structure
- **Forms**: Always use react-hook-form + TypeScript for type safety
- **Loading states**: Show isLoading indicators during async operations; disable buttons/inputs accordingly

## Quick Reference

| Concept | Location | Pattern |
|---------|----------|---------|
| Auth & Permissions | [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) | useAuth() context hook |
| Guard Components | [src/components/guards/](src/components/guards/) | Nested ProjectGuard + PermissionGuard |
| UI Components | [src/components/ui/](src/components/ui/) | shadcn-ui Radix-based |
| Domain Models | [src/data/mockData.ts](src/data/mockData.ts) | TypeScript interfaces |
| Forms & Dialogs | [src/components/*/**FormDialog.tsx](src/components/) | react-hook-form controlled |
| Charts & Export | [src/lib/export-utils.ts](src/lib/export-utils.ts) | html2canvas for client-side |
| Utilities | [src/lib/utils.ts](src/lib/utils.ts) | cn() for class merging |
