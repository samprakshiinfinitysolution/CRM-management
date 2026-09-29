# CRM Platform – Agent Guide: Rules, Regulations & Engineering Standards

> **Notice to AI Agents (Antigravity, Claude, Copilot, etc.):**  
> This document defines the non-negotiable architectural rules, security regulations, coding standards, and operational guidelines for this repository. Every agent working on this codebase must adhere strictly to these principles.

---

## 1. Project Overview & Architecture

* **Repository Type:** Decoupled Full-Stack Monorepo
  * **Backend (`/backend`):** Node.js + Express.js REST API with TypeScript. Authoritative business logic and data access layer.
  * **Frontend (`/frontend`):** Next.js (App Router), React, TypeScript, and Tailwind CSS. Presentation layer only.
* **System of Record:** Relational CRM Database (PostgreSQL). 
* **Role of Excel:** Excel is strictly an import and export transport format; the CRM database is the sole source of truth.

---

## 2. Non-Negotiable Core Regulations

### ⚖️ Regulation 1: No Business Logic in the Frontend
* UI components in Next.js must handle presentation, user interactions, and form inputs **only**.
* All business rules, duplicate detection, assignment quotas, status progression gates, and validation must reside exclusively in backend services (`backend/src/services/`).
* Browser clients must **never** communicate directly with the database or third-party sensitive services.

### ⚖️ Regulation 2: Relational Integrity & Authoritative Identity
* Every lead must have an internal unique identifier format: `CRM-XXXXXX` (e.g., `CRM-000001`).
* Never trust client-provided roles, user IDs, or privilege claims. Identity and role authorization must be derived from verified JWT/session tokens on every request.

### ⚖️ Regulation 3: Immutable Historical Records
* **Current state and historical records are stored separately.**
* Status updates must create a record in `LeadStatusHistory`.
* Assignments, reassignments, and recalls must create a record in `LeadAssignment`.
* All user and system interactions must append to `LeadActivity` (chronological timeline).
* Never overwrite or mutate historical activity logs.

### ⚖️ Regulation 4: Soft Deletion Only
* **Hard deletion (`DELETE FROM ...`) of leads or customer records is strictly forbidden.**
* Use a soft-delete mechanism (`isDeleted: boolean`, `deletedAt: timestamp`) to preserve relational integrity, reporting accuracy, and audit trails.

### ⚖️ Regulation 5: Mandatory Database Transactions (ACID)
* All multi-record operations **must** execute inside an atomic database transaction:
  * Bulk lead distribution (Equal, Fixed, or Bulk modes).
  * Lead reassignment and recall.
  * Staged Excel import commits.
* If any sub-operation fails or an executive quota exceeds available leads, the entire transaction must roll back cleanly.

### ⚖️ Regulation 6: Strict RBAC & Data Isolation
* **Sales Executive Isolation:** Sales Executives must **only** receive and query leads assigned directly to their `userId`. They must have zero read/write access to the unassigned pool or to leads assigned to peers.
* **No Peer Assignment:** Sales Executives cannot transfer or assign leads to other executives in Release 1.
* **Team Leader Authority:** Only authenticated Team Leaders can access the unassigned pool, execute distribution, reassign leads, or perform Excel bulk imports.
* **Protected Deals:** Leads marked `Won/Sold` or `Lost` cannot be silently reassigned or updated without authorized TL intervention and audit logging.

---

## 3. Backend Development Standards (`/backend`)

### Directory Structure
```
backend/
├── src/
│   ├── config/         # Environment variables & constants
│   ├── middleware/     # Auth, RBAC, request validation, error handler
│   ├── routes/         # Express router endpoints
│   ├── controllers/    # Request/response handlers
│   ├── services/       # Pure business logic & database transactions
│   ├── types/          # Domain models, enums, DTOs
│   ├── utils/          # Helpers (formatters, Excel parser, ID generators)
│   ├── app.ts          # Express application factory & middleware setup
│   └── server.ts       # Server listener & graceful shutdown
├── package.json
└── tsconfig.json
```

### API Response Format
All REST endpoints must return responses complying with the `ApiResponse<T>` envelope:
```typescript
// Success response
{
  "success": true,
  "message": "Leads distributed successfully",
  "data": { ... },
  "pagination": { "page": 1, "limit": 25, "total": 120, "totalPages": 5 } // optional
}

// Error response
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "DUPLICATE_LEAD",
    "details": [ ... ]
  }
}
```

### Error Handling & Validation
* Throw structured errors using `AppError(message, statusCode, errorCode)`.
* Validate all request bodies, query params, and route params using **Zod** schemas before reaching controllers.
* Never leak internal database stack traces in production responses.

---

## 4. Frontend Development Standards (`/frontend`)

### Architecture & UI Philosophy
* **App Router:** Use Next.js App Router (`src/app/`).
* **Server vs. Client Components:** Default to React Server Components (RSC) for data fetching and static markup. Use `"use client"` only where state, client hooks, or browser event listeners are required.
* **Design & Styling:**
  * Use **Tailwind CSS** with a consistent, premium color palette (avoid raw unstyled colors).
  * Use **Lucide React** for UI icons.
  * Implement clear visual states: **Loading**, **Empty**, **Error**, and **Success** for every data-fetching view.
  * For background colors and text colors use global.css tailwind utility classes.
  * Always use reusable componets and dont repeat code.
  * Make it less code in each component.
  * redux use only when necessary
  * Remeber the blue theme color is applied on project 
  * Build an responsive UI for mobile and desktop.
  * Always use tailwind css utility classes
* **API Communication:**
  * Centralize API calls in a typed client service using Axios (`src/lib/api.ts`).
  * Always handle API error responses gracefully with user-friendly toast/alert notifications.

---

## 5. Development Workflow & Verification Checklist

When executing tasks or creating features, agents must follow this verification cycle:

1. **Check Requirements:** Consult [PROJECT_REQ.md](file:///c:/Users/mayan/Desktop/test/CRM/PROJECT_REQ.md) before writing any code.
2. **Implement Backend First:** Build and test database models, services, and endpoints before building the UI screen.
3. **Verify Compilation:**
   * Backend check: Run `npm run build` in `/backend` (must exit with code 0).
   * Frontend check: Run `npm run build` in `/frontend` (must exit with code 0).
4. **Keep Git Repository Clean:**
   * Never commit `.env`, `node_modules`, `dist/`, or temporary test dumps.
   * Verify git status before concluding turns.

## 6. After Code Insertion Rules (CRITICAL)

After inserting any code in any file, you must: 

1. **Run Compilation Checks**
   - **Backend:** `npm run lint && npm run build` in `/backend`
   - **Frontend:** `npm run lint && npm run build` in `/frontend`
2. **Check Git Status**
   - Verify that no unexpected files have been added or modified.
   - Ensure no temporary files or dependencies are staged for commit.
3. **Keep Project Clean**
   - Never commit `.env` files, `node_modules`, `dist/`, or editor settings.
   - Verify that `.gitignore` is up-to-date and respected.
   