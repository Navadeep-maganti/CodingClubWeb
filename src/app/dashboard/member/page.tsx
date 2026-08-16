import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import MemberDashboardClient from "@/components/member-dashboard-client"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export default async function MemberDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/member")
  }

  // Load fresh user data, team member, and roles
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      userRoles: { include: { role: true } },
      teamMember: { include: { socialLinks: true } },
      blogAuthor: true,
    },
  })

  if (!user) {
    redirect("/login?callbackUrl=/dashboard/member&error=Configuration")
  }

  // Serialize for client component
  const userData = {
    id: user.id,
    email: user.email,
    name: user.name || "",
    rollNumber: user.rollNumber || "",
    image: user.image || "",
    roles: user.userRoles.map((ur) => ur.role.name),
    teamMember: user.teamMember
      ? {
          id: user.teamMember.id,
          name: user.teamMember.name,
          bio: user.teamMember.bio || "",
          profileImage: user.teamMember.profileImage || "",
          strengths: (() => {
            try {
              return JSON.parse(user.teamMember.strengths || "[]") as string[]
            } catch {
              return []
            }
          })(),
          displayOrder: user.teamMember.displayOrder,
          isActive: user.teamMember.isActive,
          category: user.teamMember.category,
          socialLinks: user.teamMember.socialLinks.map((s) => ({
            platform: s.platform,
            url: s.url,
          })),
        }
      : null,
    blogAuthor: user.blogAuthor
      ? {
          id: user.blogAuthor.id,
          displayName: user.blogAuthor.displayName,
          bio: user.blogAuthor.bio || "",
          avatar: user.blogAuthor.avatar || "",
          isApproved: user.blogAuthor.isApproved,
        }
      : null,
  }

  return <MemberDashboardClient user={userData} />
}
