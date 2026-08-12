import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import {
  validateStudentEmail,
  extractRollNumber,
} from "@/lib/validation"
import { ROLES, type RoleName } from "@/lib/rbac"

/**
 * NextAuth options.
 *
 * Login flow:
 *   1. User signs in with Google OAuth.
 *   2. Email must match ^[0-9]{6}@student\.nitandhra\.ac\.in$ (server-side check).
 *      Special exception: coding@nitandhra.ac.in is the bootstrap super-admin email
 *      (mapped to roll number "CODING").
 *   3. Roll number is extracted from email.
 *   4. Roll number must exist in approved_roll_numbers table.
 *   5. If approved: user is created/updated and a session is issued.
 *   6. If not approved: sign-in is denied with an error.
 *   7. Bootstrap SUPER_ADMIN emails / roll numbers get SUPER_ADMIN on first login.
 */

/**
 * Bootstrap super-admin configuration.
 *
 * - INITIAL_SUPER_ADMIN_ROLL_NUMBER (env, default "000001"): the roll number that
 *   becomes SUPER_ADMIN on first sign-in.
 * - CODING_EMAIL ("coding@nitandhra.ac.in"): the club's official email —
 *   mapped to roll number "CODING" and granted SUPER_ADMIN on first sign-in.
 * - HARDCODED_SUPER_ADMINS: legacy roll numbers that always get SUPER_ADMIN.
 */
const CODING_EMAIL = "coding@nitandhra.ac.in"
const CODING_ROLL_NUMBER = "CODING"
const SUPER_ADMIN_ROLL = process.env.INITIAL_SUPER_ADMIN_ROLL_NUMBER || "000001"
const HARDCODED_SUPER_ADMINS = ["424161", "424157", CODING_ROLL_NUMBER]

/**
 * Validate the incoming email against the strict whitelist rules.
 * Returns { ok, rollNumber, email } on success, or { ok: false, reason } on failure.
 *
 * Rules:
 *   - coding@nitandhra.ac.in → rollNumber = "CODING" (super-admin bootstrap)
 *   - Otherwise: must match ^[0-9]{6}@student\.nitandhra\.ac\.in$
 */
function validateLoginEmail(email: string):
  | { ok: true; rollNumber: string; email: string }
  | { ok: false; reason: string } {
  if (!email) return { ok: false, reason: "Email is required." }

  const lower = email.toLowerCase().trim()

  // Bootstrap super-admin email — bypass the student roll-number regex.
  if (lower === CODING_EMAIL) {
    return { ok: true, rollNumber: CODING_ROLL_NUMBER, email: lower }
  }

  // Standard student email check
  return validateStudentEmail(lower)
}

async function ensureRoles(): Promise<Record<string, string>> {
  const roleMap: Record<string, string> = {}
  for (const name of Object.values(ROLES)) {
    const role = await db.role.upsert({
      where: { name },
      update: {},
      create: { name, description: `${name} role` },
    })
    roleMap[name] = role.id
  }
  return roleMap
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as never,
  session: { strategy: "database" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account",
          // Note: we do NOT enforce hd here because the bootstrap email
          // (coding@nitandhra.ac.in) lives on a different Google Workspace
          // tenant than student.nitandhra.ac.in. Server-side validation
          // in the signIn callback is the authoritative gate.
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    /**
     * SignIn callback - the GATE for whitelist enforcement.
     * Runs on every sign-in attempt.
     */
    async signIn(user) {
      const email = user.user.email
      if (!email) {
        console.warn("[auth] Sign-in denied: no email returned by provider")
        return false
      }

      // Step 1: validate email format (server-side)
      const check = validateLoginEmail(email)
      if (!check.ok) {
        console.warn(`[auth] Sign-in denied for ${email}: ${check.reason}`)
        return false
      }
      const rollNumber = check.rollNumber

      // Step 2: check approved_roll_numbers whitelist
      const approved = await db.approvedRollNumber.findUnique({
        where: { rollNumber },
      })
      if (!approved) {
        console.warn(`[auth] Sign-in denied: roll number ${rollNumber} not in whitelist`)
        // We can't easily redirect from here; the error page will explain.
        return false
      }

      // Step 3: ensure user record exists and link roll number
      // (PrismaAdapter will create the user via createUser, but we need to add rollNumber
      //  and bootstrap roles. We do that in events.create or here if user already exists.)
      return true
    },

    /**
     * Session callback - attach role & rollNumber to session.user
     */
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.rollNumber = user.rollNumber
        // Fetch roles
        const userRoles = await db.userRole.findMany({
          where: { userId: user.id },
          include: { role: true },
        })
        session.user.roles = userRoles.map((ur) => ur.role.name as RoleName)
      }
      return session
    },
  },

  events: {
    /**
     * createUser - fires when PrismaAdapter creates a new user.
     * We assign default MEMBER role here, and SUPER_ADMIN if roll matches a bootstrap.
     */
    async createUser(message) {
      const user = message.user
      const email = user.email || ""
      const lower = email.toLowerCase().trim()

      // Determine roll number from email
      let rollNumber: string | null
      if (lower === CODING_EMAIL) {
        rollNumber = CODING_ROLL_NUMBER
      } else {
        rollNumber = extractRollNumber(lower)
      }

      if (!rollNumber) {
        console.warn(`[auth] createUser: email ${email} did not yield a roll number`)
        return
      }

      // Update user with rollNumber
      await db.user.update({
        where: { id: user.id },
        data: { rollNumber, name: user.name || `Member ${rollNumber}` },
      })

      // Mark the approved roll number as used
      await db.approvedRollNumber.updateMany({
        where: { rollNumber },
        data: { isUsed: true, email: lower },
      })

      // Assign default role
      const roleMap = await ensureRoles()
      const isBootstrapSuperAdmin =
        rollNumber === SUPER_ADMIN_ROLL ||
        rollNumber === CODING_ROLL_NUMBER ||
        HARDCODED_SUPER_ADMINS.includes(rollNumber)
      const defaultRole: RoleName = isBootstrapSuperAdmin ? ROLES.SUPER_ADMIN : ROLES.MEMBER

      await db.userRole.create({
        data: {
          userId: user.id,
          roleId: roleMap[defaultRole],
        },
      })

      // Audit log
      await db.auditLog.create({
        data: {
          actorId: user.id,
          action: "USER_CREATED",
          entityType: "User",
          entityId: user.id,
          metadata: JSON.stringify({ rollNumber, defaultRole, email: lower }),
        },
      })
    },
  },
}

// Type augmentation for session.user
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      rollNumber?: string | null
      roles: RoleName[]
    }
  }
  interface User {
    rollNumber?: string | null
    roles?: RoleName[]
  }
}
