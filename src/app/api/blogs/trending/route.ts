import { NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * GET /api/blogs/trending
 * Returns the top-trending published blog posts, ranked by a blend of
 * view count, like count, and featured status.
 *
 * Query params:
 *   limit - number of posts to return (default 5, max 20)
 *
 * Ranking formula:
 *   score = viewCount + (likeCount * 5) + (featured ? 50 : 0) + (bookmarkCount * 3)
 *
 * Response shape: array of
 *   { id, title, slug, excerpt, coverImage, viewCount, likeCount, bookmarkCount,
 *     publishedAt, readTime, featured, category:{name,slug},
 *     author:{displayName,avatar,role} }
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "5", 10), 1), 20)

    const blogs = await db.blog.findMany({
      where: { published: true },
      include: {
        author: { select: { displayName: true, avatar: true, role: true } },
        category: { select: { name: true, slug: true, color: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: 100, // Fetch a pool then rank in JS
    })

    const ranked = blogs
      .map((b) => ({
        id: b.id,
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt,
        coverImage: b.coverImage || "",
        viewCount: b.viewCount,
        likeCount: b.likeCount,
        bookmarkCount: b.bookmarkCount,
        publishedAt: b.publishedAt?.toISOString() || b.createdAt.toISOString(),
        readTime: b.readTime || "5 min read",
        featured: b.featured,
        category: b.category
          ? { name: b.category.name, slug: b.category.slug, color: b.category.color }
          : null,
        author: b.author
          ? {
              displayName: b.author.displayName,
              avatar: b.author.avatar || "",
              role: b.author.role || "",
            }
          : null,
        _score: b.viewCount + b.likeCount * 5 + (b.featured ? 50 : 0) + b.bookmarkCount * 3,
      }))
      .sort((a, b) => b._score - a._score)
      .slice(0, limit)
      // strip internal _score from response
      .map(({ _score, ...rest }) => rest)

    return NextResponse.json(ranked)
  } catch (err) {
    console.error("[api/blogs/trending] error:", err)
    return NextResponse.json({ error: "Failed to fetch trending blogs" }, { status: 500 })
  }
}
