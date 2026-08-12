import { NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * GET /api/blogs
 * Returns all published blog posts formatted for the public blog listing.
 * Optional query params:
 *   - category: filter by category slug
 *   - tag: filter by tag slug
 *   - q: full-text search on title/excerpt/tags
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const categorySlug = url.searchParams.get("category")
    const tagSlug = url.searchParams.get("tag")
    const q = url.searchParams.get("q")?.toLowerCase()

    const posts = await db.blog.findMany({
      where: { published: true },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      include: {
        author: true,
        category: true,
        tags: { include: { tag: true } },
      },
    })

    const formatted = posts
      .filter((p) => {
        if (categorySlug && p.category?.slug !== categorySlug) return false
        if (tagSlug && !p.tags.some((tm) => tm.tag.slug === tagSlug)) return false
        if (q) {
          const hay = (
            p.title +
            " " +
            p.excerpt +
            " " +
            p.tags.map((t) => t.tag.name).join(" ")
          ).toLowerCase()
          if (!hay.includes(q)) return false
        }
        return true
      })
      .map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        author: {
          name: p.author?.displayName || "Coding Club",
          avatar: p.author?.avatar || "/placeholder.svg",
          bio: p.author?.bio || "Coding Club Member",
        },
        publishedAt: p.publishedAt?.toISOString() || p.createdAt.toISOString(),
        readTime: p.readTime || "5 min read",
        category: p.category?.name || "General",
        tags: p.tags.map((tm) => tm.tag.name),
        featured: p.featured,
        image: p.coverImage || "/placeholder.svg",
      }))

    return NextResponse.json(formatted)
  } catch (err) {
    console.error("[api/blogs] error:", err)
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 })
  }
}
