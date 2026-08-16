import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * GET /api/blog/authors
 * Returns all approved blog authors with their post counts.
 * Public endpoint (used by /blog/author pages and the blog sidebar).
 *
 * Optional query params:
 *   - id: filter to a single author
 *
 * Response shape: array of
 *   { id, displayName, bio, avatar, role, skills:string[], github, linkedin, twitter,
 *     postCount, totalViews, totalLikes }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const authorId = searchParams.get("id")

    const authors = await db.blogAuthor.findMany({
      where: {
        isApproved: true,
        ...(authorId ? { id: authorId } : {}),
      },
      include: {
        blogs: {
          where: { published: true },
          select: {
            id: true,
            viewCount: true,
            likeCount: true,
          },
        },
      },
      orderBy: { displayName: "asc" },
    })

    const formatted = authors.map((a) => {
      let skills: string[] = []
      try {
        skills = JSON.parse(a.skills || "[]")
      } catch {
        skills = []
      }
      return {
        id: a.id,
        displayName: a.displayName,
        bio: a.bio || "",
        avatar: a.avatar || "/placeholder.svg",
        role: a.role || "",
        skills,
        github: a.github || "",
        linkedin: a.linkedin || "",
        twitter: a.twitter || "",
        postCount: a.blogs.length,
        totalViews: a.blogs.reduce((sum, b) => sum + b.viewCount, 0),
        totalLikes: a.blogs.reduce((sum, b) => sum + b.likeCount, 0),
      }
    })

    return NextResponse.json(formatted)
  } catch (err) {
    console.error("[api/blog/authors] error:", err)
    return NextResponse.json({ error: "Failed to fetch authors" }, { status: 500 })
  }
}
