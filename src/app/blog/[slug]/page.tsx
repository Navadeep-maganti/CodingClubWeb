import { notFound } from "next/navigation"
import PremiumPageBackground from "@/components/premium-page-background"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, Tag, ArrowLeft, Share2, Bookmark, Heart } from "lucide-react"
import Link from "next/link"
import { db } from "@/lib/db"
import { ReadingProgress, AuthorRow } from "@/components/blog-post-actions"

/**
 * Server component - fetches a single blog post by slug from the database.
 * Preserves the original UI exactly.
 */
async function getBlogPost(slug: string) {
  const post = await db.blog.findUnique({
    where: { slug, published: true },
    include: {
      author: true,
      category: true,
      tags: { include: { tag: true } },
    },
  })
  if (!post) return null

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    author: {
      name: post.author?.displayName || "Coding Club",
      avatar: post.author?.avatar || "/placeholder.svg",
      bio: post.author?.bio || "Coding Club Member",
    },
    publishedAt: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
    readTime: post.readTime || "5 min read",
    category: post.category?.name || "General",
    tags: post.tags.map((tm) => tm.tag.name),
    image: post.coverImage || "/placeholder.svg",
  }
}

// Helper to render the same markdown->HTML transform used by the original page
function renderContent(content: string): string {
  return content
    .replace(/^# (.*$)/gm, '<h1 class="font-heading font-bold text-3xl text-white mb-6 mt-8">$1</h1>')
    .replace(/^## (.*$)/gm, '<h2 class="font-heading font-bold text-2xl text-white mb-4 mt-6">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="font-heading font-bold text-xl text-white mb-3 mt-4">$1</h3>')
    .replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      '<pre class="bg-[#1A1F2E] rounded-lg p-4 overflow-x-auto mb-4"><code class="text-[#E0E0E0] text-sm">$2</code></pre>',
    )
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-[#1A1F2E] px-2 py-1 rounded text-[#4A90E2] text-sm">$1</code>',
    )
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-[#B0B0B0]">$1</em>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/^(?!<[h|p|u|o|c])/gm, '<p class="mb-4">')
    .replace(/<p class="mb-4">(<[h|u|o|c])/g, "$1")
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    return (
      <main className="min-h-screen relative">
      <PremiumPageBackground />
        <Navigation />
        <div className="pt-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-heading font-bold text-4xl text-white mb-4">Post Not Found</h1>
            <p className="text-[#B0B0B0] mb-8">The blog post you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/blog">
              <Button className="bg-[#4A90E2] hover:bg-[#5BA0F2]">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  // Increment view count asynchronously (fire-and-forget on the server)
  db.blog
    .update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {})

  return (
    <main className="min-h-screen relative">
      <PremiumPageBackground />
      <ReadingProgress />

      <Navigation />

      {/* Article Header */}
      <article className="pt-24 pb-16 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link
            href="/blog"
            className="inline-flex items-center text-[#4A90E2] hover:text-[#5BA0F2] mb-8 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>

          {/* Article Meta */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-[#B0B0B0]">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(post.publishedAt).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {post.readTime}
              </div>
              <span className="px-3 py-1 bg-[#4A90E2]/20 text-[#4A90E2] rounded-full text-sm">{post.category}</span>
            </div>

            <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Author Info */}
            <AuthorRow author={post.author} />

            {/* Featured Image */}
            <img
              src={post.image || "/placeholder.svg"}
              alt={post.title}
              className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-lg mb-8"
            />
          </div>

          {/* Article Content */}
          <div className="glass rounded-lg p-8 mb-8">
            <div className="prose prose-invert prose-lg max-w-none">
              <div
                className="text-[#E0E0E0] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-[#4A90E2]/20 text-[#4A90E2] rounded-full text-sm">
                <Tag className="inline h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>

          {/* Author Card */}
          <div className="glass rounded-lg p-6">
            <div className="flex items-center">
              <img
                src={post.author.avatar || "/placeholder.svg"}
                alt={post.author.name}
                className="w-16 h-16 rounded-full mr-4"
              />
              <div className="flex-1">
                <h3 className="font-heading font-bold text-xl text-white mb-1">{post.author.name}</h3>
                <p className="text-[#B0B0B0] mb-3">{post.author.bio}</p>
                <Button size="sm" className="bg-[#4A90E2] hover:bg-[#5BA0F2]">
                  <User className="mr-2 h-4 w-4" />
                  View Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  )
}
