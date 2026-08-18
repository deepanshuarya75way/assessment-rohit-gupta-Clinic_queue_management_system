# Clinic Queue Management System (CQMS)

A full-stack digital queue management system for outpatient clinics. Replaces paper-token systems with real-time digital queue tracking, doctor dashboards, patient history, and automated notifications.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express + TypeScript |
| Frontend | React + TypeScript + Tailwind CSS |
| Database | PostgreSQL 15 |
| Real-time | Socket.io |
| State Management | Zustand |
| Server State | React Query (@tanstack/react-query) |
| Auth | JWT (jsonwebtoken + bcrypt) |
| ORM | TypeORM |
| Notifications | WhatsApp Cloud API + Nodemailer (email) |
| Deployment | Docker + docker-compose |

## Project Status

**Complete.** Both server and client compile and build without errors.

## Project Structure

```
queue_management/
├── docker-compose.yml          # PostgreSQL + server + client
├── .env.example                # Environment template
├── .env                        # Active environment config
├── .gitignore
├── README.md                   # ← You are here (handoff doc)
│
├── server/                     # Express backend
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts            # Entry point: starts HTTP + Socket.io + seeds DB
│       ├── app.ts              # Express app with all routes mounted
│       ├── config/
│       │   ├── database.ts     # TypeORM DataSource (PostgreSQL)
│       │   └── env.ts          # Environment variables
│       ├── entities/           # 8 TypeORM entities:
│       │   ├── User.ts         #   Login accounts (admin/doctor/receptionist)
│       │   ├── Patient.ts      #   Patient demographics
│       │   ├── Doctor.ts       #   Doctor profiles & schedules
│       │   ├── Appointment.ts  #   Pre-booked appointments
│       │   ├── Queue.ts        #   Daily queue entries with tokens
│       │   ├── Visit.ts        #   Consultation records (prescriptions, notes)
│       │   ├── Department.ts   #   Multi-department support
│       │   └── ClinicSettings.ts  # Clinic configuration
│       ├── middleware/
│       │   ├── auth.ts         # JWT authentication + role authorization
│       │   └── errorHandler.ts # Global error handler (Zod + generic)
│       ├── controllers/        # 9 controllers (business logic):
│       │   ├── authController.ts
│       │   ├── patientController.ts
│       │   ├── doctorController.ts
│       │   ├── queueController.ts
│       │   ├── appointmentController.ts
│       │   ├── visitController.ts
│       │   ├── reportController.ts
│       │   ├── userController.ts
│       │   └── settingsController.ts
│       ├── routes/             # 9 route files matching controllers
│       ├── services/
│       │   ├── queueEngine.ts        # Token generation, call next, skip, complete
│       │   ├── notificationService.ts # WhatsApp (Meta API) + Email (Nodemailer)
│       │   └── reportService.ts      # Footfall, wait times, doctor stats
│       ├── socket/
│       │   └── index.ts              # Socket.io init + events + rooms
│       └── types/
│           └── index.ts              # Shared TS interfaces
│
└── client/                     # React frontend
    ├── Dockerfile
    ├── nginx.conf              # Nginx config for production
    ├── package.json
    ├── vite.config.ts          # Vite + proxy config
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.tsx            # React entry point
        ├── App.tsx             # Router + QueryClient + Toaster
        ├── index.css           # Tailwind directives
        ├── types/index.ts      # All frontend TS interfaces
        ├── api/                # 9 API modules (axios-based)
        ├── store/              # Zustand stores: auth, queue, ui
        ├── hooks/              # useSocket, useAuth
        ├── components/         # 10 shared components
        └── pages/              # 7 pages: Login, Reception, DoctorDashboard,
                                #   AdminPanel, DisplayScreen, Appointments, Reports
```

## Quick Start

### Prerequisites
- Node.js >= 18
- PostgreSQL 15 (or Docker)
- npm

### Option A: Docker (recommended)
```bash
docker-compose up -d
# Server: http://localhost:5000
# Client: http://localhost:3000
```

### Option B: Local development
```bash
# Terminal 1 - Database (if not running)
# Ensure PostgreSQL is running on localhost:5432

# Terminal 2 - Server
cd server
cp .env.example .env     # Edit DB credentials if needed
npm install
npm run dev              # Starts on port 5000 with hot reload

# Terminal 3 - Client
cd client
npm install
npm run dev              # Starts on port 3000, proxies /api to 5000
```

### Default Credentials (seeded automatically on first run)
| Role | Username | Password |
|---|---|---|
| Admin | admin | admin123 |
| Doctor | doctor | doctor123 |
| Receptionist | reception | reception123 |

### First-Time Setup
1. Start the app (one of the options above)
2. Login as `admin` / `admin123`
3. Go to Admin Panel → **Doctors** tab → Add at least one doctor
4. Go to **Clinic Settings** → Set clinic name
5. The system is ready. Login as `reception` to register patients and issue tokens.

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/login | No | Login, returns JWT |
| POST | /api/auth/register | Admin | Create new user |
| GET | /api/auth/profile | Auth | Get current user |
| GET | /api/patients | Auth+ | List/search patients |
| POST | /api/patients | Auth+ | Register patient |
| GET | /api/patients/:id | Auth+ | Get patient by ID |
| GET | /api/patients/phone/:phone | Auth+ | Lookup by phone |
| PUT | /api/patients/:id | Auth+ | Update patient |
| GET | /api/doctors | Auth | List doctors |
| POST | /api/doctors | Admin | Add doctor |
| PUT | /api/doctors/:id | Admin | Update doctor |
| GET | /api/queue/doctor/:id | Auth | Get queue for doctor |
| GET | /api/queue/doctor/:id/current | Auth | Current + next 5 |
| POST | /api/queue | Auth+ | Create token (add to queue) |
| PATCH | /api/queue/:doctorId/call | Doctor | Call next patient |
| PATCH | /api/queue/:id/skip | Doctor/Reception | Skip patient |
| PATCH | /api/queue/:id/complete | Doctor | Complete consultation |
| GET | /api/appointments | Auth+ | List appointments |
| POST | /api/appointments | Auth+ | Book appointment |
| PATCH | /api/appointments/:id | Auth+ | Update status |
| GET | /api/visits/patient/:id | Auth+ | Get visit history |
| POST | /api/visits | Doctor | Add visit record |
| GET | /api/reports/footfall | Admin | Daily patient count |
| GET | /api/reports/wait-times | Admin | Avg wait times |
| GET | /api/reports/doctor-stats | Admin | Doctor performance |
| GET | /api/settings | Auth | Get clinic settings |
| PUT | /api/settings | Admin | Update settings |
| GET | /api/users | Admin | List users |
| POST | /api/users | Admin | Create user |
| PATCH | /api/users/:id/toggle-active | Admin | Activate/deactivate |

## Frontend Routes

| Route | Page | Access |
|---|---|---|
| /login | Login | Public |
| /display | Waiting room display | Public |
| /reception | Patient registration + token issue | Admin, Receptionist |
| /doctor | Doctor dashboard | Doctor |
| /admin | Admin panel (doctors, settings) | Admin |
| /appointments | Appointment management | Admin, Receptionist |
| /reports | Reports & analytics | Admin |

## Database Schema (8 tables)

```
users (id, username, passwordHash, name, role, doctorId, isActive, createdAt)
patients (id, fullName, phoneNumber, age, gender, address, createdAt, updatedAt)
doctors (id, fullName, specialization, workingHours, status, departmentId, avgConsultationMinutes)
appointments (id, patientId, doctorId, appointmentDate, appointmentTime, status, notes)
queue (id, tokenNumber, patientId, doctorId, queueDate, sequenceNumber, status, calledAt, completedAt, isWalkIn, estimatedWaitMinutes)
visits (id, patientId, doctorId, visitDate, diagnosis, prescription, notes, reasonForVisit)
departments (id, name, description, isActive)
clinic_settings (id, clinicName, address, phone, workingHours, holidays, defaultConsultationMinutes, tokenCounter, tokenCounterDate)
```

## Key Design Decisions

1. **Queue workflow**: `waiting` → `in-progress` → `completed` | `skipped`
2. **Token format**: `D{doctorId}-{dailySequence}` (e.g., `D1-001`)
3. **Token counter**: Daily auto-reset via `tokenCounterDate` field in `clinic_settings`
4. **Real-time**: Socket.io broadcasts `queue:updated` events to doctor and staff rooms
5. **Notifications**: WhatsApp (Meta Cloud API) + Email via Nodemailer. Both gracefully skip if not configured
6. **Auth**: JWT with 24h expiry. Roles: `admin`, `doctor`, `receptionist`
7. **Patient lookup**: By phone number (unique); auto-fetches previous records
8. **TypeORM**: `synchronize: true` in development; disable for production and use migrations

### What Has Been Built
All files are complete and both server and client compile without errors:

- **Server**: 39 source files (config, entities, middleware, controllers, routes, services, socket, types, utils, entry points)
- **Client**: 32 source files (components, pages, stores, hooks, API layer, types, config, entry points)
- **Root**: docker-compose.yml, .env, .gitignore

### Build Verification
- Server TypeScript: `cd server && npx tsc --noEmit` → clean (no errors)
- Client TypeScript: `cd client && npx tsc --noEmit` → clean (no errors)
- Client Vite build: `cd client && npx vite build` → successful (1328 modules)

### What Remains / Could Be Enhanced
1. **PostgreSQL connection**: Ensure the database is running before starting the server
2. **Migrations**: Currently using `synchronize: true` — for production, generate migrations
3. **Notifications**: Set `WHATSAPP_PHONE_ID` and `WHATSAPP_TOKEN` in `.env` to enable WhatsApp messages; set SMTP vars for email
4. **Multi-branch**: The `departments` table exists but isn't fully wired in the UI
5. **Mobile app**: The patient-facing mobile app (Flutter/React Native) is not built
6. **Tests**: No test suite is configured yet
7. **CI/CD**: No pipeline configured
8. **HTTPS**: For production, add SSL termination (e.g., Caddy, Nginx, or cloud proxy)

### Common Commands
```bash
# Server
npm run dev                # Dev with hot reload (ts-node-dev)
npm run build              # TypeScript compile
npm start                  # Run compiled JS

# Client
npm run dev                # Vite dev server (port 3000)
npm run build              # Production build
npm run preview            # Preview production build

# Docker
docker-compose up -d       # Start all services
docker-compose down        # Stop all services
docker-compose logs -f     # Follow logs
```

### Troubleshooting
- **"ECONNREFUSED" on DB**: Ensure PostgreSQL is running and credentials in `.env` are correct
- **TypeORM sync errors**: Set `synchronize: false` in `server/src/config/database.ts` and run migrations manually
- **Socket.io not connecting**: Check that the client proxy config in `vite.config.ts` forwards `/socket.io` correctly
- **Vite proxy not working**: Ensure the server is running on port 5000 before starting the client

---

*Generated for Clinic Queue Management System v1.0 — July 2026*
*Last verified build: Server + Client both compile clean*
