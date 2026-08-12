import { NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * GET /api/footer
 * Returns all footer content (social links, quick links, contacts, settings)
 * as a single JSON object. Public endpoint used by the client-side Footer.
 */
export async function GET() {
  const [settingsRows, social, quickLinks, contacts] = await Promise.all([
    db.siteSetting.findMany(),
    db.footerLink.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    }),
    db.footerQuickLink.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    }),
    db.footerContact.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    }),
  ])

  const settings: Record<string, string> = {}
  for (const row of settingsRows) settings[row.key] = row.value

  return NextResponse.json({
    settings,
    socialLinks: social,
    quickLinks,
    contacts,
  })
}
