# 🏥 Clinic Time Management - Architecture Documentation

## Complete MVP Medical Clinic Appointment Booking System

---

## 📁 1. Folder Structure

```
clinic-timemanagement/
├── apps/
│   ├── web/                          # Patient-facing website (Next.js)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── layout.tsx        # Root layout with header/footer
│   │   │   │   ├── page.tsx          # Home page
│   │   │   │   ├── globals.css       # Global styles
│   │   │   │   ├── doctors/
│   │   │   │   │   └── page.tsx      # Doctors listing
│   │   │   │   └── book/
│   │   │   │       ├── page.tsx      # Booking wizard
│   │   │   │       └── confirmation/
│   │   │   │           └── page.tsx  # Booking confirmation
│   │   │   └── lib/
│   │   │       └── api.ts            # API client
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   └── tsconfig.json
│   │
│   ├── admin/                        # Admin dashboard (Next.js)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── layout.tsx        # Root layout
│   │   │   │   ├── page.tsx          # Redirect handler
│   │   │   │   ├── globals.css
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx      # Admin login
│   │   │   │   └── dashboard/
│   │   │   │       ├── layout.tsx    # Dashboard layout with sidebar
│   │   │   │       ├── page.tsx      # Dashboard stats
│   │   │   │       ├── doctors/
│   │   │   │       │   ├── page.tsx  # Doctors list
│   │   │   │       │   ├── new/page.tsx
│   │   │   │       │   └── [id]/
│   │   │   │       │       ├── page.tsx       # Edit doctor
│   │   │   │       │       └── schedule/page.tsx
│   │   │   │       └── appointments/
│   │   │   │           └── page.tsx  # Appointments management
│   │   │   └── lib/
│   │   │       ├── api.ts            # Admin API client
│   │   │       └── auth.tsx          # Auth context
│   │   └── package.json
│   │
│   └── api/                          # Backend REST API (Express)
│       ├── src/
│       │   ├── index.ts              # Server entry point
│       │   ├── lib/
│       │   │   └── prisma.ts         # Prisma client instance
│       │   ├── middleware/
│       │   │   ├── auth.ts           # JWT auth middleware
│       │   │   └── errorHandler.ts   # Error handling
│       │   └── routes/
│       │       ├── auth.ts           # OTP & admin login
│       │       ├── doctors.ts        # Public doctor APIs
│       │       ├── appointments.ts   # Booking APIs
│       │       ├── admin.ts          # Admin management
│       │       └── schedules.ts      # Schedule management
│       ├── prisma/
│       │   ├── schema.prisma         # Database schema
│       │   └── seed.ts               # Seed data
│       ├── package.json
│       └── .env.example
│
├── packages/
│   ├── types/                        # Shared TypeScript types
│   │   └── src/index.ts
│   ├── ui/                           # Shared UI components
│   │   └── src/index.tsx
│   └── config/                       # Shared configs
│       ├── tailwind.config.js
│       └── eslint-base.js
│
├── package.json                      # Root workspace config
├── turbo.json                        # Turborepo config
├── tsconfig.json                     # Base TypeScript config
└── README.md
```

---

## 📊 2. Prisma Schema (Database Models)

```prisma
// Patient Model
model Patient {
  id           String        @id @default(cuid())
  name         String
  phone        String        @unique
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  appointments Appointment[]
}

// Admin Model
model Admin {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt hashed
  name      String
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
}

// Doctor Model
model Doctor {
  id             String        @id @default(cuid())
  name           String
  specialization String
  bio            String?
  imageUrl       String?
  isActive       Boolean       @default(true)
  schedules      Schedule[]
  appointments   Appointment[]
}

// Schedule Model (Working Hours)
model Schedule {
  id           String    @id @default(cuid())
  doctorId     String
  dayOfWeek    DayOfWeek // MONDAY, TUESDAY, etc.
  startTime    String    // "09:00"
  endTime      String    // "17:00"
  slotDuration Int       @default(30) // minutes
  isActive     Boolean   @default(true)
  doctor       Doctor    @relation(...)
  
  @@unique([doctorId, dayOfWeek])
}

// Appointment Model
model Appointment {
  id        String            @id @default(cuid())
  patientId String
  doctorId  String
  date      DateTime          @db.Date
  time      String            // "10:00"
  status    AppointmentStatus @default(PENDING)
  notes     String?
  patient   Patient           @relation(...)
  doctor    Doctor            @relation(...)
  
  @@unique([doctorId, date, time]) // Prevent double booking
}

// OTP Model
model OTP {
  id        String   @id @default(cuid())
  phone     String
  code      String   // 6-digit code
  expiresAt DateTime
  verified  Boolean  @default(false)
}
```

---

## 🔌 3. API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/otp/send` | Send OTP to phone | - |
| POST | `/api/auth/otp/verify` | Verify OTP & get token | - |
| POST | `/api/auth/admin/login` | Admin login | - |

**Examples:**

```bash
# Send OTP
POST /api/auth/otp/send
{
  "phone": "99001234"
}
# Response: { success: true, message: "OTP код илгээгдлээ", code: "123456" }

# Admin Login
POST /api/auth/admin/login
{
  "email": "admin@clinic.mn",
  "password": "admin123"
}
# Response: { success: true, token: "jwt...", user: {...} }
```

### Public APIs (Patient Web)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctors` | List active doctors |
| GET | `/api/doctors/specializations` | List specializations |
| GET | `/api/doctors/:id` | Get doctor details |
| GET | `/api/doctors/:id/slots?date=YYYY-MM-DD` | Get available slots |
| POST | `/api/appointments` | Create appointment |
| GET | `/api/appointments/:id` | Get appointment details |

**Examples:**

```bash
# Get available slots
GET /api/doctors/abc123/slots?date=2026-01-20
# Response: { success: true, data: { date: "2026-01-20", slots: [
#   { time: "09:00", available: true },
#   { time: "09:30", available: false },
#   ...
# ]}}

# Create appointment
POST /api/appointments
{
  "doctorId": "abc123",
  "date": "2026-01-20",
  "time": "10:00",
  "patientName": "Бат",
  "patientPhone": "99001234",
  "notes": "Толгой өвдөж байна"
}
```

### Admin APIs (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/doctors` | List all doctors |
| POST | `/api/admin/doctors` | Create doctor |
| PUT | `/api/admin/doctors/:id` | Update doctor |
| DELETE | `/api/admin/doctors/:id` | Deactivate doctor |
| GET | `/api/schedules/:doctorId` | Get doctor schedules |
| POST | `/api/schedules` | Save schedule |
| POST | `/api/schedules/bulk` | Bulk save schedules |
| GET | `/api/appointments` | List appointments (filter) |
| PATCH | `/api/appointments/:id/status` | Update status |

---

## 📱 4. Booking Flow (Patient)

```
┌─────────────────────────────────────────────────────────────┐
│                    PATIENT BOOKING FLOW                      │
└─────────────────────────────────────────────────────────────┘

1. BROWSE DOCTORS
   └── Visit /doctors
   └── Filter by specialization (optional)
   └── Click "Цаг авах" on doctor card
           │
           ▼
2. SELECT DATE
   └── /book?doctorId=xxx
   └── See next 14 days
   └── Click on desired date
   └── API: GET /api/doctors/:id/slots?date=YYYY-MM-DD
           │
           ▼
3. SELECT TIME SLOT
   └── View available slots (green = available, gray = booked)
   └── Click on available time
           │
           ▼
4. ENTER PATIENT INFO
   └── Name (required)
   └── Phone number (required, 8 digits)
   └── Notes (optional)
           │
           ▼
5. CONFIRM BOOKING
   └── Review all details
   └── Click "Захиалга баталгаажуулах"
   └── API: POST /api/appointments
           │
           ▼
6. CONFIRMATION PAGE
   └── /book/confirmation?id=xxx
   └── Show booking details
   └── Important notes (arrive 10 min early, bring ID)
   └── Options: Go home, Book another
```

---

## 👨‍💼 5. Admin Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                     ADMIN WORKFLOW                           │
└─────────────────────────────────────────────────────────────┘

LOGIN (/login)
├── Email: admin@clinic.mn
├── Password: admin123
└── Redirects to /dashboard

DASHBOARD (/dashboard)
├── Stats: Total doctors, patients, today's appointments
├── Recent appointments list
└── Quick navigation

DOCTOR MANAGEMENT (/dashboard/doctors)
├── View all doctors (active/inactive)
├── Create new doctor
│   └── Name, Specialization, Bio
├── Edit doctor
│   └── Update info, toggle active status
└── Set schedule (/dashboard/doctors/:id/schedule)
    ├── Enable/disable working days
    ├── Set start/end time per day
    └── Set consultation duration (15-60 min)

APPOINTMENTS (/dashboard/appointments)
├── Filter by: Date, Doctor, Status
├── View patient details
└── Update status:
    ├── PENDING → CONFIRMED (accepted)
    ├── CONFIRMED → COMPLETED (done)
    └── Any → CANCELLED (cancelled)
```

---

## 📋 6. MVP vs Phase 2 Features

### ✅ MVP (Current Implementation)

| Feature | Status |
|---------|--------|
| Patient booking (no auth) | ✅ |
| Doctor listing & filtering | ✅ |
| Time slot availability | ✅ |
| Double-booking prevention | ✅ |
| Admin login (email/password) | ✅ |
| Doctor CRUD | ✅ |
| Schedule management | ✅ |
| Appointment status management | ✅ |
| Dashboard statistics | ✅ |
| Responsive design | ✅ |
| Mongolian language UI | ✅ |

### 🔜 Phase 2 Features

| Feature | Priority |
|---------|----------|
| Real SMS OTP (Twilio/MessageBird) | High |
| Patient authentication (view history) | High |
| Email notifications | High |
| Doctor availability exceptions (holidays) | Medium |
| Appointment reminders (SMS) | Medium |
| Payment integration | Medium |
| Multi-branch support | Low |
| EMR integration | Low |
| Video consultations | Low |
| Mobile app | Low |

---

## ⚠️ 7. Common Pitfalls & Solutions

### 1. Double Booking Prevention

**Problem:** Two patients booking same slot simultaneously.

**Solution:**
```prisma
// Database level constraint
@@unique([doctorId, date, time])
```

```typescript
// Application level check
const existingAppointment = await prisma.appointment.findFirst({
  where: {
    doctorId,
    date: appointmentDate,
    time,
    status: { in: ['PENDING', 'CONFIRMED'] },
  },
});

if (existingAppointment) {
  throw new AppError('Энэ цаг аль хэдийн захиалагдсан байна', 409);
}
```

### 2. Timezone Issues

**Problem:** Mongolia (UTC+8) date/time handling.

**Solution:**
- Store dates as `@db.Date` (date only, no timezone)
- Store times as strings `"09:00"` (no timezone confusion)
- All date comparisons done in local timezone
- Frontend displays local time

```typescript
// Date handling
const today = new Date();
today.setHours(0, 0, 0, 0); // Reset to midnight local time

// Time comparison
const selectedDate = new Date(date);
const isToday = selectedDate.toDateString() === new Date().toDateString();
```

### 3. Past Time Slot Selection

**Problem:** Booking past times on current day.

**Solution:**
```typescript
const isToday = selectedDate.toDateString() === new Date().toDateString();
const currentMinutes = isToday 
  ? new Date().getHours() * 60 + new Date().getMinutes() 
  : 0;

// Mark past slots as unavailable
const available = !bookedTimes.has(time) && (!isToday || slotMinutes > currentMinutes);
```

### 4. Phone Number Validation

**Problem:** Invalid Mongolian phone numbers.

**Solution:**
```typescript
// Mongolian mobile: 8 digits starting with 8, 9, 7, 6
const phoneRegex = /^[6-9][0-9]{7}$/;
if (!phoneRegex.test(patientPhone)) {
  throw new AppError('Утасны дугаар буруу байна', 400);
}
```

### 5. Schedule Edge Cases

**Problem:** Appointment at boundary times.

**Solution:**
```typescript
// Validate time is within schedule AND valid slot interval
const slotMinutes = slotHour * 60 + slotMin;
const startMinutes = startHour * 60 + startMin;
const endMinutes = endHour * 60 + endMin;

if (slotMinutes < startMinutes || slotMinutes >= endMinutes) {
  throw new AppError('Цаг хуваарьт багтахгүй байна', 400);
}

// Check slot aligns with duration
if ((slotMinutes - startMinutes) % schedule.slotDuration !== 0) {
  throw new AppError('Буруу цагийн интервал', 400);
}
```

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp apps/api/.env.example apps/api/.env
# Edit DATABASE_URL with your PostgreSQL connection

# 3. Setup database
npm run db:generate
npm run db:migrate
npm run db:seed  # Creates admin user and sample data

# 4. Start development
npm run dev

# Access:
# - Patient Web: http://localhost:3000
# - Admin Panel: http://localhost:3001
# - API Server:  http://localhost:4000

# Default Admin Login:
# Email: admin@clinic.mn
# Password: admin123
```

---

## 🔒 Security Considerations

1. **JWT Secrets**: Use strong, unique secrets in production
2. **Password Hashing**: bcrypt with 10 salt rounds
3. **Input Validation**: express-validator on all endpoints
4. **CORS**: Restricted to known origins
5. **SQL Injection**: Protected by Prisma ORM
6. **XSS**: React auto-escapes by default

---

Built for Mongolia 🇲🇳 with simplicity and reliability in mind.
