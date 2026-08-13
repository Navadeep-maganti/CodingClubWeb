import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import BlogWriterClient from "@/components/blog/blog-writer-client"

export const metadata = {
  title: "Write an Article — Coding Club NIT AP",
  description: "Share your knowledge, tutorials, and insights with the Coding Club community.",
}

export default async function BlogCreatePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/blog/create")
  }

  // Fetch categories for selection
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
