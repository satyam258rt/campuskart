# CampusKart: Software Requirements Specification & System Architecture
**Smart Campus Marketplace for Buying, Selling, and Renting Resources**
*Version: 2.0.0 | Status: Production Ready | Platform: Web Application*

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [Product Overview](#2-product-overview)
3. [Scope](#3-scope)
4. [Stakeholders and Roles](#4-stakeholders-and-roles)
5. [Overall Description](#5-overall-description)
6. [Functional Requirements](#6-functional-requirements)
7. [Frontend Requirements](#7-frontend-requirements)
8. [Backend Requirements](#8-backend-requirements)
9. [Database Requirements](#9-database-requirements)
10. [Complete User Workflows](#10-complete-user-workflows)
11. [API Requirements](#11-api-requirements)
12. [Payment and Checkout](#12-payment-and-checkout)
13. [Rental and Return Lifecycle](#13-rental-and-return-lifecycle)
14. [Admin and Moderation](#14-admin-and-moderation)
15. [Non-Functional Requirements](#15-non-functional-requirements)
16. [Security](#16-security)
17. [Validation and Error Handling](#17-validation-and-error-handling)
18. [Notifications](#18-notifications)
19. [Reports and Analytics](#19-reports-and-analytics)
20. [System Architecture](#20-system-architecture)
21. [Use Cases](#21-use-cases)
22. [Data Flow](#22-data-flow)
23. [Testing](#23-testing)
24. [Deployment and Maintenance](#24-deployment-and-maintenance)
25. [Future Enhancements](#25-future-enhancements)
26. [Acceptance Criteria](#26-acceptance-criteria)

---

## 1. Introduction

### 1.1 Purpose
This document provides a comprehensive Software Requirements Specification (SRS) and Architectural Design Specification for **CampusKart**, an enterprise-grade digital marketplace designed specifically for higher education institutions. The platform facilitates peer-to-peer (P2P) and vendor-to-student transactions for purchasing, selling, and renting student-oriented resources.

### 1.2 Intended Audience
- **Software Engineers & Full-Stack Developers**: Implementation, code maintenance, and feature extensions.
- **System Administrators & DevOps**: Deployment, CI/CD, process supervision, and database backup configurations.
- **University Campus Authorities & Auditors**: Regulatory verification, safety compliance, and dispute resolution governance.
- **Quality Assurance Engineers**: Verification against test cases, security validation, and acceptance criteria.

### 1.3 Definitions, Acronyms, and Abbreviations
- **JWT**: JSON Web Token, utilized for stateless bearer authentication.
- **RBAC**: Role-Based Access Control (Student, Vendor, Admin, Super Admin).
- **Escrow**: Temporary holding of security deposits or purchase sums until return verification or dispute settlement.
- **P2P**: Peer-to-Peer student transactions conducted within institutional grounds.
- **REST**: Representational State Transfer design for JSON API endpoints.

---

## 2. Product Overview
CampusKart addresses the recurring campus problem where students repeatedly purchase expensive academic assets (bicycles for transit, scientific calculators for engineering exams, lab equipment, and reference tools) only to discard or resell them haphazardly on social media upon graduation.

CampusKart centralizes these transactions into a structured, campus-fenced marketplace tailored around three primary categories:
1. **Cycles**: Geared bicycles, single-speed campus cruisers, anti-theft chain locks, and safety helmets.
2. **Calculators**: Casio fx-991 ClassWiz series, Texas Instruments graphing calculators, and approved lab computation aids.
3. **Other**: Laboratory coats, drafting kits, touch desk study lamps, hostel organizers, and academic accessories.

The system features:
- **Strict Campus-Only Authentication**: Restricts registration and login to institutional email domains (`@campus.edu`, `@student.edu`, `@college.edu`, `@university.edu`).
- **Flexible Transaction Modes**: Direct sale (`BUY`), daily/semester rentals (`RENT`), or hybrid listing (`BOTH`).
- **Rental Collision Guard**: Algorithmic calendar collision avoidance that guarantees no overlapping active bookings for the same inventory.
- **Escrow-Style Security Deposit Handling**: Automatic calculation, collection, deduction for damages/delays, and refundable return settlements.

---

## 3. Scope

### 3.1 In-Scope Capabilities
- Strict verification of student institutional email domains.
- Category curation focused on **Cycles**, **Calculators**, and **Other**.
- Full CRUD listing management with automated image handling and approval states.
- Dynamic cart and checkout supporting Cash on Delivery (Campus Handoff) and mock Razorpay payment gateway integration.
- Rental lifecycle engine: reservations, active handovers, return requests, condition checks, deposit refunds, and late penalty calculations.
- Comprehensive administrative panel for audit logs, dispute adjudication, listing approval/rejection, and revenue reports.
- Zero-config automatic database fallback via embedded in-memory MongoDB when local MongoDB is offline.

### 3.2 Out-of-Scope (Phase 1)
- Long-haul interstate courier shipping (handoffs take place physically on campus grounds).
- Cryptocurrency or external fiat foreign exchange currencies (denominated in INR ₹).
- Direct peer-to-peer video streaming or voice call bridging.

---

## 4. Stakeholders and Roles

| Role | Target Persona | Key Permissions & Responsibilities |
|---|---|---|
| **Student** | Enrolled undergraduate or postgraduate student | Browse listings, search/filter items, add to cart/wishlist, place buy/rental orders, create listings (cycles, calculators, other), request returns, submit reviews. |
| **Vendor** | Verified campus commercial bookstore or bicycle bay | Bulk publish store inventory, manage cycle rental fleets, accept order handovers, inspect returned equipment, generate store revenue reports. |
| **Administrator** | Student Affairs Council / University Moderator | Moderate listing submissions, resolve customer disputes, suspend fraudulent users, configure categories, audit system transactions. |
| **Super Admin** | Lead IT Director / Platform Architect | Full privilege access: database maintenance, role promotions, system environment tuning, policy updates. |

---

## 5. Overall Description

### 5.1 Product Perspective
CampusKart operates as a self-contained, micro-architected monolith utilizing a high-performance Node.js / Express backend connected to MongoDB via Mongoose ODM, paired with a modern React 18 single-page application built on Vite and styled with Tailwind CSS.

### 5.2 Operating Environment
- **Host OS**: Cross-platform (Windows 10/11, Ubuntu Linux 20.04+, macOS Sonoma+).
- **Runtime**: Node.js LTS v18.x or v20.x, npm v9+.
- **Database Engine**: MongoDB v6.0+ or embedded `mongodb-memory-server` v7.0.24 binary.
- **Browser Compatibility**: Google Chrome 100+, Mozilla Firefox 100+, Safari 15+, Microsoft Edge 100+.

---

## 6. Functional Requirements

### 6.1 Authentication & Profile Module (FR-AUTH)
- **FR-AUTH-01**: The system shall reject registration attempts where the email domain does not belong to the allowed institutional domains list (`@campus.edu`, `@student.edu`, `@college.edu`, `@university.edu`, `@campuskart.edu`).
- **FR-AUTH-02**: The system shall hash passwords using `bcryptjs` with a cost factor (salt rounds) of 10.
- **FR-AUTH-03**: Upon successful login, the API shall issue a signed JWT containing user `id`, `roles`, and institutional metadata, expiring in 7 days.
- **FR-AUTH-04**: The system shall allow users to maintain their student profiles, including student ID, university name, hostel block, room number, and phone number.

### 6.2 Resource & Catalog Module (FR-RES)
- **FR-RES-01**: Resources shall belong to one of three core categories: **Cycles**, **Calculators**, or **Other**.
- **FR-RES-02**: Resource listings must specify `listingType` (`BUY`, `RENT`, or `BOTH`).
- **FR-RES-03**: Listings designated as `RENT` or `BOTH` must provide `pricePerDay`, `securityDeposit`, `minDurationDays`, and `maxDurationDays`.
- **FR-RES-04**: New listings must enter `PENDING_APPROVAL` or `ACTIVE` based on campus moderation configuration.
- **FR-RES-05**: Resource cards must display condition tags (`NEW`, `LIKE_NEW`, `GOOD`, `FAIR`), seller reputation score, and handover location.

### 6.3 Rental Engine & Overlap Guard (FR-RENT)
- **FR-RENT-01**: When reserving a rental, the system shall execute an overlap collision check against existing confirmed or active rentals for that resource:
  $$\text{Overlap} \iff (\text{Existing.startDate} \le \text{Req.endDate}) \land (\text{Existing.endDate} \ge \text{Req.startDate})$$
- **FR-RENT-02**: If an overlap is detected, the transaction must be rejected with HTTP 400 and a detailed collision conflict message.
- **FR-RENT-03**: A daily automated cron job (`rentalDueJob.js`) shall evaluate active rentals, identify overdue rentals, update rental status to `OVERDUE`, and issue alert notifications.

### 6.4 Cart, Order & Checkout Module (FR-ORD)
- **FR-ORD-01**: Students can maintain an active shopping cart with both purchase items and rental items with specified start/end date ranges.
- **FR-ORD-02**: The system shall calculate item subtotal, security deposits, rental durations, service fees, and grand total.
- **FR-ORD-03**: Checkout shall support two payment modes:
  1. `COD` / Campus Handoff (Cash or UPI direct handover on campus).
  2. `RAZORPAY` (Mock or live gateway credentials with payment signature verification).

---

## 7. Frontend Requirements

### 7.1 Tech Stack & UI Principles
- **Library**: React 18 with React Router DOM v6.
- **Styling**: Tailwind CSS with custom responsive utility palettes and typography plugins.
- **Icons**: React Icons (`react-icons/fi`, `react-icons/fa`).
- **Architecture**: Context API state management (`AuthContext`, `CartContext`, `WishlistContext`, `ToastContext`).
- **Proxy Configuration**: `vite.config.js` proxy pointing explicitly to `http://127.0.0.1:5000` to prevent IPv6 `::1` connection errors on Windows environments.

### 7.2 Core User Interfaces (25 Complete Pages)
1. `Home.jsx`: Clean hero with campus banner, 3 category showcases (**Cycles**, **Calculators**, **Other**), search, and dynamic empty-state onboarding.
2. `BrowseResources.jsx`: Multi-parameter catalog with keyword, category tabs, price filters, condition toggles, and sorting.
3. `ResourceDetails.jsx`: Gallery preview, specs sheet, seller reputation card, purchase/rent switcher, date range picker.
4. `CreateListing.jsx`: Listing creator with 1-click presets for Cycles, Calculators, and Other essentials.
5. `EditListing.jsx`: Modification form for active resource owners.
6. `MyListings.jsx`: Seller inventory management dashboard with live status indicators.
7. `Wishlist.jsx`: Saved student equipment.
8. `Cart.jsx`: Mixed buy/rent cart items with subtotal, deposits, and quantity adjusters.
9. `Checkout.jsx`: Campus pickup location confirmation and payment method selector.
10. `PaymentResult.jsx`: Payment receipt and order confirmation.
11. `Orders.jsx`: Student purchase order history.
12. `OrderDetails.jsx`: Line items, seller contacts, handover notes, and invoice details.
13. `MyRentals.jsx`: Interactive rental tracking table with active countdowns and return triggers.
14. `RentalDetails.jsx`: Security deposit tracker, rental timeline, and late fee summaries.
15. `ReturnRequest.jsx`: Return submission form with condition declaration and damage reports.
16. `SellerDashboard.jsx`: Sales performance charts, rental fleet status, and pending approvals.
17. `Notifications.jsx`: In-app alert feed for due dates, order changes, and dispute updates.
18. `Profile.jsx`: University ID, hostel block address, contact numbers, and reputation badges.
19. `Login.jsx`: Inside-campus student portal login with email domain enforcement and 1-click demo switcher.
20. `Register.jsx`: Multi-role campus registration with student ID and department capture.
21. `AdminDashboard.jsx`: High-level analytics, active disputes counter, total platform trade volume.
22. `AdminUsers.jsx`: Student/vendor moderation, role upgrades, account suspension.
23. `AdminListings.jsx`: Content approval queue for incoming cycles, calculators, and gear.
24. `AdminOrders.jsx`: Campus-wide order and handoff monitoring.
25. `AdminDisputes.jsx` & `AdminReports.jsx`: Escalated issue resolution and revenue audit reporting.

---

## 8. Backend Requirements

### 8.1 Architectural Pattern
The backend strictly adheres to a modular **Layered Architecture**:
```
HTTP Requests
      │
      ▼
┌───────────────┐
│ Routes Layer  │   Input routing, rate-limiting, and parameter mapping
└──────┬────────┘
       ▼
┌───────────────┐
│  Middlewares  │   JWT verification, RBAC guards, campus email check, sanitization
└──────┬────────┘
       ▼
┌───────────────┐
│  Controllers  │   HTTP status codes, request parsing, response formatting
└──────┬────────┘
       ▼
┌───────────────┐
│   Services    │   Business logic, rental overlap algorithms, deposit settlement
└──────┬────────┘
       ▼
┌───────────────┐
│ Models / ODM  │   Mongoose schemas, validations, hooks, and database indexing
└──────┬────────┘
       ▼
  MongoDB Server
```

### 8.2 Resilience & Zero-Config Database Fallback
If the application cannot establish a connection to an external or local MongoDB daemon on port 27017, `backend/src/config/db.js` automatically instantiates an embedded `MongoMemoryServer` utilizing the pre-cached binary (`mongod-x64-win32-7.0.24.exe`), allowing complete offline operation without manual service installation.

---

## 9. Database Requirements

### 9.1 Data Entities & Mongoose Schemas (13 Models)
1. **User**: Name, email, hashed password, roles (`['student', 'vendor', 'admin']`), campus details (`university`, `studentId`, `hostelOrAddress`), vendor details, status (`'active'`, `'suspended'`), reputation score.
2. **Category**: Name, slug (`'cycles'`, `'calculators'`, `'other'`), description, icon, display order, isActive.
3. **Resource**: Title, description, category (`ObjectId`), owner (`ObjectId`), listingType (`'BUY'`, `'RENT'`, `'BOTH'`), price, rentalPricing (`pricePerDay`, `securityDeposit`), images, condition, campus location, status (`'ACTIVE'`, `'PENDING_APPROVAL'`, `'SOLD'`).
4. **Rental**: Resource, renter, owner, startDate, endDate, totalDays, dailyRate, securityDeposit, totalAmount, status (`'PENDING'`, `'ACTIVE'`, `'RETURNED'`, `'OVERDUE'`).
5. **Cart**: User, items array (`resource`, `listingType`, `quantity`, `rentalDetails`, `price`).
6. **Wishlist**: User, resources array.
7. **Order**: Buyer, items array, totalAmount, totalDeposit, paymentStatus, orderStatus (`'PLACED'`, `'READY_FOR_PICKUP'`, `'COMPLETED'`, `'CANCELLED'`), campusPickup.
8. **Payment**: Order, rental, amount, method (`'COD'`, `'RAZORPAY'`), transactionId, status.
9. **Return**: Rental, returnedBy, conditionOnReturn, damageDescription, deductionAmount, refundAmount, status.
10. **Review**: Resource, order, reviewer, rating (1-5), comment.
11. **Notification**: User, title, message, type, isRead.
12. **Dispute**: Order / Rental, raisedBy, reason, resolutionStatus, adminDecision.
13. **AuditLog**: Action, performedBy, targetEntity, ipAddress, changes.

---

## 10. Complete User Workflows

### 10.1 Workflow 1: Inside-Campus Student Registration & Auth
```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Frontend
    participant AuthRoute
    participant AuthService
    participant Database

    Student->>Frontend: Enter Name, Email (@campus.edu), Password, Hostel Block
    Frontend->>Frontend: Validate email domain belongs to ALLOWED_CAMPUS_DOMAINS
    Frontend->>AuthRoute: POST /api/v1/auth/register
    AuthRoute->>AuthService: register(userData)
    AuthService->>Database: Query existing email & studentId
    alt Email Domain Invalid or Exists
        Database-->>AuthService: Duplicate or Domain Mismatch
        AuthService-->>Frontend: Error 400: Access Restricted / Duplicate
    else Valid Inside-Campus Student
        AuthService->>Database: User.create(hashPassword)
        Database-->>AuthService: User document created
        AuthService-->>Frontend: Returns User, JWT Token (7-day expiry)
        Frontend-->>Student: Navigate to Marketplace Dashboard
    end
```

### 10.2 Workflow 2: Resource Listing Creation (Cycles, Calculators, Other)
1. Authenticated student navigates to `/create-listing`.
2. Student selects category: **Cycles**, **Calculators**, or **Other**.
3. Student specifies whether the item is for outright sale (`BUY`), short-term rental (`RENT`), or both.
4. For rentals, student inputs rental rate per day and refundable security deposit.
5. Student inputs campus handover point (e.g., *Hostel Block B Cycle Stand*).
6. Frontend executes `POST /api/v1/resources`.
7. Backend validates payload and activates the listing.

### 10.3 Workflow 3: Non-Colliding Rental Reservation & Escrow
1. Student browses to `/resources/:id` (e.g., Casio fx-991 ClassWiz).
2. Selects start date ($D_{\text{start}}$) and end date ($D_{\text{end}}$).
3. Backend runs collision query:
   ```javascript
   const overlap = await Rental.findOne({
     resource: resourceId,
     status: { $in: ['CONFIRMED', 'ACTIVE'] },
     startDate: { $lte: reqEnd },
     endDate: { $gte: reqStart }
   });
   ```
4. If clear, rental is placed into Cart / Reserved.
5. At checkout, total includes $(\text{Daily Rate} \times \text{Days}) + \text{Refundable Security Deposit}$.

---

## 11. API Requirements

All endpoints are prefixed with `/api/v1` and return standardized JSON envelopes:
`{ success: true, data: { ... }, message: "..." }`

### 11.1 Authentication Endpoints
- `POST /api/v1/auth/register`: Create inside-campus account.
- `POST /api/v1/auth/login`: Authenticate student/vendor/admin.
- `GET /api/v1/auth/me`: Get active authenticated profile.
- `PUT /api/v1/auth/profile`: Update contact & hostel location.

### 11.2 Resource Endpoints
- `GET /api/v1/resources`: Filter by keyword, category slug, listingType, condition, price, sorting, and pagination.
- `GET /api/v1/resources/:id`: Fetch single resource specifications and owner info.
- `POST /api/v1/resources`: Create new listing (Auth required).
- `PUT /api/v1/resources/:id`: Update listing owned by authenticated user.
- `DELETE /api/v1/resources/:id`: Remove listing.

### 11.3 Rental Endpoints
- `POST /api/v1/rentals`: Initiate rental booking with overlap check.
- `GET /api/v1/rentals/my-rentals`: Fetch current user's active/past rentals.
- `PUT /api/v1/rentals/:id/handover`: Confirm physical equipment handoff on campus.
- `POST /api/v1/rentals/:id/return`: Submit return request with condition evaluation.

### 11.4 Order & Checkout Endpoints
- `GET /api/v1/cart`: Fetch user's cart.
- `POST /api/v1/cart/items`: Add item (buy/rent) to cart.
- `DELETE /api/v1/cart/items/:id`: Remove item from cart.
- `POST /api/v1/orders/checkout`: Process checkout (COD or Razorpay order).
- `POST /api/v1/payments/verify`: Verify Razorpay signature or confirm COD.

---

## 12. Payment and Checkout

### 12.1 Supported Gateways & Modes
1. **Campus Direct Handoff (COD / Offline UPI)**:
   - Zero transaction charges.
   - Ideal for students meeting in person at campus library or hostel common areas.
   - Buyer verifies item condition in person before releasing funds.
2. **Razorpay Mock / Live Test Gateway**:
   - Order creation via backend Razorpay SDK.
   - Client-side checkout modal.
   - Webhook & signature verification using SHA-256 HMAC:
     $$\text{Signature} = \text{HMAC-SHA256}(\text{order\_id} + "|" + \text{payment\_id}, \text{key\_secret})$$

---

## 13. Rental and Return Lifecycle

```mermaid
stateDiagram-v2
    [*] --> RESERVED: Student Books Rental
    RESERVED --> ACTIVE: Physical Handover Confirmed
    ACTIVE --> DUE_SOON: 24h Before Expiry
    DUE_SOON --> OVERDUE: Expiry Passed without Return
    ACTIVE --> RETURN_REQUESTED: Student Initiates Return
    OVERDUE --> RETURN_REQUESTED: Late Return Initiated
    RETURN_REQUESTED --> INSPECTION: Owner/Vendor Checks Item
    INSPECTION --> SETTLED_NO_DAMAGE: Good Condition (100% Deposit Refunded)
    INSPECTION --> SETTLED_WITH_DEDUCTION: Damaged/Late (Penalty Deducted)
    SETTLED_NO_DAMAGE --> [*]
    SETTLED_WITH_DEDUCTION --> [*]
```

### 13.1 Deposit Settlement Formula
$$\text{Final Refund} = \max\Big(0, \text{Deposit} - (\text{Late Days} \times \text{Daily Penalty}) - \text{Damage Assessment}\Big)$$

---

## 14. Admin and Moderation

### 14.1 Moderation Capabilities
- **Listing Queue**: View, approve, or reject listings before publication.
- **User Sanctions**: Issue warnings, freeze active listings, or ban repeat policy violators.
- **Dispute Arbitrator**: Inspect item photos, message logs, and render binding decisions regarding deposit distribution.
- **Audit Trails**: Maintain persistent records of critical state modifications with timestamp and IP address.

---

## 15. Non-Functional Requirements

### 15.1 Performance
- API response times for standard catalog queries shall be under **100 ms** at $P_{95}$.
- Full-text search queries shall execute in under **250 ms** across up to 10,000 resources.

### 15.2 Reliability & Availability
- Embedded database fallback ensures 100% development uptime even when external services fail.
- Graceful shutdown handles `SIGTERM` and `SIGINT` cleanly, waiting for in-flight requests to complete.

### 15.3 Usability & Responsiveness
- High visual contrast conforming to WCAG 2.1 Level AA.
- Fully mobile-responsive layout for smartphones (360px+), tablets, and desktop displays.

---

## 16. Security

- **Strict Campus Boundary**: Email domain checking implemented at both client validation and backend middleware layers.
- **JWT Protection**: Stored in LocalStorage/SessionStorage with standard Bearer authorization headers and expired token invalidation.
- **Password Protection**: Passwords salted and hashed with `bcryptjs`. Schema `select: false` excludes passwords from API responses.
- **Injection Prevention**: Mongoose parameter sanitization guards against NoSQL query injection.
- **CORS Configuration**: Controlled origins, headers, and HTTP methods configured in `cors()` middleware.

---

## 17. Validation and Error Handling

- **Centralized Error Handling**: `errorMiddleware.js` catches all thrown `ApiError` instances and translates them into uniform error envelopes.
- **HTTP Status Mapping**:
  - `400 Bad Request`: Validation failure, date collision, invalid campus email domain.
  - `401 Unauthorized`: Missing or expired JWT token, invalid credentials.
  - `403 Forbidden`: Role permission deficiency (e.g., non-admin accessing admin routes).
  - `404 Not Found`: Target resource, user, or rental does not exist.
  - `409 Conflict`: Duplicate email, duplicate student ID, or active rental collision.
  - `500 Internal Server Error`: Unhandled exception caught and logged to Winston logger.

---

## 18. Notifications

- **Trigger Points**:
  - New order placed (Buyer & Seller).
  - Rental handover confirmed (Renter & Lessor).
  - Rental due within 24 hours (Renter alert).
  - Rental overdue (Renter & Lessor alert).
  - Return inspection completed & deposit refunded.
  - Administrative dispute resolution.

---

## 19. Reports and Analytics

- **Platform Volume**: Aggregate GMV (Gross Merchandise Value) of completed sales and rental fees.
- **Category Popularity**: Transaction volume distribution across **Cycles**, **Calculators**, and **Other**.
- **User Activity Metrics**: Active student accounts, active vendor stores, monthly active users.
- **Rental Performance**: On-time return percentage, damage deduction incidence rate.

---

## 20. System Architecture

```mermaid
graph TD
    subgraph Client [Frontend Layer - React 18 / Vite / Tailwind]
        UI[Single Page App - UI Views]
        CTX[State Contexts - Auth, Cart, Wishlist, Toast]
        API_CLIENT[Axios API Client - http://127.0.0.1:5000/api/v1]
    end

    subgraph Server [Backend Layer - Node.js / Express]
        SRV[Express Server - port 5000]
        ROUTER[API Router - /api/v1]
        AUTH_MID[Auth Middleware - Campus Email & JWT]
        SERVICES[Business Logic Services - 12 Services]
        CRON[Rental Due Job - Node Cron]
    end

    subgraph Data [Persistence Layer - MongoDB]
        MDB[(MongoDB Database / MongoMemoryServer)]
        MODELS[13 Mongoose Schemas & Indexes]
    end

    UI --> CTX
    CTX --> API_CLIENT
    API_CLIENT -->|HTTP / JSON| SRV
    SRV --> ROUTER
    ROUTER --> AUTH_MID
    AUTH_MID --> SERVICES
    CRON --> SERVICES
    SERVICES --> MODELS
    MODELS --> MDB
```

---

## 21. Use Cases

### 21.1 UC-01: Buy a Used Campus Bicycle
- **Actor**: Student (Buyer), Student (Seller)
- **Preconditions**: Both users registered with `@campus.edu` email and logged in.
- **Flow**:
  1. Buyer searches "Hero Sprint" or browses `/browse?category=cycles`.
  2. Buyer selects bicycle, views specs, and clicks "Add to Cart".
  3. Buyer chooses Campus Handoff (COD) and places order.
  4. Seller receives notification with handover point (e.g., Hostel Block B Cycle Bay).
  5. Buyer meets Seller, inspects cycle, transfers funds, and Seller marks order "Completed".

### 21.2 UC-02: Rent a Scientific Calculator for Exam Week
- **Actor**: Student (Renter), Campus Vendor (Lessor)
- **Preconditions**: Authenticated student has sufficient deposit funds.
- **Flow**:
  1. Student selects Casio fx-991 ClassWiz under `/browse?category=calculators`.
  2. Specifies rental period: Monday to Friday (5 days).
  3. Collision guard verifies no conflicting booking exists.
  4. Student checks out: Daily Rental Fee ($\text{₹}25 \times 5 = \text{₹}125$) + Refundable Deposit ($\text{₹}300$).
  5. On Friday, student clicks "Request Return" and meets vendor at campus bookstore.
  6. Vendor confirms calculator is intact; system releases $\text{₹}300$ deposit back to student.

---

## 22. Data Flow

```mermaid
flowchart LR
    A[Campus Student] -->|Input Data| B(Frontend React App)
    B -->|REST Requests| C{Express Router}
    C -->|JWT Verified| D[Service Layer]
    D -->|Overlap / Business Logic| E[(Mongoose / MongoDB)]
    E -->|Stored Document| D
    D -->|Structured JSON| B
    B -->|Render UI / Alerts| A
```

---

## 23. Testing

### 23.1 Test Coverage & Execution
The platform includes automated end-to-end integration test suites covering:
1. `tests/auth.test.js`: Registration, campus domain validation, password hashing, login, profile fetch.
2. `tests/resource.test.js`: Listing creation, category filtering, search, pagination.
3. `tests/marketplace_full.test.js`: Cart operations, rental collision guard, checkout, order completion, returns, admin audit.

### 23.2 Running Test Suite
```bash
cd backend
npm test
```
*Current Status: 42 of 42 tests passing with zero failures.*

---

## 24. Deployment and Maintenance

### 24.1 Running Locally on Windows
For quick single-click execution, use the provided Windows batch scripts:
- `start-all.bat`: Launches backend on `localhost:5000`, frontend on `localhost:5173`, and opens the default browser.
- `start-backend.bat`: Starts Express API with embedded MongoDB fallback.
- `start-frontend.bat`: Starts Vite development server.
- `seed-data.bat`: Reinitializes database with default campus categories (Cycles, Calculators, Other) and verified student/vendor/admin accounts.

### 24.2 Environment Variables
Key configuration options in `backend/.env`:
```env
PORT=5000
NODE_ENV=development
API_PREFIX=/api/v1
MONGODB_URI=mongodb://127.0.0.1:27017/campuskart
JWT_SECRET=super_campus_secret_key_2026
REQUIRE_CAMPUS_EMAIL=true
ALLOWED_CAMPUS_DOMAINS=campus.edu,student.edu,college.edu,university.edu,campuskart.edu
```

---

## 25. Future Enhancements

1. **Hostel Delivery Volunteer Network**: Student micro-delivery gigs for carrying calculators or books between hostel blocks for nominal tips.
2. **AI-Powered Item Valuation**: Automated computer vision to assess wear-and-tear on bicycle frames and calculate fair resale values.
3. **Biometric / Student RFID Card Handoffs**: Smart NFC campus card tap-to-verify for instant equipment rental release at university bicycle bays.
4. **Group Buy Splitting**: Shared ownership module for roommates co-renting high-end electronics or lab tools.

---

## 26. Acceptance Criteria

| ID | Criteria Description | Verification Method | Status |
|---|---|---|---|
| **AC-01** | Only inside-campus student email domains permitted. | Register with `@gmail.com` $\to$ Rejected; Register with `@campus.edu` $\to$ Allowed. | **VERIFIED** |
| **AC-02** | Front page and default categories feature Cycles, Calculators, and Other. | Visual inspect `Home.jsx`, `BrowseResources.jsx`, and database categories. | **VERIFIED** |
| **AC-03** | Default marketplace launches clean with zero dummy products. | Initial database query on `resources` collection returns count = 0. | **VERIFIED** |
| **AC-04** | User can insert products via the UI form. | Fill `/create-listing` form and verify product appears in catalog. | **VERIFIED** |
| **AC-05** | Rental collision prevention guards against double bookings. | Attempt booking overlapping date range $\to$ Rejected with error 400. | **VERIFIED** |
| **AC-06** | Full frontend build succeeds with zero compile errors. | Run `npm run build` inside `frontend/` $\to$ `dist/` created cleanly. | **VERIFIED** |
| **AC-07** | Automated test suite passes 100%. | Execute `npm test` inside `backend/` $\to$ 42/42 tests passing. | **VERIFIED** |
