# Attendance App

## Setup Instructions

### 1. Installation
Install dependencies:
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory with the following content. I have already generated a secret for you in the setup process, but verify it exists.

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-value"
```
*Note: You can generate a new secret using `openssl rand -base64 32` if needed.*

### 3. Database Setup
The database uses SQLite. Initialize it and apply the schema:
```bash
npx prisma migrate dev --name init
```

Seed the database with an initial Admin user:
```bash
npx tsx prisma/seed.ts
```
**Default Admin Credentials:**
- **Email/Username**: `admin123`
- **Password**: `adminadmin1`

### 4. Running the App
Start the development server:
```bash
npm run dev
```
Visit `http://localhost:3000` to see the app.

---

## Architecture & Features

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: SQLite (via Prisma ORM)
- **Auth**: NextAuth.js (Credentials Provider)
- **Styling**: Tailwind CSS & Lucide Icons

### Completed Features
1.  **Backend Foundation**:
    - Prisma Schema (Users, ClassSessions, AttendanceRecords).
    - NextAuth configuration with Role-based access (Admin vs Student).
    - Registration API.
2.  **User Interface**:
    - **Landing Page**: Modern entry point (`app/page.tsx`).
    - **Authentication**: Fully functional Login (`app/login/page.tsx`) and Registration (`app/register/page.tsx`) pages.
    - **Role-Based Dashboard**:
        - Automatic routing in `app/dashboard/page.tsx`.
        - **Admin View**: Placeholder for class management.
        - **Student View**: Placeholder for QR scanning.

## What is needed for a Working Demo?

To complete the demo functionality:

1.  **Admin Dashboard Logic**:
    - Implement "Create Session" modal (POST to API).
    - Generate and display QR Code for the session.
    - Fetch and display active sessions.
2.  **Student Dashboard Logic**:
    - Implement QR Code Scanner integration (`html5-qrcode`).
    - Implement Geolocation check (Browser API).
    - POST attendance to API.
