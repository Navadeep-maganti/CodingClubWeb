import { getServerSession } from "next-auth"
import { redirect, notFound } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { canUserWriteBlogs, ROLES, RoleName } from "@/lib/rbac"
import BlogWriterClient from "@/components/blog/blog-writer-client"

export const metadata = {
  title: "Edit Article — Coding Club NIT AP",
  description: "Edit your blog article.",
}

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default async function BlogEditPage({ params }: EditPageProps) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect(`/api/auth/signin?callbackUrl=/blog/edit/${id}`)
  }

  const userRoles = (session.user.roles || []) as RoleName[]
  const authorRecord = await db.blogAuthor.findUnique({
    where: { userId: session.user.id },
  })

  const isAllowedToWrite = canUserWriteBlogs(userRoles, authorRecord?.isApproved)
  if (!isAllowedToWrite) {
    redirect("/dashboard/unauthorized?reason=blog_author_required")
  }

  const blog = await db.blog.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
    },
  })

  if (!blog) {
    notFound()
  }

  // Non-admins can only edit their own blog posts
  const isAdmin = userRoles.includes(ROLES.SUPER_ADMIN) || userRoles.includes(ROLES.ADMIN)
  if (!isAdmin && blog.authorId !== authorRecord?.id) {
    redirect("/dashboard/unauthorized?reason=blog_author_required")
  }


  // Fetch categories
  const categories = await db.blogCategory.findMany({
    orderBy: { displayOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      color: true,
    },
  })

  return (
    <BlogWriterClient
      initialData={{
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        content: blog.content,
        coverImage: blog.coverImage || "",
        categoryId: blog.categoryId || "",
        tags: blog.tags.map((t) => t.tag.name),
        published: blog.published,
        readTime: blog.readTime || "",
        featured: blog.featured,
      }}
      categories={categories}
      user={{
        id: session.user.id,
        name: session.user.name || "Club Member",
        image: session.user.image || "/placeholder.svg",
        roles: session.user.roles || [],
      }}
    />
  )
}
