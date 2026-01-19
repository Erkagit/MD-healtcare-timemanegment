# Clinic Time Management - MVP

Medical clinic appointment booking web application for Mongolia.

## Tech Stack

- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Phone OTP (Patient) / Email + Password (Admin)
- **Monorepo**: Turborepo

## Project Structure

```
clinic-timemanagement/
├── apps/
│   ├── web/          # Patient-facing website
│   ├── admin/        # Clinic admin dashboard
│   └── api/          # Backend REST API
├── packages/
│   ├── ui/           # Shared UI components
│   ├── types/        # Shared TypeScript types
│   └── config/       # Shared configs
├── package.json
├── turbo.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL database
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp apps/api/.env.example apps/api/.env
# Edit .env with your database URL

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Start development servers
npm run dev
```

## Apps

### Patient Web (apps/web) - Port 3000
- Home page with clinic info
- Browse doctors by specialization
- Book appointments online
- View appointment confirmation

### Admin Dashboard (apps/admin) - Port 3001
- Manage doctors and schedules
- View and manage appointments
- Update appointment status

### API Server (apps/api) - Port 4000
- REST API endpoints
- Business logic for bookings
- OTP verification
- Database operations

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/clinic_db"

# JWT
JWT_SECRET="your-secret-key"
JWT_ADMIN_SECRET="your-admin-secret-key"

# OTP (for production use real SMS service)
OTP_SERVICE="mock" # or "twilio", "messagebird"
```

## License

MIT
