import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { ROLES, ADMIN_DASHBOARD_ROLES, getHighestRole, type RoleName } from "@/lib/rbac"
import AdminDashboardClient from "@/components/admin-dashboard-client"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/admin")
  }

  // SUPER_ADMIN, ADMIN, and BLOG_AUTHOR can all access the dashboard,
  // but the tabs each role sees are gated client-side via the `role` prop.
  const roles = session.user.roles || []
  if (!roles.some((r) => ADMIN_DASHBOARD_ROLES.includes(r as never))) {
    redirect("/dashboard/unauthorized")
  }

  const highestRole: RoleName = getHighestRole(roles) || ROLES.MEMBER

  // Default tab depends on the user's highest role:
  //   SUPER_ADMIN → members
  //   ADMIN       → team
  //   BLOG_AUTHOR → blogs
  const defaultTab =
    highestRole === ROLES.SUPER_ADMIN ? "members"
    : highestRole === ROLES.ADMIN ? "team"
    : "blogs"

  // Batch 1: User & Core Data
  const [users, approvedRolls, teamMembers, blogs, blogAuthors] = await Promise.all([
    db.user.findMany({
      where: { NOT: { email: { startsWith: "placeholder+" } } },
      include: { userRoles: { include: { role: true } }, teamMember: true, blogAuthor: true },
      orderBy: { createdAt: "desc" },
    }),
    db.approvedRollNumber.findMany({ orderBy: { createdAt: "desc" } }),
    db.teamMember.findMany({
      include: { socialLinks: true, user: { select: { email: true } } },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    }),
    db.blog.findMany({
      include: { author: true, category: true, tags: { include: { tag: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.blogAuthor.findMany({ include: { user: { select: { email: true, name: true } } } }),
  ])

  // Batch 2: Audit Logs & Blog Categories
  const [auditLogs, categories, tags, blogList, siteSettingsRows] = await Promise.all([
    db.auditLog.findMany({
      take: 200,
      orderBy: { createdAt: "desc" },
      include: { actor: { select: { name: true, email: true } } },
    }),
    db.blogCategory.findMany({ orderBy: { name: "asc" } }),
    db.blogTag.findMany({ orderBy: { name: "asc" } }),
    db.blog.findMany({
      where: { published: true },
      orderBy: { viewCount: "desc" },
      take: 10,
      select: { id: true, title: true, slug: true, viewCount: true, publishedAt: true },
    }),
    db.siteSetting.findMany(),
  ])

  // Batch 3: CMS & Content
  const [pillars, domains, heroStats, events, missions] = await Promise.all([
    db.pillar.findMany({ orderBy: { displayOrder: "asc" } }),
    db.domain.findMany({ orderBy: { displayOrder: "asc" } }),
    db.heroStat.findMany({ orderBy: { displayOrder: "asc" } }),
    db.event.findMany({ orderBy: [{ displayOrder: "asc" }, { date: "asc" }] }),
    db.missionCard.findMany({ orderBy: { displayOrder: "asc" } }),
  ])

  // Batch 4: Resources & Footer
  const [resourceItems, footerSocial, footerQuickLinks, footerContacts] = await Promise.all([
    db.resourceItem.findMany({ orderBy: { displayOrder: "asc" } }),
    db.footerLink.findMany({ orderBy: { displayOrder: "asc" } }),
    db.footerQuickLink.findMany({ orderBy: { displayOrder: "asc" } }),
    db.footerContact.findMany({ orderBy: { displayOrder: "asc" } }),
  ])

  // Build site settings map
  const siteSettings: Record<string, string> = {}
  for (const row of siteSettingsRows) siteSettings[row.key] = row.value

  // Group resource items
  const resourceGroups = {
    roadmaps: resourceItems.filter((r) => r.category === "roadmap"),
    toolkits: resourceItems.filter((r) => r.category === "toolkit"),
    projects: resourceItems.filter((r) => r.category === "project"),
    linkCategories: resourceItems.filter((r) => r.category === "link_category"),
    links: resourceItems.filter((r) => r.category === "link"),
  }

  // Helper for JSON arrays
  const parseArr = (v: string | null | undefined): string[] => {
    if (!v) return []
    try {
      const p = JSON.parse(v)
      if (Array.isArray(p)) return p.map((x) => String(x))
    } catch {
      // ignore
    }
    return []
  }

  // Serialize
  const data = {
    activeTab: (await searchParams).tab || defaultTab,
    role: highestRole,
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name || "",
      rollNumber: u.rollNumber || "",
      image: u.image || "",
      isActive: u.isActive,
      roles: u.userRoles.map((ur) => ur.role.name),
      createdAt: u.createdAt.toISOString(),
      hasTeamMember: !!u.teamMember,
      isBlogAuthor: !!u.blogAuthor,
    })),
    approvedRolls: approvedRolls.map((r) => ({
      id: r.id,
      rollNumber: r.rollNumber,
      email: r.email || "",
      isUsed: r.isUsed,
      notes: r.notes || "",
      createdAt: r.createdAt.toISOString(),
    })),
    teamMembers: teamMembers.map((m) => ({
      id: m.id,
      name: m.name,
      bio: m.bio || "",
      profileImage: m.profileImage || "",
      strengths: (() => {
        try {
          return JSON.parse(m.strengths || "[]")
        } catch {
          return []
        }
      })(),
      displayOrder: m.displayOrder,
      isActive: m.isActive,
      category: m.category,
      socialLinks: m.socialLinks.map((s) => ({ platform: s.platform, url: s.url })),
      userEmail: m.user?.email || "",
    })),
    blogs: blogs.map((b) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      content: b.content,
      coverImage: b.coverImage || "",
      published: b.published,
      featured: b.featured,
      readTime: b.readTime || "",
      viewCount: b.viewCount,
      publishedAt: b.publishedAt?.toISOString() || null,
      createdAt: b.createdAt.toISOString(),
      authorId: b.authorId || "",
      authorName: b.author?.displayName || "—",
      categoryId: b.categoryId || "",
      categoryName: b.category?.name || "—",
      tags: b.tags.map((tm) => tm.tag.name),
    })),
    blogAuthors: blogAuthors.map((a) => ({
      id: a.id,
      displayName: a.displayName,
      bio: a.bio || "",
      avatar: a.avatar || "",
      isApproved: a.isApproved,
      userId: a.userId || "",
      userEmail: a.user?.email || "",
      userName: a.user?.name || "",
    })),
    auditLogs: auditLogs.map((l) => ({
      id: l.id,
      actorId: l.actorId || "",
      actorName: l.actor?.name || l.actor?.email || "system",
      action: l.action,
      entityType: l.entityType,
      entityId: l.entityId || "",
      metadata: l.metadata || "",
      ipAddress: l.ipAddress || "",
      createdAt: l.createdAt.toISOString(),
    })),
    categories: categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
    tags: tags.map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
    stats: {
      totalUsers: users.length,
      approvedRolls: approvedRolls.length,
      unusedRolls: approvedRolls.filter((r) => !r.isUsed).length,
      teamMembers: teamMembers.length,
      blogs: blogs.length,
      publishedBlogs: blogs.filter((b) => b.published).length,
      blogAuthors: blogAuthors.length,
      auditLogs: auditLogs.length,
    },
    topBlogs: blogList.map((b) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      viewCount: b.viewCount,
      publishedAt: b.publishedAt?.toISOString() || "",
    })),
    // === Dynamic content (CMS) ===
    siteSettings,
    pillars: pillars.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      iconName: p.iconName,
      colorFrom: p.colorFrom,
      colorTo: p.colorTo,
      features: parseArr(p.features),
      displayOrder: p.displayOrder,
      isActive: p.isActive,
    })),
    domains: domains.map((d) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      iconName: d.iconName,
      color: d.color,
      displayOrder: d.displayOrder,
      isActive: d.isActive,
    })),
    heroStats: heroStats.map((s) => ({
      id: s.id,
      iconName: s.iconName,
      value: s.value,
      label: s.label,
      description: s.description || "",
      gradient: s.gradient,
      displayOrder: s.displayOrder,
      isActive: s.isActive,
    })),
    events: events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      date: e.date.toISOString(),
      time: e.time,
      location: e.location,
      type: e.type,
      status: e.status,
      image: e.image || "",
      registrations: e.registrations,
      maxRegistrations: e.maxRegistrations,
      registrationUrl: e.registrationUrl || "",
      displayOrder: e.displayOrder,
      isActive: e.isActive,
    })),
    missions: missions.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      iconName: m.iconName,
      displayOrder: m.displayOrder,
      isActive: m.isActive,
    })),
    resourceRoadmaps: resourceGroups.roadmaps.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description || "",
      difficulty: r.difficulty || "",
      duration: r.duration || "",
      topics: parseArr(r.topics),
      url: r.url || "",
      displayOrder: r.displayOrder,
      isActive: r.isActive,
    })),
    resourceToolkits: resourceGroups.toolkits.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description || "",
      tools: parseArr(t.tools),
      toolkitCategory: t.toolkitCategory || "",
      downloads: t.downloads,
      displayOrder: t.displayOrder,
      isActive: t.isActive,
    })),
    resourceProjects: resourceGroups.projects.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description || "",
      tech: parseArr(p.tech),
      author: p.author || "",
      stars: p.stars,
      github: p.github || "",
      displayOrder: p.displayOrder,
      isActive: p.isActive,
    })),
    resourceLinkCategories: resourceGroups.linkCategories.map((c) => ({
      id: c.id,
      title: c.title,
      displayOrder: c.displayOrder,
      isActive: c.isActive,
      links: resourceGroups.links
        .filter((l) => l.parentId === c.id)
        .map((l) => ({
          id: l.id,
          title: l.title,
          description: l.description || "",
          url: l.url || "",
          displayOrder: l.displayOrder,
          isActive: l.isActive,
        })),
    })),
    footerSocial: footerSocial.map((s) => ({
      id: s.id,
      platform: s.platform,
      label: s.label,
      url: s.url,
      iconName: s.iconName,
      displayOrder: s.displayOrder,
      isActive: s.isActive,
    })),
    footerQuickLinks: footerQuickLinks.map((q) => ({
      id: q.id,
      label: q.label,
      href: q.href,
      displayOrder: q.displayOrder,
      isActive: q.isActive,
    })),
    footerContacts: footerContacts.map((c) => ({
      id: c.id,
      label: c.label,
      value: c.value,
      iconName: c.iconName,
      displayOrder: c.displayOrder,
      isActive: c.isActive,
    })),
  }

  return <AdminDashboardClient data={data} />
}
