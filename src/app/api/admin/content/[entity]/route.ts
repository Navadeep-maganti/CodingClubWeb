import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions, requireAdmin, requireSuperAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { ROLES } from "@/lib/rbac"
import { clearSettingsCache } from "@/lib/site-config"

/**
 * Generic CRUD for content entities.
 *
 * Path: /api/admin/content/<entity>
 *   where <entity> is one of:
 *     pillars, domains, hero-stats, events, missions, resources,
 *     footer-social, footer-quick-links, footer-contacts
 *
 * Methods:
 *   GET    -> list all
 *   POST   -> create
 *   PUT    ?id=... -> update
 *   DELETE ?id=... -> delete
 */


type EntityName =
  | "pillars"
  | "domains"
  | "hero-stats"
  | "events"
  | "missions"
  | "resources"
  | "footer-social"
  | "footer-quick-links"
  | "footer-contacts"

function getEntity(request: Request): EntityName | null {
  const url = new URL(request.url)
  const parts = url.pathname.split("/").filter(Boolean)
  const last = parts[parts.length - 1] as EntityName
  const valid: EntityName[] = [
    "pillars",
    "domains",
    "hero-stats",
    "events",
    "missions",
    "resources",
    "footer-social",
    "footer-quick-links",
    "footer-contacts",
  ]
  return valid.includes(last) ? last : null
}

function parseJsonArraySafe(value: unknown): string {
  if (Array.isArray(value)) return JSON.stringify(value)
  if (typeof value === "string") {
    try {
      const p = JSON.parse(value)
      if (Array.isArray(p)) return JSON.stringify(p)
    } catch {
      return JSON.stringify(value.split(",").map((s) => s.trim()).filter(Boolean))
    }
  }
  return "[]"
}

function prepareData(entity: EntityName, body: any): any {
  const data: any = {}
  switch (entity) {
    case "pillars":
      if (typeof body.title === "string") data.title = body.title.slice(0, 200)
      if (typeof body.description === "string") data.description = body.description.slice(0, 2000)
      if (typeof body.iconName === "string") data.iconName = body.iconName.slice(0, 50)
      if (typeof body.colorFrom === "string") data.colorFrom = body.colorFrom.slice(0, 100)
      if (typeof body.colorTo === "string") data.colorTo = body.colorTo.slice(0, 100)
      if (body.features !== undefined) data.features = parseJsonArraySafe(body.features)
      if (typeof body.displayOrder === "number") data.displayOrder = body.displayOrder
      if (typeof body.isActive === "boolean") data.isActive = body.isActive
      break
    case "domains":
      if (typeof body.title === "string") data.title = body.title.slice(0, 200)
      if (typeof body.description === "string") data.description = body.description.slice(0, 1000)
      if (typeof body.iconName === "string") data.iconName = body.iconName.slice(0, 50)
      if (typeof body.color === "string") data.color = body.color.slice(0, 20)
      if (typeof body.displayOrder === "number") data.displayOrder = body.displayOrder
      if (typeof body.isActive === "boolean") data.isActive = body.isActive
      break
    case "hero-stats":
      if (typeof body.iconName === "string") data.iconName = body.iconName.slice(0, 50)
      if (typeof body.value === "string") data.value = body.value.slice(0, 50)
      if (typeof body.label === "string") data.label = body.label.slice(0, 200)
      if (typeof body.description === "string") data.description = body.description.slice(0, 500)
      if (typeof body.gradient === "string") data.gradient = body.gradient.slice(0, 100)
      if (typeof body.displayOrder === "number") data.displayOrder = body.displayOrder
      if (typeof body.isActive === "boolean") data.isActive = body.isActive
      break
    case "events":
      if (typeof body.title === "string") data.title = body.title.slice(0, 300)
      if (typeof body.description === "string") data.description = body.description.slice(0, 2000)
      if (typeof body.date === "string") data.date = new Date(body.date)
      if (typeof body.time === "string") data.time = body.time.slice(0, 50)
      if (typeof body.location === "string") data.location = body.location.slice(0, 200)
      if (typeof body.type === "string") data.type = body.type.slice(0, 50)
      if (typeof body.status === "string") data.status = body.status.slice(0, 20)
      if (typeof body.image === "string") data.image = body.image.slice(0, 500)
      if (typeof body.registrations === "number") data.registrations = body.registrations
      if (typeof body.maxRegistrations === "number") data.maxRegistrations = body.maxRegistrations
      if (typeof body.registrationUrl === "string") data.registrationUrl = body.registrationUrl.slice(0, 500)
      if (typeof body.displayOrder === "number") data.displayOrder = body.displayOrder
      if (typeof body.isActive === "boolean") data.isActive = body.isActive
      break
    case "missions":
      if (typeof body.title === "string") data.title = body.title.slice(0, 200)
      if (typeof body.description === "string") data.description = body.description.slice(0, 2000)
      if (typeof body.iconName === "string") data.iconName = body.iconName.slice(0, 50)
      if (typeof body.displayOrder === "number") data.displayOrder = body.displayOrder
      if (typeof body.isActive === "boolean") data.isActive = body.isActive
      break
    case "resources":
      if (typeof body.category === "string") data.category = body.category.slice(0, 30)
      if (typeof body.parentId === "string") data.parentId = body.parentId
      if (body.parentId === null) data.parentId = null
      if (typeof body.title === "string") data.title = body.title.slice(0, 300)
      if (typeof body.description === "string") data.description = body.description.slice(0, 2000)
      if (typeof body.difficulty === "string") data.difficulty = body.difficulty.slice(0, 100)
      if (typeof body.duration === "string") data.duration = body.duration.slice(0, 100)
      if (body.topics !== undefined) data.topics = parseJsonArraySafe(body.topics)
      if (body.tools !== undefined) data.tools = parseJsonArraySafe(body.tools)
      if (typeof body.toolkitCategory === "string") data.toolkitCategory = body.toolkitCategory.slice(0, 50)
      if (typeof body.downloads === "number") data.downloads = body.downloads
      if (body.tech !== undefined) data.tech = parseJsonArraySafe(body.tech)
      if (typeof body.author === "string") data.author = body.author.slice(0, 200)
      if (typeof body.stars === "number") data.stars = body.stars
      if (typeof body.github === "string") data.github = body.github.slice(0, 500)
      if (typeof body.url === "string") data.url = body.url.slice(0, 500)
      if (typeof body.displayOrder === "number") data.displayOrder = body.displayOrder
      if (typeof body.isActive === "boolean") data.isActive = body.isActive
      break
    case "footer-social":
      if (typeof body.platform === "string") data.platform = body.platform.slice(0, 50)
      if (typeof body.label === "string") data.label = body.label.slice(0, 100)
      if (typeof body.url === "string") data.url = body.url.slice(0, 500)
      if (typeof body.iconName === "string") data.iconName = body.iconName.slice(0, 50)
      if (typeof body.displayOrder === "number") data.displayOrder = body.displayOrder
      if (typeof body.isActive === "boolean") data.isActive = body.isActive
      break
    case "footer-quick-links":
      if (typeof body.label === "string") data.label = body.label.slice(0, 100)
      if (typeof body.href === "string") data.href = body.href.slice(0, 200)
      if (typeof body.displayOrder === "number") data.displayOrder = body.displayOrder
      if (typeof body.isActive === "boolean") data.isActive = body.isActive
      break
    case "footer-contacts":
      if (typeof body.label === "string") data.label = body.label.slice(0, 100)
      if (typeof body.value === "string") data.value = body.value.slice(0, 1000)
      if (typeof body.iconName === "string") data.iconName = body.iconName.slice(0, 50)
      if (typeof body.displayOrder === "number") data.displayOrder = body.displayOrder
      if (typeof body.isActive === "boolean") data.isActive = body.isActive
      break
  }
  return data
}

function getModelDelegate(entity: EntityName) {
  switch (entity) {
    case "pillars": return db.pillar
    case "domains": return db.domain
    case "hero-stats": return db.heroStat
    case "events": return db.event
    case "missions": return db.missionCard
    case "resources": return db.resourceItem
    case "footer-social": return db.footerLink
    case "footer-quick-links": return db.footerQuickLink
    case "footer-contacts": return db.footerContact
  }
}

function getEntityLabel(entity: EntityName): string {
  return {
    pillars: "Pillar",
    domains: "Domain",
    "hero-stats": "HeroStat",
    events: "Event",
    missions: "MissionCard",
    resources: "ResourceItem",
    "footer-social": "FooterLink",
    "footer-quick-links": "FooterQuickLink",
    "footer-contacts": "FooterContact",
  }[entity]
}

export async function GET(request: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const entity = getEntity(request)
  if (!entity) return NextResponse.json({ error: "Invalid entity" }, { status: 400 })
  const model = getModelDelegate(entity)
  const rows = await (model as any).findMany({ orderBy: { displayOrder: "asc" } })
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const entity = getEntity(request)
  if (!entity) return NextResponse.json({ error: "Invalid entity" }, { status: 400 })
  const body = await request.json()
  const data = prepareData(entity, body)
  const model = getModelDelegate(entity)
  const created = await (model as any).create({ data })

  await logAudit({
    actorId: session.user.id,
    action: "USER_UPDATED",
    entityType: getEntityLabel(entity),
    entityId: created.id,
    metadata: { created: true },
  })
  clearSettingsCache()
  return NextResponse.json(created)
}

export async function PUT(request: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const entity = getEntity(request)
  if (!entity) return NextResponse.json({ error: "Invalid entity" }, { status: 400 })

  const url = new URL(request.url)
  const id = url.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const body = await request.json()
  const data = prepareData(entity, body)
  const model = getModelDelegate(entity)
  const updated = await (model as any).update({ where: { id }, data })

  await logAudit({
    actorId: session.user.id,
    action: "USER_UPDATED",
    entityType: getEntityLabel(entity),
    entityId: id,
    metadata: { fields: Object.keys(data) },
  })
  clearSettingsCache()
  return NextResponse.json(updated)
}

export async function DELETE(request: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const entity = getEntity(request)
  if (!entity) return NextResponse.json({ error: "Invalid entity" }, { status: 400 })

  const url = new URL(request.url)
  const id = url.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const model = getModelDelegate(entity)
  await (model as any).delete({ where: { id } })

  await logAudit({
    actorId: session.user.id,
    action: "USER_UPDATED",
    entityType: getEntityLabel(entity),
    entityId: id,
    metadata: { deleted: true },
  })
  clearSettingsCache()
  return NextResponse.json({ ok: true })
}
