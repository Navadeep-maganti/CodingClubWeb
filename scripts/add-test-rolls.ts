import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

async function main() {
  // Add 000001 as a test MEMBER roll (it's the default fallback in seed.ts)
  const testRolls = [
    { roll: "000001", notes: "Test member (000001) - default fallback" },
  ]
  for (const { roll, notes } of testRolls) {
    await db.approvedRollNumber.upsert({
      where: { rollNumber: roll },
      update: {},
      create: {
        rollNumber: roll,
        email: `${roll}@student.nitandhra.ac.in`,
        notes,
      },
    })
    console.log(`✓ Whitelisted: ${roll}`)
  }

  // List everything in the whitelist
  const all = await db.approvedRollNumber.findMany({ orderBy: { rollNumber: "asc" } })
  console.log("\nApproved roll numbers in DB:")
  for (const r of all) console.log(`  • ${r.rollNumber}  (used: ${r.isUsed})  notes: ${r.notes || "-"}`)

  // List roles
  const roles = await db.role.findMany()
  console.log("\nRoles in DB:")
  for (const r of roles) console.log(`  • ${r.name}  (${r.description || "-"})`)
}

main().catch(console.error).finally(() => db.$disconnect())
