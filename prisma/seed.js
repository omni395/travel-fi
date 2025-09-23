import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Admin
  const adminEmail = 'admin@example.com'
  const adminPass = '12345678'
  const adminHash = await bcrypt.hash(adminPass, 12)
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'admin', password: adminHash },
    create: { email: adminEmail, role: 'admin', password: adminHash }
  })

  // 10 random users
  for (let i = 0; i < 10; i++) {
    const email = `user${i + 1}@example.com`
    const pass = 'password' + (i + 1)
    const hash = await bcrypt.hash(pass, 12)
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, password: hash }
    })
  }
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


