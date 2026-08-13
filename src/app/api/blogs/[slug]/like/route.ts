import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { ROLES } from "@/lib/rbac"

/**
 * POST /api/blogs/[slug]/like
 * Toggles a like on a blog post for the authenticated user.
 *
 * Response:
 *   200 { liked: boolean, likeCount: number }
 *   401 if not authenticated
 *   404 if blog not found
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { slug } = await params
    const blog = await db.blog.findUnique({ where: { slug } })
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    const userId = session.user.id
    const roles = session.user.roles || []
    const isAdminLike = roles.includes(ROLES.SUPER_ADMIN) || roles.includes(ROLES.ADMIN)

    // Check if already liked
    const existing = await db.blogLike.findUnique({
      where: { blogId_userId: { blogId: blog.id, userId } },
    })

    if (existing) {
      // Unlike
      await db.blogLike.delete({ where: { id: existing.id } })
      await db.blog.update({
        where: { id: blog.id },
        data: { likeCount: Math.max(0, blog.likeCount - 1) },
      })
      return NextResponse.json({ liked: false, likeCount: Math.max(0, blog.likeCount - 1) })
    }

    // Like
    // Optionally link to BlogAuthor if user has one
    const author = await db.blogAuthor.findUnique({ where: { userId } })
    await db.blogLike.create({
      data: {
        blogId: blog.id,
        userId,
        authorId: author?.id || null,
      },
    })
    await db.blog.update({
      where: { id: blog.id },
      data: { likeCount: blog.likeCount + 1 },
    })

    return NextResponse.json({
      liked: true,
      likeCount: blog.likeCount + 1,
      adminLike: isAdminLike,
    })
  } catch (err) {
    console.error("[api/blogs/[slug]/like] error:", err)
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 })
  }
}

/**
 * GET /api/blogs/[slug]/like
 * Returns whether the current user has liked this blog.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ liked: false })
    }
    const { slug } = await params
    const blog = await db.blog.findUnique({ where: { slug }, select: { id: true } })
    if (!blog) return NextResponse.json({ liked: false })

    const existing = await db.blogLike.findUnique({
      where: { blogId_userId: { blogId: blog.id, userId: session.user.id } },
    })
    return NextResponse.json({ liked: !!existing })
  } catch {
    return NextResponse.json({ liked: false })
  }
}
