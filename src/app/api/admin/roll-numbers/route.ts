import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { ROLES } from "@/lib/rbac"
import { validateRollNumber } from "@/lib/validation"

/**
 * Admin-only endpoints for managing approved roll numbers.
 *
 * GET    /api/admin/roll-numbers              -> list                       (SUPER_ADMIN only)
 * POST   /api/admin/roll-numbers              -> add a roll number          (SUPER_ADMIN only)
 * DELETE /api/admin/roll-numbers?id=<id>      -> remove a roll number       (SUPER_ADMIN only)
 *
 * Per the RBAC matrix, ADD_APPROVED_ROLL / REMOVE_APPROVED_ROLL are
 * SUPER_ADMIN-only — ADMIN does NOT inherit these.
 */
async function requireSuperAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  const roles = session.user.roles || []
  if (!roles.includes(ROLES.SUPER_ADMIN)) return null
  return session
}

export async function GET() {
  const session = await requireSuperAdmin()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const rolls = await db.approvedRollNumber.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json(rolls)
}

export async function POST(request: Request) {
  const session = await requireSuperAdmin()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { rollNumber, notes } = body as { rollNumber?: string; notes?: string }

  const check = validateRollNumber(rollNumber || "")
  if (!check.ok) {
    return NextResponse.json({ error: check.reason }, { status: 400 })
  }

  const existing = await db.approvedRollNumber.findUnique({ where: { rollNumber: check.rollNumber } })
  if (existing) {
    return NextResponse.json({ error: "Roll number already approved" }, { status: 409 })
  }

  const created = await db.approvedRollNumber.create({
    data: {
      rollNumber: check.rollNumber,
      email: check.email,
      notes: (notes || "").toString().slice(0, 500),
      addedById: session.user.id,
    },
  })

  await logAudit({
    actorId: session.user.id,
    action: "USER_APPROVED",
    entityType: "ApprovedRollNumber",
    entityId: created.id,
    metadata: { rollNumber: check.rollNumber },
  })

  return NextResponse.json({
    id: created.id,
    rollNumber: created.rollNumber,
    email: created.email || "",
    isUsed: created.isUsed,
    notes: created.notes || "",
    createdAt: created.createdAt.toISOString(),
  })
}

export async function DELETE(request: Request) {
  const session = await requireSuperAdmin()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(request.url)
  const id = url.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const existing = await db.approvedRollNumber.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await db.approvedRollNumber.delete({ where: { id } })

  await logAudit({
    actorId: session.user.id,
    action: "USER_REVOKED",
    entityType: "ApprovedRollNumber",
    entityId: id,
    metadata: { rollNumber: existing.rollNumber },
  })

  return NextResponse.json({ ok: true })
}
