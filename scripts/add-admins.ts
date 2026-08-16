/**
 * Whitelist additional admin / test roll numbers.
 *
 * Usage: npx tsx scripts/add-admins.ts
 *
 * This script is idempotent — re-running it will not duplicate entries.
 */
import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

async function main() {
  // Whitelist additional roll numbers. By default these get MEMBER on first
  // sign-in; the bootstrap SUPER_ADMIN rolls (424161, 424157, CODING) are
  // already configured in src/lib/auth.ts to auto-grant SUPER_ADMIN.
  const rolls = [
    { roll: "424161", notes: "Bootstrap super admin (env INITIAL_SUPER_ADMIN_ROLL_NUMBER)" },
    { roll: "424157", notes: "Hardcoded super admin (legacy)" },
    { roll: "000001", notes: "Test member" },
  ]

  // Ensure all roles exist (SUPER_ADMIN, ADMIN, MEMBER, BLOG_AUTHOR)
  const roleMap: Record<string, string> = {}
  for (const name of ["SUPER_ADMIN", "ADMIN", "MEMBER", "BLOG_AUTHOR"]) {
    const r = await db.role.upsert({
      where: { name },
      update: {},
      create: { name, description: `${name} role` },
    })
    roleMap[name] = r.id
  }

  // Whitelist the special coding@nitandhra.ac.in email
  await db.approvedRollNumber.upsert({
    where: { rollNumber: "CODING" },
    update: {},
    create: {
      rollNumber: "CODING",
      email: "coding@nitandhra.ac.in",
      notes: "Bootstrap super-admin email (coding@nitandhra.ac.in).",
    },
  })
  console.log("✓ Whitelisted: CODING (coding@nitandhra.ac.in)")

  for (const { roll, notes } of rolls) {
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
