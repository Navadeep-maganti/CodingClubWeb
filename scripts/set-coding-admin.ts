import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  const email = 'coding@nitandhra.ac.in'
  
  // 1. Add to ApprovedRollNumber if not exists
  await db.approvedRollNumber.upsert({
    where: { rollNumber: 'CODING' },
    update: { email: email, notes: 'Official Coding Club Admin' },
    create: { rollNumber: 'CODING', email: email, notes: 'Official Coding Club Admin' }
  })
  console.log('Added to ApprovedRollNumber.')

  // 2. Give user SUPER_ADMIN role if they exist
  const user = await db.user.findUnique({ where: { email } })
  if (user) {
    const superAdminRole = await db.role.findUnique({ where: { name: 'SUPER_ADMIN' } })
    if (superAdminRole) {
      await db.userRole.upsert({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId: superAdminRole.id
          }
        },
        update: {},
        create: {
          userId: user.id,
          roleId: superAdminRole.id
        }
      })
      console.log('Granted SUPER_ADMIN role to user.')
    }
  } else {
    console.log('User has not logged in yet, but they are whitelisted. They will be granted SUPER_ADMIN on first login via initial bootstrap logic.')
  }
}

main().finally(() => db.$disconnect())
