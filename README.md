# Attendance App

A location-based attendance tracking system for classrooms. Instructors generate QR codes for each class session, and students scan them with their phones to check in — but only if they're physically present in the classroom.

## Features

- **Admin Dashboard**: Create class sessions, generate QR codes, view attendance (present vs missing)
- **Student Portal**: Scan QR codes via phone camera, location-verified check-in
- **Role-Based Access**: Separate Admin and Student authentication
- **Geolocation Verification**: Students must be within the specified radius (default 30m) to check in
- **Real-Time Attendance**: Admins can see who's present and who's missing

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Auth | NextAuth.js (Credentials) |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| QR Generation | qrcode.react |

---

## Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file in the root directory:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres

# NextAuth
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# QR Code Base URL (optional for local, required for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Database
```bash
# Push schema to database
npx prisma migrate dev --name init

# Seed admin user
npx tsx prisma/seed.ts
```

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`

---

## Default Credentials



Students register themselves via the `/register` page (requires `@northeastern.edu` email).

---

## How It Works

### Admin Flow
1. Log in at `/login`
2. Click **"+ New Session"**
3. Enter session name and click **"Get Current Location"**
4. Adjust the check-in radius (default 30m)
5. Click **"Create Session"** → QR code is generated
6. Display the QR code in class (projector, screen, etc.)
7. View attendance via **"View Details"** on any session

### Student Flow
1. Scan the QR code with phone camera (opens a URL)
2. Log in or register (if first time)
3. Click **"I am here"**
4. Browser requests location permission
5. If within radius → ✅ Attendance marked
6. If outside radius → ❌ Rejected with distance shown

---

## Deployment (Vercel)

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. Add environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Supabase pooler URL (port 6543) |
| `DIRECT_URL` | Your Supabase direct URL (port 5432) |
| `NEXTAUTH_SECRET` | Your secret key |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

3. Deploy
4. After first deploy, update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` with the actual Vercel URL
5. Redeploy

### 3. Seed Production Database
Run locally (your `.env` points to the same Supabase DB):
```bash
npx tsx prisma/seed.ts
```

---

## Project Structure

```
app/
├── page.tsx                    # Landing page
├── login/page.tsx              # Login page
├── register/page.tsx           # Student registration
├── dashboard/
│   ├── page.tsx                # Dashboard router (Admin vs Student)
│   ├── admin-view.tsx          # Admin dashboard
│   ├── student-view.tsx        # Student dashboard
│   └── sessions/[id]/          # Session details (attendance list)
├── attendance/[token]/page.tsx # QR scan landing (check-in page)
└── api/
    ├── auth/[...nextauth]/     # NextAuth API
    ├── register/               # Student registration API
    ├── admin/sessions/         # Session CRUD (Admin only)
    └── attendance/mark/        # Attendance check-in API

prisma/
├── schema.prisma               # Database schema
└── seed.ts                     # Admin seeding script
```

---

## Database Schema

- **User**: id, email, password, name, role (ADMIN/STUDENT), studentId
- **ClassSession**: id, name, qrToken, latitude, longitude, radius, isActive
- **AttendanceRecord**: userId, sessionId, timestamp, status

---

## License

Built for HCI Spring 2026 @ Northeastern University.
