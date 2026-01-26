# TSX Studio - Comprehensive Implementation Plan

## Executive Summary

TSX Studio is a SaaS web application for creating, previewing, and exporting code-driven animation overlays using React/Remotion. Currently, the UI is fully designed but most features require backend implementation to be functional.

---

## Phase 1: Database & Authentication (Priority: CRITICAL)

**Estimated Time: 2-4 hours**

### 1.1 Fix Prisma Client Initialization

**Status: 🔴 Broken**

- **Issue**: Prisma 7 with SQLite requires driver adapter configuration
- **Current Error**: `PrismaClientConstructorValidationError`
- **Solution**:
  - Ensure `@prisma/adapter-libsql` and `@libsql/client` are properly installed
  - Update `src/lib/db.ts` to use correct driver adapter
  - Regenerate Prisma client with `npx prisma generate`

### 1.2 Implement Credentials Authentication

**Status: 🟡 Partially Working**

- **Files**: `src/auth.config.ts`, `src/auth.ts`
- **Tasks**:
  - [ ] Add password field to User model (or use passwordless)
  - [ ] Implement proper credential validation against database
  - [ ] Add bcrypt password hashing
  - [ ] Create user on signup flow
  - [ ] Initialize UserEntitlement on new user creation

### 1.3 Session Management

**Status: 🟡 Partially Working**

- **Files**: `src/middleware.ts`, `src/auth.ts`
- **Tasks**:
  - [ ] Ensure JWT sessions persist correctly
  - [ ] Add user ID to session token
  - [ ] Test protected route redirects

---

## Phase 2: Dashboard & Projects (Priority: HIGH)

**Estimated Time: 4-6 hours**

### 2.1 Convert Dashboard to Server Component with Real Data

**Status: 🔴 Hardcoded Demo Data**

- **File**: `src/app/dashboard/page.tsx`
- **Tasks**:
  - [ ] Convert to async server component
  - [ ] Fetch user's projects from database
  - [ ] Calculate real stats (total projects, versions, validated, errors)
  - [ ] Implement search functionality
  - [ ] Implement sort/filter functionality

### 2.2 Create Project Dialog

**Status: 🟡 UI Only**

- **File**: `src/components/create-project-dialog.tsx`
- **Tasks**:
  - [ ] Connect form submission to database
  - [ ] Create project record with initial version
  - [ ] Navigate to studio after creation
  - [ ] Add form validation (Zod schema)

### 2.3 Workspace Switcher

**Status: 🟡 UI Only**

- **File**: `src/components/workspace-switcher.tsx`
- **Tasks**:
  - [ ] Fetch user's workspaces from database
  - [ ] Implement workspace switching
  - [ ] Create "Create Workspace" dialog
  - [ ] Filter projects by active workspace

---

## Phase 3: Studio Editor (Priority: HIGH)

**Estimated Time: 6-10 hours**

### 3.1 Load Real Project Data

**Status: 🔴 Uses Hardcoded Data**

- **Files**: `src/app/studio/[projectId]/page.tsx`, `src/components/studio-client.tsx`
- **Tasks**:
  - [ ] Fetch project by ID from database
  - [ ] Load latest version's code into editor
  - [ ] Display real project name and status
  - [ ] Handle project not found (404)

### 3.2 Version Management

**Status: 🟡 UI Only**

- **Tasks**:
  - [ ] "New Version" button creates new ProjectVersion record
  - [ ] Version list fetched from database
  - [ ] Clicking version loads its code
  - [ ] "Save Version" updates current version or creates new
  - [ ] Copy/Delete version actions

### 3.3 Code Validation

**Status: 🟢 Basic Implementation**

- **Current**: Simple string-based heuristic validation
- **Enhancement Tasks**:
  - [ ] Add TypeScript syntax validation
  - [ ] Check for required Remotion imports
  - [ ] Validate compositionConfig export
  - [ ] Detect forbidden Node.js APIs
  - [ ] Store validation status in database

### 3.4 Live Preview (COMPLEX)

**Status: 🔴 Not Implemented**

- **Options**:
  1. **Simple**: Show static "Preview Ready" on validation pass
  2. **Medium**: Use iframe with bundled preview
  3. **Advanced**: Integrate Remotion Player for live preview
- **Tasks for Medium approach**:
  - [ ] Create `/api/preview` endpoint that bundles code
  - [ ] Use esbuild or similar for fast bundling
  - [ ] Render in sandboxed iframe
  - [ ] Add play/pause controls

### 3.5 File Upload

**Status: 🔴 Not Implemented**

- **File**: `src/components/studio-client.tsx` (Upload tab)
- **Tasks**:
  - [ ] Implement drag-and-drop file upload
  - [ ] Read .tsx/.tcx file contents
  - [ ] Load into editor
  - [ ] Validate file type and size

---

## Phase 4: Export & Rendering (Priority: HIGH)

**Estimated Time: 8-12 hours**

### 4.1 Export Dialog

**Status: 🟡 UI Only**

- **File**: `src/components/export-dialog.tsx`
- **Tasks**:
  - [ ] Connect to `/api/render` endpoint
  - [ ] Show credit cost before export
  - [ ] Handle insufficient credits error
  - [ ] Navigate to exports page after submission

### 4.2 Render Queue System

**Status: 🟡 Skeleton Only**

- **Files**: `src/lib/queue.ts`, `src/app/api/render/route.ts`
- **Dependencies**: Redis (via Docker or cloud)
- **Tasks**:
  - [ ] Set up Redis locally or use Upstash
  - [ ] Create render worker process
  - [ ] Integrate Remotion CLI for actual rendering
  - [ ] Update job status (QUEUED → RUNNING → SUCCEEDED/FAILED)
  - [ ] Store output URL and file size

### 4.3 Exports Page

**Status: 🟡 Needs Auth**

- **File**: `src/app/exports/page.tsx`
- **Tasks**:
  - [ ] Ensure auth works
  - [ ] Display real job list from database
  - [ ] Add download button for completed jobs
  - [ ] Add re-render button for failed jobs
  - [ ] Real-time status polling

---

## Phase 5: Billing & Credits (Priority: MEDIUM)

**Estimated Time: 4-6 hours**

### 5.1 Stripe Integration

**Status: 🟡 Skeleton Only**

- **Files**: `src/lib/stripe.ts`, `src/app/api/stripe/route.ts`, `src/app/api/webhooks/stripe/route.ts`
- **Tasks**:
  - [ ] Add Stripe API keys to .env
  - [ ] Create Stripe products/prices in dashboard
  - [ ] Implement checkout session creation
  - [ ] Handle subscription webhooks
  - [ ] Update user plan on subscription change

### 5.2 Billing Page

**Status: 🟡 UI Complete, Needs Auth**

- **File**: `src/app/billing/page.tsx`
- **Tasks**:
  - [ ] Fix database connection
  - [ ] Display real credit balance
  - [ ] Connect "Buy Pack" buttons to Stripe
  - [ ] Show real transaction history

### 5.3 Credit System

**Status: 🟡 Schema Ready**

- **Tasks**:
  - [ ] Auto-grant monthly credits (cron job or webhook)
  - [ ] Deduct credits on render (working in `/api/render`)
  - [ ] Show low credit warnings
  - [ ] Credit purchase flow

---

## Phase 6: Marketplace (Priority: MEDIUM)

**Estimated Time: 3-4 hours**

### 6.1 Marketplace Page

**Status: 🟡 Needs Auth**

- **File**: `src/app/marketplace/page.tsx`
- **Tasks**:
  - [ ] Fix database connection
  - [ ] Add search functionality
  - [ ] Add category filtering
  - [ ] "Use Template" copies code to new project

### 6.2 Template Submission

**Status: 🔴 Not Implemented**

- **File**: `src/app/templates/submit/page.tsx`
- **Tasks**:
  - [ ] Create submission form
  - [ ] Upload preview image
  - [ ] Admin approval workflow

---

## Phase 7: Referrals (Priority: LOW)

**Estimated Time: 2-3 hours**

### 7.1 Referral Page

**Status: 🟡 Needs Auth**

- **File**: `src/app/referrals/page.tsx`
- **Tasks**:
  - [ ] Fix database connection
  - [ ] Copy referral code to clipboard
  - [ ] Track referral signups

### 7.2 Referral Signup Flow

**Status: 🔴 Not Implemented**

- **Tasks**:
  - [ ] Accept referral code on signup
  - [ ] Create ReferralEvent record
  - [ ] Grant credits on subscription

---

## Phase 8: Admin Panel (Priority: LOW)

**Estimated Time: 2-3 hours**

### 8.1 Admin Dashboard

**Status: 🟡 Needs Auth + Role Check**

- **File**: `src/app/admin/page.tsx`
- **Tasks**:
  - [ ] Add admin role check
  - [ ] Display real job queue stats
  - [ ] Add user management
  - [ ] Template moderation

---

## Infrastructure Requirements

### Required Services

| Service | Purpose | Setup |
|---------|---------|-------|
| SQLite | Database | ✅ Already configured |
| Redis | Job Queue | `docker run -d -p 6379:6379 redis` |
| Remotion | Video Rendering | `npm install @remotion/cli` |

### Environment Variables Needed

```env
# Already configured
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="..."

# Need to add
REDIS_HOST="localhost"
REDIS_PORT="6379"

# For production features
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
STRIPE_SECRET_KEY="..."
STRIPE_WEBHOOK_SECRET="..."
RESEND_API_KEY="..."
```

---

## Recommended Implementation Order

### Sprint 1 (Day 1): Core Auth & Database

1. Fix Prisma client initialization
2. Implement credentials login
3. Test protected routes

### Sprint 2 (Day 2): Dashboard & Projects

1. Connect dashboard to real data
2. Implement project creation
3. Implement project deletion

### Sprint 3 (Days 3-4): Studio Editor

1. Load real project data
2. Implement version save
3. Add file upload
4. Basic code validation

### Sprint 4 (Days 5-6): Export System

1. Set up Redis
2. Implement render worker
3. Connect export dialog
4. Test full export flow

### Sprint 5 (Day 7): Polish & Additional Features

1. Billing integration
2. Marketplace
3. Referrals
4. Admin panel

---

## Quick Wins (Can Be Done Immediately)

1. **Copy buttons**: Add `navigator.clipboard.writeText()` to copy code/referral links
2. **Delete project**: Add API route and connect to dropdown menu
3. **Search filter**: Implement client-side project search
4. **Toast notifications**: Already set up with Sonner

---

## Technical Notes

### Remotion Rendering

For actual video rendering, you'll need:

```bash
npm install @remotion/cli @remotion/renderer
```

The render worker would execute:

```typescript
import { bundle, renderMedia } from '@remotion/bundler';

// 1. Bundle the user's code
const bundled = await bundle(entryPoint);

// 2. Render to MP4
await renderMedia({
  composition: 'MyComp',
  serveUrl: bundled,
  codec: 'h264',
  outputLocation: 'out.mp4',
});
```

### Security Considerations

- Sandbox user code execution
- Rate limit API endpoints
- Validate file uploads
- Use CSRF protection
- Implement proper authorization checks

---

## Summary

| Category | Status | Items |
|----------|--------|-------|
| 🔴 Not Working | 8 | Auth, Dashboard data, Preview, Upload, Render, Template Submit, Referral tracking, Admin roles |
| 🟡 Partial | 12 | Credentials, Sessions, Create Project, Version management, Export, Billing, Marketplace, Referrals, Admin |
| 🟢 Complete | 3 | UI Design, Validation (basic), Toast notifications |

**Total Estimated Development Time: 25-40 hours**

---

*Generated: January 26, 2026*
*TSX Studio Implementation Plan v1.0*
