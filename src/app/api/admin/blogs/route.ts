import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { ROLES } from "@/lib/rbac"
import { slugify } from "@/lib/storage"

/**
 * Admin/Author endpoints for managing blog posts.
 *
 * GET    /api/admin/blogs                 -> list all blogs
 * POST   /api/admin/blogs                 -> create a new blog (draft)
 * PUT    /api/admin/blogs?id=<id>         -> update an existing blog
 * DELETE /api/admin/blogs?id=<id>         -> delete a blog
 */
async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  const roles = session.user.roles || []
  // Authors, ADMIN and SUPER_ADMIN all use this endpoint;
  // per-blog ownership check happens in PUT/DELETE.
  const isAdminLike = roles.includes(ROLES.SUPER_ADMIN) || roles.includes(ROLES.ADMIN)
  if (!isAdminLike && !roles.includes(ROLES.BLOG_AUTHOR)) return null
  return { session, roles }
}

export async function GET() {
  const ctx = await requireAuth()
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const blogs = await db.blog.findMany({
    include: { author: true, category: true, tags: { include: { tag: true } } },
    orderBy: { createdAt: "desc" },
  })

  // Authors only see their own blogs (ADMIN + SUPER_ADMIN see all)
  let filtered = blogs
  const canSeeAll = ctx.roles.includes(ROLES.SUPER_ADMIN) || ctx.roles.includes(ROLES.ADMIN)
  if (!canSeeAll) {
    const myAuthor = await db.blogAuthor.findUnique({ where: { userId: ctx.session.user.id } })
    filtered = blogs.filter((b) => b.authorId === myAuthor?.id)
  }

  return NextResponse.json(filtered)
}

export async function POST(request: Request) {
  const ctx = await requireAuth()
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const {
    title,
    slug,
    excerpt,
    content,
    categoryId,
    coverImage,
    readTime,
    tags,
    featured,
  } = body as {
    title?: string
    slug?: string
    excerpt?: string
    content?: string
    categoryId?: string
    coverImage?: string
    readTime?: string
    tags?: string[]
    featured?: boolean
  }

  if (!title || !slug || !excerpt) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Get or create BlogAuthor record for this user
  let author = await db.blogAuthor.findUnique({ where: { userId: ctx.session.user.id } })
  const isAdminAuthor = ctx.roles.includes(ROLES.SUPER_ADMIN) || ctx.roles.includes(ROLES.ADMIN)
  if (!author) {
    const userName = ctx.session.user.name || "Anonymous Author"
    author = await db.blogAuthor.create({
      data: {
        userId: ctx.session.user.id,
        displayName: userName,
        avatar: ctx.session.user.image || null,
        isApproved: isAdminAuthor, // admins auto-approved
      },
    })
  }

  // Non-admins require author approval
  if (!isAdminAuthor && !author.isApproved) {
    return NextResponse.json({ error: "Your author status is pending approval" }, { status: 403 })
  }

  const safeSlug = slugify(slug)
  const existing = await db.blog.findUnique({ where: { slug: safeSlug } })
  if (existing) {
    return NextResponse.json({ error: "Slug already in use" }, { status: 409 })
  }

  const blog = await db.blog.create({
    data: {
      title: title.toString().slice(0, 300),
      slug: safeSlug,
      excerpt: excerpt.toString().slice(0, 500),
      content: content?.toString() || "",
      categoryId: categoryId || null,
      coverImage: coverImage?.toString().slice(0, 500) || null,
      readTime: readTime?.toString().slice(0, 50) || "5 min read",
      featured: !!featured,
      published: false, // drafts start unpublished
      authorId: author.id,
      createdById: ctx.session.user.id,
    },
  })

  // Tag associations
  if (Array.isArray(tags)) {
    for (const t of tags) {
      if (typeof t !== "string") continue
      const tSlug = slugify(t)
      const tag = await db.blogTag.upsert({
        where: { slug: tSlug },
        update: {},
        create: { name: t, slug: tSlug },
      })
      try {
        await db.blogTagMap.create({ data: { blogId: blog.id, tagId: tag.id } })
      } catch {
        // ignore dups
      }
    }
  }

  await logAudit({
    actorId: ctx.session.user.id,
    action: "BLOG_CREATED",
    entityType: "Blog",
    entityId: blog.id,
    metadata: { title, slug: safeSlug },
  })

  return NextResponse.json({
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt,
    content: blog.content,
    coverImage: blog.coverImage || "",
    published: blog.published,
    featured: blog.featured,
    readTime: blog.readTime || "",
    viewCount: blog.viewCount,
    publishedAt: blog.publishedAt?.toISOString() || null,
    createdAt: blog.createdAt.toISOString(),
    authorId: blog.authorId || "",
    authorName: author.displayName,
    categoryId: blog.categoryId || "",
    categoryName: "—",
    tags: tags || [],
  })
}

export async function PUT(request: Request) {
  const ctx = await requireAuth()
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(request.url)
  const id = url.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const body = await request.json()
  if (body.id && body.id !== id) {
    return NextResponse.json({ error: "id mismatch" }, { status: 400 })
  }

  const existing = await db.blog.findUnique({ where: { id }, include: { author: true } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Ownership check: authors can only edit their own blogs; ADMIN + SUPER_ADMIN can edit any
  const canEditAny = ctx.roles.includes(ROLES.SUPER_ADMIN) || ctx.roles.includes(ROLES.ADMIN)
  if (!canEditAny) {
    const myAuthor = await db.blogAuthor.findUnique({ where: { userId: ctx.session.user.id } })
    if (existing.authorId !== myAuthor?.id) {
      return NextResponse.json({ error: "You can only edit your own blogs" }, { status: 403 })
    }
  }

  const data: any = {}
  if (typeof body.title === "string") data.title = body.title.slice(0, 300)
  if (typeof body.slug === "string") {
    const newSlug = slugify(body.slug)
    if (newSlug !== existing.slug) {
      const conflict = await db.blog.findUnique({ where: { slug: newSlug } })
      if (conflict && conflict.id !== id) {
        return NextResponse.json({ error: "Slug already in use" }, { status: 409 })
      }
      data.slug = newSlug
    }
  }
  if (typeof body.excerpt === "string") data.excerpt = body.excerpt.slice(0, 500)
  if (typeof body.content === "string") data.content = body.content
  if (typeof body.coverImage === "string") data.coverImage = body.coverImage.slice(0, 500)
  if (typeof body.readTime === "string") data.readTime = body.readTime.slice(0, 50)
  if (typeof body.featured === "boolean") data.featured = body.featured
  if (typeof body.categoryId === "string") data.categoryId = body.categoryId || null

  // Publish toggle — enforce PUBLISH_BLOG permission.
  // Only ADMIN and SUPER_ADMIN can publish or unpublish posts.
  // BLOG_AUTHORs can save edits to drafts, but cannot publish themselves.
  if (typeof body.published === "boolean") {
    const canPublish = ctx.roles.includes(ROLES.SUPER_ADMIN) || ctx.roles.includes(ROLES.ADMIN)
    if (!canPublish) {
      return NextResponse.json(
        { error: "You do not have permission to publish posts. Ask an admin." },
        { status: 403 },
      )
    }
    data.published = body.published
    if (body.published && !existing.publishedAt) {
      data.publishedAt = new Date()
    }
    if (!body.published) {
      data.publishedAt = null
    }
  }

  const updated = await db.blog.update({
    where: { id },
    data,
  })

  // Tag updates
  if (Array.isArray(body.tags)) {
    await db.blogTagMap.deleteMany({ where: { blogId: id } })
    for (const t of body.tags) {
      if (typeof t !== "string") continue
      const tSlug = slugify(t)
      const tag = await db.blogTag.upsert({
        where: { slug: tSlug },
        update: {},
        create: { name: t, slug: tSlug },
      })
      try {
        await db.blogTagMap.create({ data: { blogId: id, tagId: tag.id } })
      } catch {
        // ignore dups
      }
    }
  }

  await logAudit({
    actorId: ctx.session.user.id,
    action: data.published ? "BLOG_PUBLISHED" : "BLOG_UPDATED",
    entityType: "Blog",
    entityId: id,
    metadata: { fields: Object.keys(data) },
  })

  const refreshed = await db.blog.findUnique({
    where: { id: updated.id },
    include: { author: true, category: true, tags: { include: { tag: true } } },
  })

  return NextResponse.json({
    id: refreshed!.id,
    title: refreshed!.title,
    slug: refreshed!.slug,
    excerpt: refreshed!.excerpt,
    content: refreshed!.content,
    coverImage: refreshed!.coverImage || "",
    published: refreshed!.published,
    featured: refreshed!.featured,
    readTime: refreshed!.readTime || "",
    viewCount: refreshed!.viewCount,
    publishedAt: refreshed!.publishedAt?.toISOString() || null,
    createdAt: refreshed!.createdAt.toISOString(),
    authorId: refreshed!.authorId || "",
    authorName: refreshed!.author?.displayName || "—",
    categoryId: refreshed!.categoryId || "",
    categoryName: refreshed!.category?.name || "—",
    tags: refreshed!.tags.map((tm) => tm.tag.name),
  })
}

export async function DELETE(request: Request) {
  const ctx = await requireAuth()
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(request.url)
  const id = url.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const existing = await db.blog.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const canDeleteAny = ctx.roles.includes(ROLES.SUPER_ADMIN) || ctx.roles.includes(ROLES.ADMIN)
  if (!canDeleteAny) {
    const myAuthor = await db.blogAuthor.findUnique({ where: { userId: ctx.session.user.id } })
    if (existing.authorId !== myAuthor?.id) {
      return NextResponse.json({ error: "You can only delete your own blogs" }, { status: 403 })
    }
  }

  await db.blog.delete({ where: { id } })

  await logAudit({
    actorId: ctx.session.user.id,
    action: "BLOG_DELETED",
    entityType: "Blog",
    entityId: id,
    metadata: { title: existing.title },
  })

  return NextResponse.json({ ok: true })
}
