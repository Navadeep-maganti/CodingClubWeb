import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

async function main() {
  await db.approvedRollNumber.upsert({
    where: { rollNumber: "CODING" },
    update: {},
    create: {
      rollNumber: "CODING",
      email: "coding@nitandhra.ac.in",
      notes: "Official Coding Club Admin",
      addedById: null
    }
  })
  console.log("Added coding@nitandhra.ac.in to whitelist!")
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
