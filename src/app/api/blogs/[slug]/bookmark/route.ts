import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

/**
 * POST /api/blogs/[slug]/bookmark
 * Toggles a bookmark on a blog post for the authenticated user.
 *
 * Response:
 *   200 { bookmarked: boolean, bookmarkCount: number }
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
    const existing = await db.blogBookmark.findUnique({
      where: { blogId_userId: { blogId: blog.id, userId } },
    })

    if (existing) {
      await db.blogBookmark.delete({ where: { id: existing.id } })
      await db.blog.update({
        where: { id: blog.id },
        data: { bookmarkCount: Math.max(0, blog.bookmarkCount - 1) },
      })
      return NextResponse.json({ bookmarked: false, bookmarkCount: Math.max(0, blog.bookmarkCount - 1) })
    }

    const author = await db.blogAuthor.findUnique({ where: { userId } })
    await db.blogBookmark.create({
      data: {
        blogId: blog.id,
        userId,
        authorId: author?.id || null,
      },
    })
    await db.blog.update({
      where: { id: blog.id },
      data: { bookmarkCount: blog.bookmarkCount + 1 },
    })

    return NextResponse.json({ bookmarked: true, bookmarkCount: blog.bookmarkCount + 1 })
  } catch (err) {
    console.error("[api/blogs/[slug]/bookmark] error:", err)
    return NextResponse.json({ error: "Failed to toggle bookmark" }, { status: 500 })
  }
}

/**
 * GET /api/blogs/[slug]/bookmark
 * Returns whether the current user has bookmarked this blog.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ bookmarked: false })
    }
    const { slug } = await params
    const blog = await db.blog.findUnique({ where: { slug }, select: { id: true } })
    if (!blog) return NextResponse.json({ bookmarked: false })

    const existing = await db.blogBookmark.findUnique({
      where: { blogId_userId: { blogId: blog.id, userId: session.user.id } },
    })
    return NextResponse.json({ bookmarked: !!existing })
  } catch {
    return NextResponse.json({ bookmarked: false })
  }
}
