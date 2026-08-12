import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { ROLES } from "@/lib/rbac"

/**
 * Admin-only endpoints for managing team members.
 *
 * PUT    /api/admin/team?id=<id>  body: { ...fields to update }
 * DELETE /api/admin/team?id=<id>
 *
 * Per RBAC matrix, MANAGE_TEAM is granted to both SUPER_ADMIN and ADMIN.
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

  const url = new URL(request.url)
  const id = url.searchParams.get("id")
  const body = await request.json()

  if (!id) {
    // If id is in body, use it
    if (body.id) {
      return PUT_byId(session.user.id, body.id, body)
    }
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  return PUT_byId(session.user.id, id, body)
}

async function PUT_byId(adminId: string, id: string, updates: any) {
  const existing = await db.teamMember.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const data: any = {}
  if (typeof updates.name === "string") data.name = updates.name.toString().slice(0, 200)
  if (typeof updates.bio === "string") data.bio = updates.bio.toString().slice(0, 2000)
  if (typeof updates.profileImage === "string") data.profileImage = updates.profileImage.toString().slice(0, 500)
  if (typeof updates.category === "string") data.category = updates.category.toString().slice(0, 50)
  if (typeof updates.displayOrder === "number") data.displayOrder = updates.displayOrder
  if (typeof updates.isActive === "boolean") data.isActive = updates.isActive
  if (typeof updates.isFeatured === "boolean") data.isFeatured = updates.isFeatured
  if (Array.isArray(updates.strengths)) {
    data.strengths = JSON.stringify(
      updates.strengths.filter((s: unknown) => typeof s === "string").map((s: any) => s.toString().slice(0, 50)).slice(0, 20),
    )
  }
  // Social links
  if (Array.isArray(updates.socialLinks)) {
    await db.socialLink.deleteMany({ where: { teamMemberId: id } })
    for (const link of updates.socialLinks) {
      if (!link?.platform || !link?.url) continue
      const url = link.url.toString().trim().slice(0, 500)
      if (!url) continue
      try {
        await db.socialLink.create({
          data: { teamMemberId: id, platform: link.platform.toString().toLowerCase(), url },
        })
      } catch {
        // ignore unique constraint
      }
    }
  }

  const updated = await db.teamMember.update({ where: { id }, data })

  await logAudit({
    actorId: adminId,
    action: "TEAM_MEMBER_UPDATED",
    entityType: "TeamMember",
    entityId: id,
    metadata: { fields: Object.keys(data) },
  })

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    bio: updated.bio,
    profileImage: updated.profileImage,
    displayOrder: updated.displayOrder,
    isActive: updated.isActive,
    category: updated.category,
  })
}

export async function DELETE(request: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(request.url)
  const id = url.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const existing = await db.teamMember.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Also remove the placeholder user if it's not a real user
  const user = await db.user.findUnique({ where: { id: existing.userId } })
  await db.teamMember.delete({ where: { id } })
  if (user && user.email.startsWith("placeholder+")) {
    await db.user.delete({ where: { id: user.id } }).catch(() => {})
  }

  await logAudit({
    actorId: session.user.id,
    action: "TEAM_MEMBER_DELETED",
    entityType: "TeamMember",
    entityId: id,
    metadata: { name: existing.name },
  })

  return NextResponse.json({ ok: true })
}
