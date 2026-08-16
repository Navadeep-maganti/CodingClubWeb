import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * GET /api/blogs/related?slug=<slug>&limit=<n>
 * Returns related blog posts based on:
 *   1. Same category (highest priority)
 *   2. Matching tags (medium priority)
 *   3. Trending fallback (lowest priority — if no category/tag matches)
 *
 * Response shape: array of
 *   { id, title, slug, excerpt, coverImage, publishedAt, readTime,
 *     category:{name,slug,color}, author:{displayName,avatar,role} }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "3", 10), 1), 10)

    if (!slug) {
      return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 })
    }

    const blog = await db.blog.findUnique({
      where: { slug },
      include: { tags: { include: { tag: true } } },
    })

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    const tagIds = blog.tags.map((t) => t.tagId)

    // Fetch candidates: published blogs, not the current one
    const candidates = await db.blog.findMany({
      where: {
        published: true,
        id: { not: blog.id },
        OR: [
          ...(blog.categoryId ? [{ categoryId: blog.categoryId }] : []),
          ...(tagIds.length > 0 ? [{ tags: { some: { tagId: { in: tagIds } } } }] : []),
        ],
      },
      include: {
        author: { select: { displayName: true, avatar: true, role: true } },
        category: { select: { name: true, slug: true, color: true } },
        tags: { include: { tag: { select: { id: true } } } },
      },
      take: 30,
    })

    // Score candidates: same-category +10, each shared tag +5, recency +1 per day (max 7)
    const scored = candidates.map((b) => {
      let score = 0
      if (b.categoryId === blog.categoryId) score += 10
      const sharedTags = b.tags.filter((t) => tagIds.includes(t.tagId)).length
      score += sharedTags * 5
      const ageDays = Math.floor((Date.now() - b.publishedAt!.getTime()) / (1000 * 60 * 60 * 24))
      score += Math.max(0, 7 - ageDays)
      return { blog: b, score }
    })

    scored.sort((a, b) => b.score - a.score)

    // Fallback to trending if no matches
    const related =
      scored.length > 0
        ? scored.slice(0, limit)
        : (
            await db.blog.findMany({
              where: {
                published: true,
                id: { not: blog.id },
              },
              include: {
                author: { select: { displayName: true, avatar: true, role: true } },
                category: { select: { name: true, slug: true, color: true } },
              },
              orderBy: { viewCount: "desc" },
              take: limit,
            })
          ).map((b) => ({ blog: b, score: 0 }))

    const result = related.map(({ blog: b }) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      coverImage: b.coverImage || "",
      publishedAt: b.publishedAt?.toISOString() || b.createdAt.toISOString(),
      readTime: b.readTime || "5 min read",
      viewCount: b.viewCount,
      likeCount: b.likeCount,
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
    }))

    return NextResponse.json(result)
  } catch (err) {
    console.error("[api/blogs/related] error:", err)
    return NextResponse.json({ error: "Failed to fetch related blogs" }, { status: 500 })
  }
}
