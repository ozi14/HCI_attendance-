import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// IMPORTANT:
// When using Supabase's pooler (pgbouncer) in transaction mode, prepared statements can break
// scripts like seeding. Prefer DIRECT_URL (port 5432) for CLI scripts.
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
})

async function main() {
  const adminEmail = 'admin@attendance.app'.toLowerCase().trim()
  const adminPassword = 'adminadmin1'.trim()
  
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword, role: 'ADMIN', name: 'Admin User' },
    create: {
      email: adminEmail,
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log(`Admin ensured: ${adminEmail} / ${adminPassword}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
