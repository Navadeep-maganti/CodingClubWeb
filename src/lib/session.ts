import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { ROLES, type RoleName, hasPermission, type Permission } from "@/lib/rbac"

export type SessionUser = {
  id: string
  email: string
  name?: string | null
  image?: string | null
  rollNumber?: string | null
  roles: RoleName[]
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  return session.user as SessionUser
}

/**
 * Returns the user's roles directly from the DB (authoritative source).
 * Useful when session may be stale.
 */
export async function getUserRoles(userId: string): Promise<RoleName[]> {
  const userRoles = await db.userRole.findMany({
    where: { userId },
    include: { role: true },
  })
  return userRoles.map((ur) => ur.role.name as RoleName)
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) {
    redirect("/login?error=auth_required")
  }
  return user
}

export async function requireRole(role: RoleName): Promise<SessionUser> {
  const user = await requireAuth()
  if (!user.roles.includes(role)) {
    redirect("/dashboard/unauthorized")
  }
  return user
}

export async function requirePermission(perm: Permission): Promise<SessionUser> {
  const user = await requireAuth()
  if (!hasPermission(user.roles, perm)) {
    redirect("/dashboard/unauthorized")
  }
  return user
}

export function isSuperAdmin(user: SessionUser | null): boolean {
  return !!user && user.roles.includes(ROLES.SUPER_ADMIN)
}

export function isBlogAuthor(user: SessionUser | null): boolean {
  return !!user && user.roles.includes(ROLES.BLOG_AUTHOR)
}

export function isMember(user: SessionUser | null): boolean {
  return !!user && user.roles.includes(ROLES.MEMBER)
}
