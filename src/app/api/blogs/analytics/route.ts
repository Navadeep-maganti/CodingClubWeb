import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { ROLES } from "@/lib/rbac"

/**
 * GET /api/blogs/analytics
 * Returns aggregated blog analytics for the admin dashboard.
 *
 * - SUPER_ADMIN / ADMIN: see stats for ALL published blogs
 * - BLOG_AUTHOR: see stats for their own blogs only
 *
 * Response shape:
 *   {
 *     totalBlogs, totalPublished, totalDrafts,
 *     totalViews, totalLikes, totalBookmarks,
 *     topBlogs: [{ id, title, slug, viewCount, likeCount, bookmarkCount, publishedAt, readTime }],
 *     blogsByCategory: [{ name, slug, count, color }],
 *     recentActivity: [{ id, title, slug, publishedAt, views, likes }]
 *   }
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const roles = session.user.roles || []
    const isAdmin = roles.includes(ROLES.SUPER_ADMIN) || roles.includes(ROLES.ADMIN)
    const isAuthor = roles.includes(ROLES.BLOG_AUTHOR)

    if (!isAdmin && !isAuthor) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // For authors, only include their own blogs
    let authorFilter: { authorId?: string } = {}
    if (!isAdmin) {
      const author = await db.blogAuthor.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      })
      authorFilter = author ? { authorId: author.id } : { authorId: "none" }
    }

    const [blogs, publishedBlogs, draftBlogs, categoryStats, topBlogs, recentActivity] =
      await Promise.all([
        db.blog.findMany({
          where: authorFilter,
          select: {
            id: true,
            title: true,
            slug: true,
            viewCount: true,
            likeCount: true,
            bookmarkCount: true,
            published: true,
            publishedAt: true,
            readTime: true,
            categoryId: true,
          },
        }),
        db.blog.count({ where: { ...authorFilter, published: true } }),
        db.blog.count({ where: { ...authorFilter, published: false } }),
        db.blogCategory.findMany({
          include: {
            _count: {
              select: {
                blogs: { where: { published: true, ...authorFilter } },
              },
            },
          },
        }),
        db.blog.findMany({
          where: { ...authorFilter, published: true },
          orderBy: { viewCount: "desc" },
          take: 5,
          select: {
            id: true,
            title: true,
            slug: true,
            viewCount: true,
            likeCount: true,
            bookmarkCount: true,
            publishedAt: true,
            readTime: true,
          },
        }),
        db.blog.findMany({
          where: { ...authorFilter, published: true },
          orderBy: { publishedAt: "desc" },
          take: 10,
          select: {
            id: true,
            title: true,
            slug: true,
            publishedAt: true,
            viewCount: true,
            likeCount: true,
          },
        }),
      ])

    const totalViews = blogs.reduce((sum, b) => sum + b.viewCount, 0)
    const totalLikes = blogs.reduce((sum, b) => sum + b.likeCount, 0)
    const totalBookmarks = blogs.reduce((sum, b) => sum + b.bookmarkCount, 0)

    const blogsByCategory = categoryStats
      .map((c) => ({
        name: c.name,
        slug: c.slug,
        count: c._count.blogs,
        color: (c as { color?: string }).color || "#4A90E2",
      }))
      .filter((c) => c.count > 0)

    return NextResponse.json({
      totalBlogs: blogs.length,
      totalPublished: publishedBlogs,
      totalDrafts: draftBlogs,
      totalViews,
      totalLikes,
      totalBookmarks,
      topBlogs: topBlogs.map((b) => ({
        ...b,
        publishedAt: b.publishedAt?.toISOString() || "",
      })),
      blogsByCategory,
      recentActivity: recentActivity.map((b) => ({
        ...b,
        publishedAt: b.publishedAt?.toISOString() || "",
        views: b.viewCount,
        likes: b.likeCount,
      })),
    })
  } catch (err) {
    console.error("[api/blogs/analytics] error:", err)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
