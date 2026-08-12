import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { slugify } from "@/lib/storage"
import { PERMISSIONS, hasPermission } from "@/lib/rbac"

/**
 * PUT /api/member/profile
 * Updates the authenticated user's own profile, team member record, and social links.
 */
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      bio,
      profileImage,
      strengths,
      socialLinks,
    } = body as {
      name?: string
      bio?: string
      profileImage?: string
      strengths?: string[]
      socialLinks?: { platform: string; url: string }[]
    }

    // Validate inputs (basic XSS-prevention via trimming/length limits)
    const safeName = (name || "").toString().trim().slice(0, 100)
    const safeBio = (bio || "").toString().slice(0, 1000)
    const safeImage = (profileImage || "").toString().slice(0, 500)
    const safeStrengths = Array.isArray(strengths)
      ? strengths.filter((s) => typeof s === "string").map((s) => s.toString().trim().slice(0, 50)).slice(0, 20)
      : []

    // Update user record
    await db.user.update({
      where: { id: session.user.id },
      data: { name: safeName, image: safeImage },
    })

    // Find or create team member
    let teamMember = await db.teamMember.findUnique({
      where: { userId: session.user.id },
    })

    if (!teamMember) {
      // Create team member linked to user
      teamMember = await db.teamMember.create({
        data: {
          userId: session.user.id,
          name: safeName,
          bio: safeBio,
          profileImage: safeImage,
          strengths: JSON.stringify(safeStrengths),
          category: "Volunteer",
          displayOrder: 999,
        },
      })
    } else {
      teamMember = await db.teamMember.update({
        where: { id: teamMember.id },
        data: {
          name: safeName,
          bio: safeBio,
          profileImage: safeImage,
          strengths: JSON.stringify(safeStrengths),
        },
      })
    }

    // Rebuild social links (delete and recreate)
    if (socialLinks && Array.isArray(socialLinks)) {
      await db.socialLink.deleteMany({ where: { teamMemberId: teamMember.id } })
      for (const link of socialLinks) {
        if (!link || !link.platform || !link.url) continue
        const url = link.url.toString().trim().slice(0, 500)
        if (!url) continue
        await db.socialLink.create({
          data: {
            teamMemberId: teamMember.id,
            platform: link.platform.toString().toLowerCase(),
            url,
          },
        }).catch(() => {
          // ignore unique constraint violations for duplicates
        })
      }
    }

    // Audit log
    await logAudit({
      actorId: session.user.id,
      action: "USER_UPDATED",
      entityType: "User",
      entityId: session.user.id,
      metadata: { fields: ["name", "position", "bio", "profileImage", "strengths", "socialLinks"] },
    })

    return NextResponse.json({ ok: true, teamMemberId: teamMember.id })
  } catch (err) {
    console.error("[api/member/profile] error:", err)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}

/**
 * GET /api/member/profile
 * Returns the authenticated user's own profile.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        userRoles: { include: { role: true } },
        teamMember: { include: { socialLinks: true } },
        blogAuthor: true,
      },
    })
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      rollNumber: user.rollNumber,
      image: user.image,
      roles: user.userRoles.map((ur) => ur.role.name),
      teamMember: user.teamMember
        ? {
            ...user.teamMember,
            strengths: (() => {
              try {
                return JSON.parse(user.teamMember.strengths || "[]")
              } catch {
                return []
              }
            })(),
          }
        : null,
      blogAuthor: user.blogAuthor,
    })
  } catch (err) {
    console.error("[api/member/profile] error:", err)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
