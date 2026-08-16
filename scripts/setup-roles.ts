import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

async function main() {
  // 1. Remove "000001" (Bootstrapped super admin - initial)
  const deleted000001 = await db.approvedRollNumber.deleteMany({
    where: { rollNumber: "000001" }
  })
  console.log(`Removed 000001 entries: ${deleted000001.count}`)

  // 2. Remove any entries with "Granted admin via script" notes
  const deletedScript = await db.approvedRollNumber.deleteMany({
    where: { notes: { contains: "Granted admin via script" } }
  })
  console.log(`Removed 'Granted admin via script' entries: ${deletedScript.count}`)

  // 3. Ensure "Official Coding Club Admin" entry stays (coding@nitandhra.ac.in)
  const coding = await db.approvedRollNumber.findFirst({ where: { rollNumber: "CODING" } })
  console.log(`CODING entry exists: ${!!coding} — notes: "${coding?.notes}"`)

  // 4. Ensure ADMIN role exists in the Role table
  const adminRole = await db.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN", description: "Admin — full content access, no member/role management or audit log" }
  })
  console.log(`ADMIN role ensured: ${adminRole.id}`)

  // 5. Also re-upsert SUPER_ADMIN, MEMBER, BLOG_AUTHOR roles
  for (const [name, description] of [
    ["SUPER_ADMIN", "Full access to all features"],
    ["MEMBER", "Basic self-service access"],
    ["BLOG_AUTHOR", "Member + can write blogs"],
  ]) {
    await db.role.upsert({
      where: { name },
      update: {},
      create: { name, description }
    })
    console.log(`Role "${name}" ensured`)
  }

  console.log("\nDone! Summary:")
  const allRolls = await db.approvedRollNumber.findMany({ select: { rollNumber: true, email: true, notes: true } })
  console.table(allRolls)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
