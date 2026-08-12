import { NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * GET /api/site-settings
 * Returns all site settings as a key/value map. Public endpoint.
 * Used by client components (blog page) that need DB-driven text.
 */
export async function GET() {
  const rows = await db.siteSetting.findMany()
  const map: Record<string, string> = {}
  for (const row of rows) map[row.key] = row.value
  return NextResponse.json(map)
}
