import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { ROLES } from "@/lib/rbac"

/**
 * Admin-only endpoint for managing blog author approvals.
 *
 * PUT /api/admin/blog-authors
 * body: { id: string, isApproved: boolean }
 */
async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  const roles = session.user.roles || []
  if (!roles.includes(ROLES.SUPER_ADMIN) && !roles.includes(ROLES.ADMIN)) return null
  return session
}

export async function PUT(request: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { id, isApproved } = body as { id?: string; isApproved?: boolean }
  if (!id || typeof isApproved !== "boolean") {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const existing = await db.blogAuthor.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const updated = await db.blogAuthor.update({
    where: { id },
    data: { isApproved },
  })

  // Synchronize BLOG_AUTHOR role in user_roles table
  if (existing.userId) {
    const blogAuthorRole = await db.role.findUnique({ where: { name: ROLES.BLOG_AUTHOR } })
    if (blogAuthorRole) {
      if (isApproved) {
        try {
          await db.userRole.create({
            data: {
              userId: existing.userId,
              roleId: blogAuthorRole.id,
              assignedById: session.user.id,
            },
          })
        } catch {
          // Role assignment already exists
        }
      } else {
        await db.userRole.deleteMany({
          where: {
            userId: existing.userId,
            roleId: blogAuthorRole.id,
          },
        })
      }
    }
  }

  await logAudit({
    actorId: session.user.id,
    action: isApproved ? "BLOG_AUTHOR_APPROVED" : "BLOG_AUTHOR_REVOKED",
    entityType: "BlogAuthor",
    entityId: id,
    metadata: { displayName: existing.displayName },
  })

  return NextResponse.json({ ok: true, isApproved: updated.isApproved })
}

export async function DELETE(request: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(request.url)
  const id = url.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const existing = await db.blogAuthor.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Remove BLOG_AUTHOR role if assigned
  if (existing.userId) {
    const blogAuthorRole = await db.role.findUnique({ where: { name: ROLES.BLOG_AUTHOR } })
    if (blogAuthorRole) {
      await db.userRole.deleteMany({
        where: { userId: existing.userId, roleId: blogAuthorRole.id },
      })
    }
  }

  await db.blogAuthor.delete({ where: { id } })

  await logAudit({
    actorId: session.user.id,
    action: "BLOG_AUTHOR_REVOKED",
    entityType: "BlogAuthor",
    entityId: id,
    metadata: { displayName: existing.displayName, action: "REJECTED_AND_DELETED" },
  })

  return NextResponse.json({ ok: true })
}

