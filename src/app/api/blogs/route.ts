import { NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * GET /api/blogs
 * Returns all published blog posts formatted for the public blog listing.
 *
 * Optional query params:
 *   - category: filter by category slug
 *   - tag: filter by tag slug
 *   - q: full-text search on title/excerpt/tags
 *   - filter: "featured" | "trending" | "latest" | "most-read"
 *   - authorId: filter by author ID
 *
 * Response shape: array of
 *   { id, title, slug, excerpt, coverImage, publishedAt, readTime,
 *     featured, viewCount, likeCount, bookmarkCount,
 *     author: { id, name, avatar, bio, role },
 *     category: { name, slug, color },
 *     tags: string[] }
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const categorySlug = url.searchParams.get("category")
    const tagSlug = url.searchParams.get("tag")
    const q = url.searchParams.get("q")?.toLowerCase()
    const filter = url.searchParams.get("filter") || ""
    const authorId = url.searchParams.get("authorId")

    const posts = await db.blog.findMany({
      where: { published: true },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      include: {
        author: { select: { id: true, displayName: true, avatar: true, bio: true, role: true } },
        category: { select: { name: true, slug: true, color: true } },
        tags: { include: { tag: true } },
      },
    })

    let formatted = posts
      .filter((p) => {
        if (categorySlug && p.category?.slug !== categorySlug) return false
        if (tagSlug && !p.tags.some((tm) => tm.tag.slug === tagSlug)) return false
        if (authorId && p.author?.id !== authorId) return false
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
        coverImage: p.coverImage || "/placeholder.svg",
        publishedAt: p.publishedAt?.toISOString() || p.createdAt.toISOString(),
        readTime: p.readTime || "5 min read",
        featured: p.featured,
        viewCount: p.viewCount,
        likeCount: p.likeCount,
        bookmarkCount: p.bookmarkCount,
        author: {
          id: p.author?.id || "",
          name: p.author?.displayName || "Coding Club",
          avatar: p.author?.avatar || "/placeholder.svg",
          bio: p.author?.bio || "Coding Club Member",
          role: p.author?.role || "",
        },
        category: p.category
          ? { name: p.category.name, slug: p.category.slug, color: p.category.color || "#4A90E2" }
          : null,
        tags: p.tags.map((tm) => tm.tag.name),
        // internal sort key — stripped before response
        _score: 0,
      }))

    // Apply filter-specific sorting
    switch (filter) {
      case "featured":
        formatted = formatted.filter((p) => p.featured)
        break
      case "trending":
        formatted = formatted.map((p) => ({
          ...p,
          _score: p.viewCount + p.likeCount * 5 + (p.featured ? 50 : 0) + p.bookmarkCount * 3,
        }))
        formatted.sort((a, b) => b._score - a._score)
        break
      case "most-read":
        formatted.sort((a, b) => b.viewCount - a.viewCount)
        break
      case "latest":
      default:
        formatted.sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
        )
        break
    }

    // Strip internal _score
    const result = formatted.map(({ _score, ...rest }) => rest)

    return NextResponse.json(result)
  } catch (err) {
    console.error("[api/blogs] error:", err)
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 })
  }
}
