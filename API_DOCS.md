# CRM Enterprise API Reference & Developer Guide (GSD Manual)

> **API Base URL:** `http://localhost:5000/api` (or `/api` in production)  
> **Interactive Swagger / OpenAPI 3.0 Documentation:** `http://localhost:5000/api/docs`  
> **Architecture Standard:** Backend-Authoritative REST API, PostgreSQL + Prisma ORM, Strict RBAC

---

# 1. Quick-Start & GSD Workflow Cheatsheet

### Starting the Services
```bash
# 1. Start Backend Server
cd backend
npm run dev
# Server running at http://localhost:5000

# 2. Start Frontend App
cd frontend
npm run dev
# App running at http://localhost:3000
```

### Database & Seed Commands
```bash
# Push Prisma Schema to PostgreSQL
cd backend
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Inspect Database UI
npx prisma studio
```

---

# 2. Authentication & Security Contract

Every protected endpoint requires a verified JWT token passed via:
- **Authorization Header:** `Authorization: Bearer <jwt_token>`
- **HTTP-Only Cookie:** `token=<jwt_token>`

### User Roles & Permissions Matrix
| Role | Code | Scope & Capabilities |
| :--- | :--- | :--- |
| **System Admin** | `ADMIN` | Superuser authority; user management, workspace governance, unrestricted lead access, all distribution modes, audit logs, and system analytics (`/reports/dashboard-metrics/admin`). |
| **Team Leader** | `TEAM_LEADER` | Supervisory authority; unassigned pool management, lead distribution (Equal, Custom, Manual, Bulk), reassignments, recalls, Excel batch imports/exports, team performance KPIs. |
| **Sales Executive** | `SALES_EXECUTIVE` | Isolated to assigned leads only (`assignedToUserId = req.user.id`). Permitted lifecycle status transitions, interaction notes, follow-up scheduling, personal queue. |

### Standard Response Envelope

#### Success (200 / 201)
```json
{
  "success": true,
  "message": "Operation description",
  "data": {},
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

#### Error (400 / 401 / 403 / 404 / 409 / 500)
```json
{
  "success": false,
  "message": "Human-readable error explanation",
  "error": {
    "code": "VALIDATION_ERROR | UNAUTHORIZED | FORBIDDEN | RESOURCE_NOT_FOUND | CONFLICT",
    "details": {}
  }
}
```

---

# 3. Complete Endpoint Reference

## 3.1 System & Documentation
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System health check & database latency check |
| `GET` | `/api/docs` | Public | Interactive Swagger / OpenAPI 3.0 API Documentation UI |
| `GET` | `/api/docs/json` | Public | Raw OpenAPI 3.0 JSON specification schema |

---

## 3.2 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate user with `email` and `password`. Returns JWT and user payload. |
| `POST` | `/api/auth/register` | Public / Admin | Register new account (`ADMIN`, `TEAM_LEADER`, `SALES_EXECUTIVE`). |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile and active session state. |
| `POST` | `/api/auth/logout` | Authenticated | Invalidate session and clear HTTP-only auth cookies. |

---

## 3.3 Users & Team Management (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | `ADMIN`, `TEAM_LEADER` | List all staff members with pagination and role filter |
| `GET` | `/api/users/sales-executives` | `ADMIN`, `TEAM_LEADER` | List active sales executives with workload statistics |
| `POST` | `/api/users` | `ADMIN`, `TEAM_LEADER` | Create new staff user |
| `GET` | `/api/users/:id` | `ADMIN`, `TEAM_LEADER` | Get detailed user info, lead counts, and performance |
| `PATCH` | `/api/users/:id` | `ADMIN` | Update user status, role, or credentials |
| `DELETE` | `/api/users/:id` | `ADMIN` | Soft-delete user account |

---

## 3.4 Leads Directory (`/api/leads`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/leads` | Authenticated | Query leads directory with server-side pagination, search, status, and date filters. (Execs receive isolated data; Admins/TLs see all). |
| `GET` | `/api/leads/unassigned` | `ADMIN`, `TEAM_LEADER` | List unassigned intake lead pool ready for distribution |
| `POST` | `/api/leads` | `ADMIN`, `TEAM_LEADER` | Manually create a single new lead record |
| `GET` | `/api/leads/:id` | Authenticated | Get comprehensive lead details, notes, activities, and follow-ups |
| `PATCH` | `/api/leads/:id` | Authenticated | Update lead details (status, budget, notes, contacts) |
| `POST` | `/api/leads/:id/notes` | Authenticated | Append an interaction note to the lead timeline |
| `PATCH` | `/api/leads/bulk-status` | `ADMIN`, `TEAM_LEADER` | Bulk update status for multiple selected lead IDs |
| `DELETE` | `/api/leads/:id` | `ADMIN` | Soft-delete lead record |

---

## 3.5 Distribution & Reassignment (`/api/leads`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/leads/distribute` | `ADMIN`, `TEAM_LEADER` | Execute lead distribution transaction across executives (`EQUAL`, `CUSTOM`, `MANUAL`, `BULK`). |
| `POST` | `/api/leads/reassign` | `ADMIN`, `TEAM_LEADER` | Reassign active leads from one executive to another with audit history. |
| `POST` | `/api/leads/recall` | `ADMIN`, `TEAM_LEADER` | Recall active assigned leads back to the unassigned pool. |

---

## 3.6 Follow-ups & Task Queue (`/api/followups`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/followups` | Authenticated | Query follow-up schedule with filters (`dueToday`, `upcoming`, `overdue`) |
| `POST` | `/api/followups` | Authenticated | Schedule a new follow-up for a lead |
| `GET` | `/api/followups/:id` | Authenticated | Get follow-up details |
| `PATCH` | `/api/followups/:id` | Authenticated | Complete, reschedule, or cancel a follow-up |
| `DELETE` | `/api/followups/:id` | Authenticated | Delete a scheduled follow-up |

---

## 3.7 Excel Import & Staged Ingestion (`/api/imports`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/imports/preview` | `ADMIN`, `TEAM_LEADER` | Upload `.xlsx`/`.csv` file for pre-import validation and duplicate analysis |
| `POST` | `/api/imports/commit` | `ADMIN`, `TEAM_LEADER` | Execute transactional commit of staged import batch into PostgreSQL |
| `GET` | `/api/imports/history` | `ADMIN`, `TEAM_LEADER` | List historical import batches, totals, and integrity status |
| `GET` | `/api/imports/:batchId/errors`| `ADMIN`, `TEAM_LEADER` | Download error rows report for failed items in a batch |
| `GET` | `/api/imports/template` | `ADMIN`, `TEAM_LEADER` | Download official Excel lead ingestion template |

---

## 3.8 Data Export Engine (`/api/exports`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/exports/leads` | Authenticated | Export filtered leads to `.xlsx` or `.csv` (respects executive data isolation) |
| `GET` | `/api/exports/report` | `ADMIN`, `TEAM_LEADER` | Export comprehensive multi-tab analytics report |

---

## 3.9 Reports & Intelligence (`/api/reports`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/dashboard-metrics/admin` | `ADMIN` | **System-Wide Admin Metrics:** Organization user breakdown, system conversion, revenue ARR, SLA compliance, executive workloads. |
| `GET` | `/api/reports/dashboard-metrics/team-lead` | `TEAM_LEADER`, `ADMIN` | **Team Leader Metrics:** Unassigned pool volume, team conversion rate, live pipeline health, executive workload allocation, critical SLA breaches. |
| `GET` | `/api/reports/dashboard-metrics/sales-executive` | `SALES_EXECUTIVE` | **Sales Executive Metrics:** Personal assigned count, follow-ups due today, overdue alerts, conversion velocity. |
| `GET` | `/api/reports/leads` | `ADMIN`, `TEAM_LEADER` | Detailed lead lifecycle performance analytics |
| `GET` | `/api/reports/performance` | `ADMIN`, `TEAM_LEADER` | Executive throughput and conversion scorecards |

---

## 3.10 Notifications (`/api/notifications`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Authenticated | List user notifications with unread indicators |
| `GET` | `/api/notifications/unread-count`| Authenticated | Get current unread notification badge count |
| `PATCH` | `/api/notifications/:id/read` | Authenticated | Mark specific notification as read |
| `PATCH` | `/api/notifications/mark-all-read`| Authenticated | Mark all notifications as read |

---

## 3.11 Audit & Compliance (`/api/audit-logs`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/audit-logs` | `ADMIN`, `TEAM_LEADER` | Query append-only audit trail capturing actor, entity, action, previous/new state, and timestamp |

---

# 4. Error Codes Glossary

| Error Code | HTTP Status | Description |
| :--- | :---: | :--- |
| `UNAUTHORIZED` | `401` | Missing or invalid authentication token |
| `FORBIDDEN` | `403` | User does not possess the required role |
| `VALIDATION_ERROR` | `400` | Request body or query parameters failed Zod validation |
| `RESOURCE_NOT_FOUND`| `404` | Requested lead, user, or task was not found |
| `CONFLICT` | `409` | Duplicate record detected or concurrent mutation conflict |
| `EMPTY_FILE` | `400` | Uploaded Excel file buffer is empty |
| `INTERNAL_ERROR` | `500` | Server-side execution exception |
