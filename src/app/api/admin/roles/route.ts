import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { ROLES, ALL_ROLES, type RoleName } from "@/lib/rbac"

/**
 * Admin-only endpoint to assign or remove a role from a user.
 *
 * PUT /api/admin/roles
 * body: { userId: string, role: RoleName, action: "add" | "remove" }
 */
async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  const roles = session.user.roles || []
  if (!roles.includes(ROLES.SUPER_ADMIN)) return null
  return session
}

export async function PUT(request: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { userId, role, action } = body as {
    userId?: string
    role?: string
    action?: "add" | "remove"
  }

  if (!userId || !role || !action) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }
  if (!ALL_ROLES.includes(role as RoleName)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }
  if (userId === session.user.id && action === "remove" && role === ROLES.SUPER_ADMIN) {
    return NextResponse.json({ error: "You cannot remove your own super admin role" }, { status: 400 })
  }

  const roleRow = await db.role.findUnique({ where: { name: role as string } })
  if (!roleRow) return NextResponse.json({ error: "Role not configured" }, { status: 500 })

  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  if (action === "add") {
    try {
      await db.userRole.create({
        data: { userId, roleId: roleRow.id, assignedById: session.user.id },
      })
      await logAudit({
        actorId: session.user.id,
        action: "ROLE_ASSIGNED",
        entityType: "User",
        entityId: userId,
        metadata: { role },
      })
    } catch {
      // already has role - ignore
    }

    // Synchronize BlogAuthor record if assigning BLOG_AUTHOR role
    if (role === ROLES.BLOG_AUTHOR) {
      const existingAuthor = await db.blogAuthor.findUnique({ where: { userId } })
      if (existingAuthor) {
        await db.blogAuthor.update({
          where: { id: existingAuthor.id },
          data: { isApproved: true },
        })
      } else {
        await db.blogAuthor.create({
          data: {
            userId,
            displayName: user.name || user.email.split("@")[0] || "Blog Author",
            avatar: user.image || null,
            isApproved: true,
          },
        })
      }
    }
  } else if (action === "remove") {
    await db.userRole.deleteMany({ where: { userId, roleId: roleRow.id } })
    await logAudit({
      actorId: session.user.id,
      action: "ROLE_REMOVED",
      entityType: "User",
      entityId: userId,
      metadata: { role },
    })

    // Synchronize BlogAuthor record if removing BLOG_AUTHOR role
    if (role === ROLES.BLOG_AUTHOR) {
      await db.blogAuthor.updateMany({
        where: { userId },
        data: { isApproved: false },
      })
    }
  }

  // Return refreshed author profile if applicable
  const authorRecord = await db.blogAuthor.findUnique({ where: { userId } })

  return NextResponse.json({
    ok: true,
    author: authorRecord
      ? {
          id: authorRecord.id,
          displayName: authorRecord.displayName,
          bio: authorRecord.bio || "",
          avatar: authorRecord.avatar || "",
          isApproved: authorRecord.isApproved,
          userId: authorRecord.userId || "",
          userEmail: user.email,
          userName: user.name || "",
        }
      : null,
  })
}
