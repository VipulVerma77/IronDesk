## Live Demo
Frontend: https://iron-desk-six.vercel.app/

## Screenshots
<img width="1878" height="870" alt="Desk1" src="https://github.com/user-attachments/assets/e867bc5c-2241-4eb4-b073-c28146bed997" />
<img width="1896" height="865" alt="Desk2" src="https://github.com/user-attachments/assets/9c48ac82-7d61-434a-8da8-107248ae8bcd" />
<img width="1900" height="892" alt="Desk3" src="https://github.com/user-attachments/assets/3ee0b2bd-7395-4df6-a63b-c194005c963a" />
<img width="1846" height="882" alt="Desk4" src="https://github.com/user-attachments/assets/b1bf2fb6-78b3-48ef-b5d4-e45c5eee2f2f" />
<img width="1886" height="885" alt="desk5" src="https://github.com/user-attachments/assets/85bd5547-a59f-4900-848e-5da0fbd5254a" />

# IronDesk

A multi-tenant Gym Management SaaS platform built with ASP.NET Core and React, designed to help gym owners manage members, subscriptions, payments, attendance, and daily operations through a centralized dashboard.

## Overview

IronDesk enables gym owners to create and manage their own gym workspace while maintaining complete tenant isolation. Each gym operates independently with its own members, plans, subscriptions, payments, and attendance records.

### Key Features

* Multi-tenant architecture with GymId-based tenant isolation
* JWT Authentication with Refresh Token Rotation
* Role-Based Authorization (Admin / Member)
* Membership Plan Management
* Subscription Lifecycle Management
* Payment Tracking
* Attendance Check-In / Check-Out
* Dashboard Analytics
* Soft Delete Support
* Background Subscription Processing
* Automated Testing
* CI/CD Pipeline

---

## Tech Stack

### Backend

* ASP.NET Core Web API
* Entity Framework Core
* SQL Server
* JWT Authentication
* BCrypt Password Hashing
* Background Services (Hosted Services)
* xUnit Testing
* Fluent Assertions
* GitHub Actions

### Frontend

* React
* React Router
* Redux Toolkit
* TanStack Query
* Axios
* React Hook Form
* Yup Validation
* Tailwind CSS
* Lucide React Icons

---

## Architecture

### Multi-Tenant Design

Each gym acts as an independent tenant.

```text
Gym
├── Members
├── Membership Plans
├── Subscriptions
├── Payments
└── Attendance Records
```

All business entities are scoped using GymId to ensure complete tenant isolation and prevent cross-tenant data access.

---

## Authentication & Security

### Authentication Flow

* JWT Access Tokens
* Refresh Token Rotation
* HttpOnly Secure Cookies
* BCrypt Password Hashing
* Role-Based Authorization
* Soft Delete Support

### Security Highlights

* Refresh token invalidation after rotation
* Password hashing using BCrypt
* Protected API endpoints
* Unauthorized access prevention
* Tenant-level data isolation

---

## Backend Features

### Authentication

* Register
* Login
* Logout
* Refresh Token
* Change Password
* Profile Management

### Gym Management

* Register Gym
* Update Gym Information
* Theme Configuration
* Gym Slug Support

### Member Management

* Create Member
* Search Members
* Pagination
* Soft Delete

### Membership Plans

* Create Plan
* Update Plan
* Delete Plan
* View Plans

### Subscriptions

* Public Subscription
* Admin Assignment
* Cancellation
* Status Tracking
* Pagination & Filtering

### Payments

* Mark Payment as Paid
* Payment History
* Payment Status Tracking

### Attendance

* Check-In
* Check-Out
* Today's Attendance
* Date Range Filtering

### Dashboard

Aggregated statistics including:

* Total Members
* Active Members
* Active Subscriptions
* Expiring Subscriptions
* Revenue Metrics
* Attendance Metrics

### Background Processing

Automated hosted service that updates subscription states:

```text
Scheduled → Active → Expired
```

Runs periodically to ensure subscription statuses remain accurate.

---

## Frontend Features

### Public Pages

* Landing Page
* Features Section
* How It Works
* Call-To-Action

### Admin Portal

* Dashboard
* Members Management
* Plans Management
* Subscription Management
* Payments Management
* Attendance Tracking
* Settings

### Member Portal

* Profile Management
* Active Subscription
* Remaining Days
* Attendance Overview

---

## State Management Strategy

### Redux Toolkit

Used only for:

* Authentication State
* User Session Information

### TanStack Query

Used for:

* Server State Management
* Data Fetching
* Caching
* Query Invalidation
* Background Refetching

---

## Testing

### Backend Test Coverage

* Authentication Tests
* Authorization Tests
* Member Tests
* Subscription Tests
* Attendance Tests
* Payment Tests
* Dashboard Tests

Current Status:

```text
150+ Automated Tests
0 Failing Tests
```

---

## CI/CD

GitHub Actions Pipeline

Automated workflow:

```text
Push
 ↓
Build
 ↓
Run Tests
 ↓
Validate
```

Ensures code quality and prevents broken builds.

---

## Project Structure

### Backend

```text
GymRat.API
GymRat.Application
GymRat.Domain
GymRat.Infrastructure
GymRat.Tests
```

### Frontend

```text
src
├── features
├── pages
├── components
├── services
├── hooks
├── routes
├── store
└── utils
```

---

## Future Enhancements

* Stripe Payment Integration
* Cloudinary Image Uploads
* Email Notifications
* Docker Support
* Redis Caching
* Activity Logs
* Monitoring & Observability
* Production Deployment

---

## Learning Outcomes

This project helped deepen understanding of:

* Multi-Tenant SaaS Architecture
* ASP.NET Core Web API Development
* JWT Authentication & Refresh Tokens
* Entity Framework Core
* Background Services
* CI/CD Pipelines
* Automated Testing
* React Application Architecture
* Server State Management
* Secure Application Design

---

## Author

Vipul Verma

Full Stack Developer

Built as a real-world SaaS application to explore scalable architecture, secure authentication, and modern full-stack development practices.
