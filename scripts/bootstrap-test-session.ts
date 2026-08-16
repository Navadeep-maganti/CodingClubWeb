/**
 * Test helper: bootstrap a real super admin user + session for browser testing.
 * Usage: bun run scripts/bootstrap-test-session.ts
 *
 * This is for sandbox testing only — it uses a fake Google account record
 * to simulate a logged-in super admin.
 */
import { PrismaClient } from "@prisma/client"
import crypto from "crypto"

const db = new PrismaClient()

const SUPER_ADMIN_ROLL = process.env.INITIAL_SUPER_ADMIN_ROLL_NUMBER || "000001"

async function main() {
  // Ensure roles exist
  const superAdminRole = await db.role.upsert({
    where: { name: "SUPER_ADMIN" },
    update: {},
    create: { name: "SUPER_ADMIN", description: "Super Admin role" },
  })
  const memberRole = await db.role.upsert({
    where: { name: "MEMBER" },
    update: {},
    create: { name: "MEMBER", description: "Member role" },
  })

  // Ensure approved roll number
  await db.approvedRollNumber.upsert({
    where: { rollNumber: SUPER_ADMIN_ROLL },
    update: {},
    create: {
      rollNumber: SUPER_ADMIN_ROLL,
      email: `${SUPER_ADMIN_ROLL}@student.nitandhra.ac.in`,
      notes: "Bootstrapped super admin (test).",
    },
  })

  // Create or update user
  const email = `${SUPER_ADMIN_ROLL}@student.nitandhra.ac.in`
  let user = await db.user.findUnique({ where: { email } })
  if (!user) {
    user = await db.user.create({
      data: {
        email,
        name: `Super Admin ${SUPER_ADMIN_ROLL}`,
        rollNumber: SUPER_ADMIN_ROLL,
        image: null,
        isActive: true,
      },
    })
  }

  // Assign SUPER_ADMIN role
  const existingRole = await db.userRole.findFirst({
    where: { userId: user.id, roleId: superAdminRole.id },
  })
  if (!existingRole) {
    await db.userRole.create({
      data: { userId: user.id, roleId: superAdminRole.id },
    })
  }

  // Create a fake Account record so the user can sign in via OAuth flow simulation
  const providerAccountId = crypto.randomBytes(8).toString("hex")
  await db.account.create({
    data: {
      userId: user.id,
      type: "oauth",
      provider: "google",
      providerAccountId,
      access_token: "test-token",
      scope: "email profile openid",
      token_type: "Bearer",
    },
  }).catch(() => {
    // ignore if already exists
  })

  // Create a session token
  const sessionToken = crypto.randomBytes(32).toString("hex")
  const expires = new Date()
  expires.setDate(expires.getDate() + 30)
  await db.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires,
    },
  })

  console.log("=== Bootstrap complete ===")
  console.log("User ID:", user.id)
  console.log("Email:", user.email)
  console.log("Roll number:", user.rollNumber)
  console.log("")
  console.log("To sign in via the browser, set this cookie:")
  console.log(`  next-auth.session-token=${sessionToken}`)
  console.log("")
  console.log("In Agent Browser:")
  console.log(`  agent-browser cookies set next-auth.session-token ${sessionToken}`)
  console.log("")
  console.log("Then visit /dashboard/admin")
}

main()
  .catch((err) => {
    console.error("Failed:", err)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
