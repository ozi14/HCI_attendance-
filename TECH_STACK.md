# Tech Stack & Backend Architecture

## Technology Stack

This project is built using a modern, type-safe stack designed for performance and developer experience.

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
  - Uses Server Components for improved performance and SEO.
  - Client Components (`"use client"`) for interactive UI.
- **Language**: [TypeScript](https://www.typescriptlang.org/)
  - Ensures type safety across the entire application.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
  - Utility-first CSS framework for rapid UI development.
- **Icons**: [Lucide React](https://lucide.dev/)
  - Consistent and lightweight icon set.
- **QR Codes**: 
  - Generation: `qrcode.react`
  - Scanning: `html5-qrcode`

### Backend
- **Runtime**: Node.js (via Next.js API Routes)
- **Database ORM**: [Prisma](https://www.prisma.io/)
  - Type-safe database access.
  - Automated migrations.
- **Database**: SQLite (Development) / PostgreSQL (Production ready)
  - Currently configured with SQLite (`file:./dev.db`) for ease of setup.
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
  - **Provider**: Credentials (Email/Password).
  - **Session Strategy**: JWT (JSON Web Tokens).
  - **Encryption**: `bcryptjs` for hashing passwords.

---

## Backend Architecture & Data Flow

### 1. Database Schema (`prisma/schema.prisma`)
The data model consists of three main entities:

- **User**: Represents both Students and Admins.
  - Fields: `id`, `email`, `password`, `name`, `role` (ADMIN/STUDENT), `studentId`.
- **ClassSession**: Represents a single class meeting.
  - Fields: `id`, `name`, `qrToken`, `latitude`, `longitude`, `radius`, `isActive`.
  - The `qrToken` is a unique string encoded into the QR code displayed in class.
  - `latitude`/`longitude` define the center point of the class location.
- **AttendanceRecord**: Links a User to a ClassSession.
  - Fields: `userId`, `sessionId`, `timestamp`, `status`.
  - A composite unique constraint `@@unique([userId, sessionId])` prevents duplicate check-ins.

### 2. Authentication Flow
1.  **Login**: User submits credentials to `/api/auth/signin`.
2.  **Verification**: NextAuth calls `authorize` callback:
    - Finds user in DB via Prisma.
    - Compares hashed password using `bcrypt.compare`.
    - If valid, returns user object.
3.  **Session**: A JWT is created containing `user.id` and `user.role`. This token is stored in an HTTP-only cookie.
4.  **Protection**: Middleware or `getServerSession` checks this token to allow/deny access to protected routes (e.g., `/dashboard`).

### 3. Session Creation (Admin)
- **Endpoint**: `POST /api/admin/sessions`
- **Logic**:
  1.  Validates user is ADMIN.
  2.  Receives `name`, `latitude`, `longitude`, `radius`.
  3.  Creates a new `ClassSession` in the database.
  4.  The frontend displays a QR code containing the `qrToken` from this session.

### 4. Registration Flow
- **Endpoint**: `POST /api/register`
- **Logic**:
  1.  Validates email format (must end in `@northeastern.edu`).
  2.  Checks if user already exists.
  3.  Hashes password.
  4.  Creates new `User` with role `STUDENT`.

### 5. Attendance Verification (Planned)
- **Flow**:
  1.  Student scans QR code -> gets `qrToken`.
  2.  Browser gets GPS -> `studentLat`, `studentLong`.
  3.  **POST** to `/api/attendance`: `{ qrToken, latitude, longitude }`.
  4.  **Server Validation**:
      - Find session by `qrToken`.
      - Calculate distance between Class location and Student location (Haversine formula).
      - If distance < `radius`, create `AttendanceRecord`.
      - Else, reject with "Location Mismatch".
