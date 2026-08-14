import { NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * GET /api/footer
 * Returns all footer content (social links, quick links, contacts, settings)
 * as a single JSON object. Public endpoint used by the client-side Footer.
 * Falls back to empty data if the database is temporarily unreachable.
 */
export async function GET() {
  try {
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
  } catch (error) {
    console.error("[/api/footer] Database error:", error)
    // Return empty but valid fallback so the footer renders without crashing
    return NextResponse.json(
      {
        settings: {},
        socialLinks: [],
        quickLinks: [],
        contacts: [],
      },
      { status: 200 }
    )
  }
}
