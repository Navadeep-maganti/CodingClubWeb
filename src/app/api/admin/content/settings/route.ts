import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions, requireAdmin, requireSuperAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { ROLES } from "@/lib/rbac"
import { clearSettingsCache } from "@/lib/site-config"

/**
 * Admin-only endpoints for managing site settings (key/value pairs).
 *
 * PUT /api/admin/content/settings
 *   body: { key: string, value: string }
 *   OR
 *   body: { updates: { key: value, ... } }
 *
 * GET /api/admin/content/settings -> returns all settings (for admin UI)
 */

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const rows = await db.siteSetting.findMany({ orderBy: { key: "asc" } })
  return NextResponse.json(rows)
}

export async function PUT(request: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const updates: Record<string, string> = {}

  if (body.updates && typeof body.updates === "object") {
    for (const [k, v] of Object.entries(body.updates)) {
      if (typeof k === "string" && typeof v === "string") updates[k] = v
    }
  } else if (typeof body.key === "string" && typeof body.value === "string") {
    updates[body.key] = body.value
  } else {
    return NextResponse.json({ error: "Invalid body. Expected {key, value} or {updates: {...}}" }, { status: 400 })
  }

  for (const [key, value] of Object.entries(updates)) {
    await db.siteSetting.upsert({
      where: { key },
      update: { value: value.slice(0, 10000) },
      create: { key, value: value.slice(0, 10000) },
    })
  }

  clearSettingsCache()

  await logAudit({
    actorId: session.user.id,
    action: "SITE_SETTINGS_UPDATED",
    entityType: "SiteSetting",
    entityId: null,
    metadata: { keys: Object.keys(updates) },
  })

  return NextResponse.json({ ok: true, updated: Object.keys(updates) })
}
