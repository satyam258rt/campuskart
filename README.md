# CampusKart – Smart Inside-Campus Marketplace
**Buy, Sell & Rent Cycles, Calculators & Campus Essentials**

CampusKart is an enterprise-grade full-stack web application designed exclusively for university campuses. It allows verified inside-campus students and authorized vendors to buy, sell, and rent academic and transit gear (**Cycles**, **Calculators**, and **Other** campus essentials) with institutional email verification, calendar overlap collision prevention, and deposit escrow handling.

---

## 📑 Complete 26-Section Documentation
For the complete technical specifications, see [**`SRS_AND_ARCHITECTURE.md`**](file:///c:/Users/GAYATHRI/OneDrive/Desktop/campuskart/SRS_AND_ARCHITECTURE.md), covering:
1. Introduction
2. Product Overview
3. Scope
4. Stakeholders and Roles
5. Overall Description
6. Functional Requirements
7. Frontend Requirements
8. Backend Requirements
9. Database Requirements
10. Complete User Workflows (with Mermaid Sequence Diagrams)
11. API Requirements
12. Payment and Checkout
13. Rental and Return Lifecycle (with State Diagram)
14. Admin and Moderation
15. Non-Functional Requirements
16. Security
17. Validation and Error Handling
18. Notifications
19. Reports and Analytics
20. System Architecture
21. Use Cases
22. Data Flow
23. Testing (42/42 Tests Passing)
24. Deployment and Maintenance
25. Future Enhancements
26. Acceptance Criteria

---

## 🎯 Key Project Highlights

1. **Strict Inside-Campus Only Authentication**:
   - Only official university email domains are permitted: `@campus.edu`, `@student.edu`, `@college.edu`, `@university.edu`, `@campuskart.edu`.
   - External domains (e.g. `@gmail.com`, `@yahoo.com`) are strictly rejected on both frontend and backend.

2. **Clean Starting Marketplace (User-Populated)**:
   - The platform starts clean with **zero dummy products**.
   - Front page features three core student categories:
     - 🚲 **Cycles** (Bicycles, geared bikes, locks & accessories)
     - 🧮 **Calculators** (Casio fx-991, graphing calculators & exam-approved tools)
     - 📦 **Other** (Lab equipment, hostel desk lamps, study organizers)
   - Users insert their own products directly through the intuitive `/create-listing` UI form!

3. **Rental Overlap Collision Guard**:
   - Algorithmic date-overlap verification ensures zero double-booking collisions for rental cycles and calculators:
     $$\text{Overlap} \iff (\text{Existing.startDate} \le \text{Req.endDate}) \land (\text{Existing.endDate} \ge \text{Req.startDate})$$

4. **Zero-Config Database Fallback**:
   - If local MongoDB on port 27017 is not running, the backend automatically starts an embedded, pre-cached `MongoMemoryServer` with zero manual installation required.

---

## 🚀 1-Click Windows Launch Scripts

| Script | Purpose |
|---|---|
| **`start-all.bat`** | Starts both backend (`localhost:5000`) and frontend (`localhost:5173`) and opens your browser. |
| **`start-backend.bat`** | Starts Express API server on `http://localhost:5000`. |
| **`start-frontend.bat`** | Starts Vite development server on `http://localhost:5173`. |
| **`seed-data.bat`** | Reinitializes database with categories (Cycles, Calculators, Other) and campus accounts with 0 dummy products. |

---

## 👥 Default Inside-Campus Accounts

| Role | Email Address | Password | Permissions |
|---|---|---|---|
| **Student** | `student@campus.edu` | `Password123` | Buy items, rent gear, upload cycle/calc/other listings. |
| **Vendor** | `vendor@campus.edu` | `Password123` | Campus store inventory manager & rental fleet lessor. |
| **Admin** | `admin@campus.edu` | `AdminPassword123` | Listing moderation, dispute arbitration, platform audit. |

*(All accounts are also accessible via 1-click quick-login buttons on the login page!)*

---

## 🧪 Testing & Verification

- **Backend Automated Tests**: 42/42 passing across auth, resources, rental collision guard, checkout, and admin suites:
  ```bash
  cd backend
  npm test
  ```
- **Frontend Production Build**: Compiles cleanly with Vite:
  ```bash
  cd frontend
  npm run build
  ```
