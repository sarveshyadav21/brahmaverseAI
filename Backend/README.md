# CRM Backend REST API

A production-grade, secure CRM Backend REST API built with **Node.js**, **Express**, **Prisma ORM**, and **PostgreSQL (Neon)**.

---

## 🚀 Features

- **Public Lead Ingestion:** Public-facing form submission endpoint (`POST /api/enquiries`) for prospective student enquiries.
- **Counselor Claim System:** Atomic and idempotent enquiry claiming (`PATCH /api/enquiries/:id/claim`) preventing race conditions among multiple counselors.
- **Enquiry Filtering:**
  - `GET /api/enquiries/public`: Unclaimed leads pool (requires JWT auth).
  - `GET /api/enquiries/my`: Claimed leads assigned to the currently authenticated counselor.
- **Authentication & Authorization:** Secure registration and login issuing signed JSON Web Tokens (JWT).
- **Two-Layer Password Defense (Salting + Peppering):**
  - **Cryptographic Salt:** Explicit per-user salt generated via `bcrypt.genSalt(12)` to defeat rainbow-table attacks.
  - **Server Pepper:** High-entropy `PASSWORD_PEPPER` stored exclusively in the server environment—even in the event of a full database leak, hashes cannot be cracked offline without the secret server pepper.
- **Neon Cloud Postgres Integration:**
  - Connection pooling via `DATABASE_URL` (`-pooler.neon.tech`) for optimal connection scaling.
  - Direct connection via `DATABASE_URL_UNPOOLED` for schema migrations.
- **Production Hardening:**
  - Security headers via `Helmet`.
  - Configurable `CORS`.
  - Rate limiting on public and auth endpoints (`express-rate-limit`).
  - Strict input validation & sanitization (`express-validator`).
  - Timing-safe login comparison to prevent user enumeration.
  - Safe bounded pagination (`page`, `limit` capped at 100).
  - Comprehensive Jest & Supertest test suite.

---

## 📁 Project Structure

```text
├── .agents/                    # Neon skills and automation
├── .neon                       # Neon CLI project link
├── prisma/
│   ├── schema.prisma           # Prisma schema (Employee & Enquiry models)
│   └── seed.js                 # Seed script with demo counselors & enquiries
├── src/
│   ├── config/
│   │   ├── env.js              # Environment variable validation & startup assertion
│   │   └── prisma.js           # Prisma client singleton
│   ├── controllers/
│   │   ├── auth.controller.js  # Auth request/response handlers
│   │   └── enquiry.controller.js # Enquiry request/response handlers
│   ├── middleware/
│   │   ├── auth.js             # JWT Bearer token authentication guard
│   │   ├── errorHandler.js     # Centralized error handler
│   │   ├── notFound.js         # 404 handler
│   │   ├── rateLimiter.js      # Endpoint rate limiters
│   │   └── validate.js         # Validation error collector
│   ├── routes/
│   │   ├── auth.routes.js      # /api/auth routes
│   │   ├── enquiry.routes.js   # /api/enquiries routes
│   │   └── index.js            # Combined API router
│   ├── services/
│   │   ├── auth.service.js     # Auth business logic (salting, peppering, JWT)
│   │   └── enquiry.service.js  # Enquiry business logic (atomic claim, queries)
│   ├── utils/
│   │   ├── ApiError.js         # Custom HTTP error class
│   │   ├── asyncHandler.js     # Wrapper for async route handlers
│   │   ├── pagination.js       # Pagination helpers
│   │   └── token.js            # JWT signing and verification
│   ├── validators/
│   │   ├── auth.validators.js  # Register & Login input rules
│   │   └── enquiry.validators.js # Enquiry input rules
│   ├── app.js                  # Express application setup
│   └── server.js               # HTTP server entrypoint & graceful shutdown
├── tests/
│   ├── auth.test.js            # Register & login test suite
│   ├── enquiry.test.js         # Enquiry submission, listing, claim tests
│   └── helpers.js              # Test fixtures and database reset
├── .env.example                # Example environment variables
├── .env.local                  # Neon-generated credentials
├── .env                        # Active environment variables
├── jest.config.js              # Jest configuration
└── package.json                # Project dependencies and npm scripts
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v20/v22)
- **npm** or **pnpm**
- **Neon Cloud Account** (already linked to project `Brahmverse`)

### 2. Install Dependencies
```powershell
npm install
```

### 3. Setup Database Schema
Push the Prisma schema to your Neon database:
```powershell
npx prisma db push
```
*(Or generate a migration: `npx prisma migrate dev --name init`)*

Generate the Prisma Client:
```powershell
npx prisma generate
```

### 4. Seed Database (Optional but recommended)
Populate demo counselors and initial enquiries:
```powershell
npm run seed
```
Demo counselors seeded:
- **Email:** `priya@crm.com` | **Password:** `Password123!`
- **Email:** `rohan@crm.com` | **Password:** `Password123!`

### 5. Start Development Server
```powershell
npm run dev
```
The server will start at: `http://localhost:3000`  
Health check endpoint: `http://localhost:3000/health`

### 6. Run Automated Tests
```powershell
npm test
```

> [!WARNING]
> **Database Safety Notice:** The test suite runs `TRUNCATE "enquiries", "employees" RESTART IDENTITY CASCADE` to ensure deterministic tests. Always use a dedicated test database by setting `DATABASE_URL_TEST` in your `.env` when running tests against data you care about.
> 
> If `DATABASE_URL_TEST` is not provided, the test suite will refuse to run against the main database unless explicitly permitted with `ALLOW_TEST_ON_MAIN_DB=true`. When tests complete, `globalTeardown` automatically re-seeds the database back to its initial demo state.

---

## 📡 API Reference

### Health Check
- `GET /health` — Check server & Neon database connectivity.

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new counselor | No |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | No |

**Register Request Payload:**
```json
{
  "name": "Priya Sharma",
  "email": "priya@crm.com",
  "password": "StrongPassword123!"
}
```

**Login Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "employee": {
      "id": 1,
      "name": "Priya Sharma",
      "email": "priya@crm.com"
    }
  }
}
```

### Enquiries (`/api/enquiries`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/enquiries` | Submit public lead inquiry form | No |
| `GET` | `/api/enquiries/public` | List unclaimed public leads (paginated) | Yes (Bearer Token) |
| `GET` | `/api/enquiries/my` | List leads claimed by authenticated user | Yes (Bearer Token) |
| `PATCH` | `/api/enquiries/:id/claim` | Atomically claim an enquiry | Yes (Bearer Token) |

**Public Enquiry Submission Request:**
```json
{
  "name": "Aarav Patel",
  "email": "aarav.patel@example.com",
  "phone": "+91 98765 43210",
  "courseInterest": "Full Stack Web Development",
  "message": "Looking for the upcoming weekend batch."
}
```

**Pagination Query Parameters:**
- `page`: Page number (default: `1`)
- `limit`: Items per page (default: `10`, max: `100`)
- Example: `/api/enquiries/public?page=1&limit=20`

---

## 🔒 Security Architecture Highlights

1. **Two-Layer Password Defense (Salt + Pepper):**
   - **Salt:** Generated dynamically with `bcrypt.genSalt(12)` per employee. Embedded securely in the bcrypt hash string `$2b$12$...`.
   - **Pepper:** Appended to passwords server-side before hashing using `PASSWORD_PEPPER` loaded from server environment. Leaking the SQL table alone is useless to an attacker because they lack the server pepper.
2. **Race Condition Prevention in Lead Claiming:**
   - Single atomic conditional query: `WHERE id = :id AND claimedById IS NULL`.
   - Idempotent: Claiming an already self-owned enquiry returns `200 OK`. Attempting to claim an enquiry taken by another counselor returns `409 Conflict`.
3. **Information Disclosure Prevention:**
   - `passwordHash` is excluded from all Prisma `select` queries and never returned in API responses.
   - Timing-safe login prevents username enumeration attacks.
