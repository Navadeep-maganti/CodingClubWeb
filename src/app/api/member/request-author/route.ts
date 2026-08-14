import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { logAudit } from "@/lib/audit"

/**
 * Endpoint for authenticated members to apply/request Blog Author status.
 *
 * POST /api/member/request-author
 * body optional: { displayName?: string, bio?: string }
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  let body: { displayName?: string; bio?: string } = {}
  try {
    body = await request.json()
  } catch {
    // empty body is fine
  }

  const existingAuthor = await db.blogAuthor.findUnique({
    where: { userId },
  })

  if (existingAuthor) {
    if (existingAuthor.isApproved) {
      return NextResponse.json({
        message: "You are already an approved Blog Author.",
        author: existingAuthor,
      })
    }

    // Update details if pending
    const updated = await db.blogAuthor.update({
      where: { id: existingAuthor.id },
      data: {
        displayName: body.displayName || existingAuthor.displayName || session.user.name || "Member",
        bio: body.bio || existingAuthor.bio || null,
        avatar: session.user.image || existingAuthor.avatar || null,
      },
    })

    return NextResponse.json({
      message: "Author request is pending review by an Administrator.",
      author: updated,
    })
  }

  // Create new pending BlogAuthor request
  const newAuthor = await db.blogAuthor.create({
    data: {
      userId,
      displayName: body.displayName || session.user.name || "Club Member",
      bio: body.bio || null,
      avatar: session.user.image || null,
      isApproved: false,
    },
  })

  await logAudit({
    actorId: userId,
    action: "BLOG_AUTHOR_REQUESTED",
    entityType: "BlogAuthor",
    entityId: newAuthor.id,
    metadata: { displayName: newAuthor.displayName },
  })

  return NextResponse.json({
    message: "Author request submitted successfully. An Administrator will review your application.",
    author: newAuthor,
  })
}
