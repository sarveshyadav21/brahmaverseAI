# Brahmaverse AI — CRM System

A full-stack Customer Relationship Management (CRM) system for prospective client lead intake and counselor enquiry management, built with **Node.js, Express, Prisma ORM, and PostgreSQL (Neon)**.

---

## 📁 Repository Structure

```text
.
├── Backend/                    # Express + Prisma REST API & Automated Tests
│   ├── prisma/                 # Database schema & seed scripts
│   ├── src/                    # Core backend application code
│   │   ├── config/             # DB & env configuration
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Auth, validation, rate limiting, error handling
│   │   ├── routes/             # REST API routes
│   │   ├── services/           # Business logic & atomic operations
│   │   ├── utils/              # Token, pagination, helpers
│   │   └── validators/         # Input validation schemas
│   ├── tests/                  # Jest integration & high-concurrency suites
│   ├── test-execution.log      # Complete audit report with 168 captured API calls
│   └── README.md               # Detailed backend documentation & API reference
├── Frontend/                   # Client application
├── .gitignore                  # Global git ignore (protects all .env & node_modules)
└── README.md                   # Project overview
```

---

## 🚀 Quick Start (Backend)

For complete backend documentation, database setup, environment variables, and API endpoints, see [Backend/README.md](Backend/README.md).

### 1. Install Dependencies
```powershell
cd Backend
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and provide your PostgreSQL connection string:
```powershell
cp .env.example .env
```

### 3. Setup Database & Seed
```powershell
npx prisma db push
npm run seed
```

### 4. Run the Dev Server
```powershell
npm run dev
```

### 5. Run the Automated Test Suite & Audit Reporter
```powershell
npm test
```
- **36/36 tests passing** across 3 suites (`auth`, `enquiry`, `claim.concurrency`).
- **20-way parallel race condition verified** (atomic lead claiming).
- Full audit report generated at `Backend/test-execution.log`.
