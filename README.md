# IronDesk 🏋️

A multi-tenant Gym Management SaaS platform built with ASP.NET Core and React. Gym owners can register their own gym, manage members, subscriptions, payments and attendance — all from a single dashboard, fully isolated from other gyms on the platform.

**Live Demo:** [https://iron-desk-six.vercel.app/](https://iron-desk-six.vercel.app/)
**API:** [https://irondesk-98q8.onrender.com/api](https://irondesk-98q8.onrender.com/api)

> Note: Backend is on Render's free tier and may take 30-50s to wake up on first request after inactivity.

---

## Overview

IronDesk lets gym owners register independently and get their own admin workspace. Each gym is fully isolated — members, plans, subscriptions, payments and attendance records never cross between tenants. Members can self-subscribe through a public gym page, and admins manage everything from a dedicated dashboard.

### Key Features

- Multi-tenant architecture — every entity scoped by `GymId`
- JWT authentication with refresh token rotation + HttpOnly cookie
- Role-based authorization (Admin / Member)
- Subscription state machine — Pending → Active / Scheduled → Expired
- Background job for automatic subscription state transitions
- Manual payment flow — mark paid triggers subscription activation
- Attendance check-in / check-out with multi-session support
- Public gym page with self-service subscription
- Single dashboard endpoint aggregating all key stats
- Soft delete on user accounts
- 150 automated tests, 0 failures
- CI/CD pipeline via GitHub Actions
- Fully deployed — frontend, backend and database, 100% free tier

---

## Tech Stack

### Backend

- ASP.NET Core 8 Web API
- Entity Framework Core
- MySQL (Pomelo.EntityFrameworkCore.MySql)
- JWT Authentication
- BCrypt password hashing
- `IHostedService` background job
- xUnit + Moq + FluentAssertions
- GitHub Actions CI/CD

### Frontend

- React 18 + Vite
- Redux Toolkit (auth state only)
- TanStack Query (all server data)
- React Hook Form + Yup
- Tailwind CSS
- Axios with interceptors
- Lucide React icons
- Framer Motion (landing/auth pages only)

### Deployment

- Frontend — Vercel
- Backend — Render (Docker)
- Database — Clever Cloud (MySQL)

---

## Architecture

### Multi-Tenant Design

```text
Gym (tenant)
├── Members
├── Membership Plans
├── Subscriptions
├── Payments
└── Attendance Records
```

Every query is scoped by `GymId`, enforced at the service layer using the `GymId` claim from the JWT — never trusted from client input.

### Subscription State Machine

```text
Public/Admin creates subscription → Pending
         ↓ (payment marked paid)
   StartDate = today?  →  Active
   StartDate in future →  Scheduled
         ↓ (background job, every 24h)
   Scheduled → Active (on start date)
   Active    → Expired (on end date)
```

---

## Authentication & Security

- JWT access token (15 min) + refresh token (7 days) with rotation
- Refresh token stored in HttpOnly, Secure, `SameSite=None` cookie (required for cross-domain deployment — frontend on Vercel, backend on Render)
- Access token kept in memory / sessionStorage on the frontend, never localStorage
- Old refresh token revoked on every rotation
- Soft delete blocks login without removing history
- Password and account changes revoke all active refresh tokens
- Axios interceptor silently refreshes expired access tokens and retries failed requests

---

## Backend Features

**Auth** — register (admin-only), login, logout, refresh, profile, change password

**Gym** — register gym + admin in one call, slug-based public page, theme, update, delete

**Member** — add member (auto-creates linked user account), list with pagination

**Membership Plans** — create, list (gym-scoped)

**Subscriptions** — public self-subscribe, admin assign, cancel, filter by status/date/search, pagination

**Payments** — mark paid (triggers subscription activation), list

**Attendance** — check-in, check-out, today's view, filter by member, filter by date range

**Dashboard** — single endpoint: member stats, revenue, attendance, expiring subscriptions, recent payments, new members

**Background Job** — runs every 24 hours, transitions Scheduled → Active and Active → Expired

---

## Frontend Features

**Public**
- Landing page
- Public gym page (`/gym/:slug`) — gym info, active member count, plans, self-subscribe form

**Admin** (`/admin`)
- Dashboard — real-time stats
- Members — list, search, pagination, add member
- Subscriptions — plans tab, assign tab, all subscriptions tab with filters, cancel
- Payments — list, mark paid
- Attendance — check-in/out, today's view, date range filter
- Settings — gym info, theme, change password

**Member** (`/member`)
- Profile
- Active subscription with days remaining
- Subscription history

---

## State Management Strategy

```text
Redux Toolkit    → auth state only (token, user)
TanStack Query   → everything else (members, subscriptions, payments,
                    attendance, dashboard) — caching, loading states,
                    pagination, invalidation on mutation
```

---

## Testing

```text
121 Unit Tests        — AuthService, GymService, UserService,
                         SubscriptionService, PaymentService,
                         AttendanceService
29  Integration Tests  — AuthController, GymController
                         (WebApplicationFactory + InMemory DB)
─────────────────────
150 Total — 0 Failures
```

Unit tests use EF Core InMemory with a fresh database per test, Moq for `IPasswordHasher` and `ITokenService`, and a shared `TestBase` + `SeedBuilder` for consistent test data.

---

## CI/CD

GitHub Actions runs on every push and pull request to `main`:

```text
Checkout → Setup .NET 8 → Restore → Build → Run all 150 tests
```

A failing test fails the pipeline before it ever reaches deployment.

---

## Project Structure

### Backend

```text
GymRat/
├── Controllers/
├── Services/
│   └── Interfaces/
├── DTOs/
├── Models/
├── Data/
├── Extensions/
├── BackgroundJobs/
└── Dockerfile

GymRat.Tests/
├── Unit/
├── Integration/
└── Helper/
```

### Frontend

```text
GymRatFrontend/src/
├── app/            # Redux store
├── components/      # Button, Input, Navbar, Sidebar, Layout, ProtectedRoute
├── constants/       # API endpoints
├── features/        # API calls + Redux slices, grouped by domain
├── hooks/           # useAuthRefresh
├── pages/           # One folder per page/feature
└── utils/           # axios instance with interceptors
```

---

## Known Limitations / What's Next

- Manual payment confirmation (Stripe integration planned, not built)
- No gym logo upload yet (Cloudinary planned)
- No Trainer/Staff roles yet — only Admin and Member
- No real-time notifications (SignalR planned)
- Render free tier cold starts — mitigated with sessionStorage + skip-refresh-if-token-exists, but not eliminated

---

## Author

**Vipul Verma**
Full Stack Developer

Built as a real-world multi-tenant SaaS application to practice production patterns — JWT security, background jobs, multi-tenancy, automated testing and CI/CD — end to end.

## Screenshots
<img width="1878" height="870" alt="Desk1" src="https://github.com/user-attachments/assets/e867bc5c-2241-4eb4-b073-c28146bed997" />
<img width="1896" height="865" alt="Desk2" src="https://github.com/user-attachments/assets/9c48ac82-7d61-434a-8da8-107248ae8bcd" />
<img width="1900" height="892" alt="Desk3" src="https://github.com/user-attachments/assets/3ee0b2bd-7395-4df6-a63b-c194005c963a" />
<img width="1846" height="882" alt="Desk4" src="https://github.com/user-attachments/assets/b1bf2fb6-78b3-48ef-b5d4-e45c5eee2f2f" />
<img width="1886" height="885" alt="desk5" src="https://github.com/user-attachments/assets/85bd5547-a59f-4900-848e-5da0fbd5254a" />
