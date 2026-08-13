import { getServerSession } from "next-auth"
import { redirect, notFound } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
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

  const blog = await db.blog.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
    },
  })

  if (!blog) {
    notFound()
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
