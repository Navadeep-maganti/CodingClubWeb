import { NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * GET /api/blogs/categories
 * Returns list of categories available for blog post creation.
 */
export async function GET() {
  try {
    const categories = await db.blogCategory.findMany({
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        iconName: true,
        description: true,
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching blog categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}
