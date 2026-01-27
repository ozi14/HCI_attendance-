# Database Setup Guide (PostgreSQL/Supabase)

This project has been upgraded to use **PostgreSQL** for production readiness. Follow these steps to connect your database.

## 1. Get Your Connection String
1.  Go to [Supabase.com](https://supabase.com) and create a new project.
2.  Once created, go to **Project Settings** -> **Database**.
3.  Under **Connection Pooler**, looking for the "Transaction" mode connection string (recommended for serverless environments like Vercel).
    - If you are running locally, you can use the direct connection string.
4.  It will look something like this:
    ```
    postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
    ```

## 2. Update Environment Variables
Open your `.env` file and **replace** the `DATABASE_URL` with your copied string.

```env
# .env file
DATABASE_URL="postgres://postgres.[your-project]:[password]@[host]:6543/postgres?pgbouncer=true"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
```

## 3. Apply Schema & Seed Database
Run the following commands to create the tables in your new Supabase database and create the admin user.

```bash
# 1. Install latest Prisma Client
npm install @prisma/client

# 2. Push the schema to the database (creates tables)
npx prisma migrate dev --name init_postgres

# 3. Seed the database (creates Admin user)
npx tsx prisma/seed.ts
```

## 4. Verify
Start the app:
```bash
npm run dev
```
You should now be able to log in with `admin123` / `adminadmin1`. All data is now stored in Supabase!
