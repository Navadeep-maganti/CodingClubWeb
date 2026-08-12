"use client"

import { useState, useEffect, Suspense } from "react"
import { Search, Calendar, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  author: { name: string; avatar: string; bio: string }
  publishedAt: string
  readTime: string
  category: string
  tags: string[]
  featured: boolean
  image: string
}

const categories = [
  "All",
  "Web Development",
  "Interview Experience",
  "Machine Learning",
  "DSA Concepts",
  "Project Walkthrough",
  "Latest Tech",
]

function BlogClientInner() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<{ blog_hero_title?: string; blog_hero_description?: string }>({})

  useEffect(() => {
    fetch("/api/blogs")
      .then((r) => r.json())
      .then((data: BlogPost[]) => { setBlogPosts(data); setLoading(false) })
      .catch(() => setLoading(false))
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => {})
  }, [])

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const featuredPosts = filteredPosts.filter((post) => post.featured)
  const regularPosts = filteredPosts.filter((post) => !post.featured)

  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading font-bold text-5xl sm:text-6xl lg:text-7xl mb-6"
          >
            <span className="gradient-text-premium">{settings.blog_hero_title || "Blog"}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8"
          >
            {settings.blog_hero_description ||
              "Insights, tutorials, and experiences from our coding community. Learn from fellow developers and share your knowledge."}
          </motion.p>

          <div className="max-w-4xl mx-auto">
            <div className="glass rounded-lg p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#B0B0B0]" />
                  <input
                    type="text"
                    placeholder="Search articles, tags, or topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#1A1F2E] border border-[#4A90E2]/30 rounded-lg text-[#E0E0E0] placeholder-[#B0B0B0] focus:outline-none focus:border-[#4A90E2]"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 bg-[#1A1F2E] border border-[#4A90E2]/30 rounded-lg text-[#E0E0E0] focus:outline-none focus:border-[#4A90E2]"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading && (
        <section className="px-4 sm:px-6 lg:px-8 pb-16 relative z-10">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-[#B0B0B0]">Loading articles...</p>
          </div>
        </section>
      )}

      {!loading && featuredPosts.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 mb-16 relative z-10">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-heading font-bold text-3xl mb-8">
              <span className="gradient-text">Featured Articles</span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <article className="glass glass-hover rounded-lg overflow-hidden group cursor-pointer">
                    <div className="relative">
                      <img src={post.image || "/placeholder.svg"} alt={post.title} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-[#4A90E2] text-white rounded-full text-sm font-medium">Featured</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4 text-sm text-[#B0B0B0]">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {post.readTime}
                        </div>
                        <span className="px-2 py-1 bg-[#50C878]/20 text-[#50C878] rounded text-xs">{post.category}</span>
                      </div>
                      <h3 className="font-heading font-bold text-xl text-white mb-3 group-hover:text-[#4A90E2] transition-colors">{post.title}</h3>
                      <p className="text-[#B0B0B0] mb-4 leading-relaxed">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} className="w-8 h-8 rounded-full mr-3" />
                          <p className="text-[#E0E0E0] text-sm font-medium">{post.author.name}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-[#4A90E2] group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {!loading && (
        <section className="px-4 sm:px-6 lg:px-8 pb-16 relative z-10">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-heading font-bold text-3xl mb-8">
              <span className="gradient-text">Latest Articles</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <article className="glass glass-hover rounded-lg overflow-hidden group cursor-pointer">
                    <img src={post.image || "/placeholder.svg"} alt={post.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-3 text-sm text-[#B0B0B0]">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {post.readTime}
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-[#FF6B6B]/20 text-[#FF6B6B] rounded text-xs mb-3 inline-block">{post.category}</span>
                      <h3 className="font-heading font-bold text-lg text-white mb-3 group-hover:text-[#4A90E2] transition-colors">{post.title}</h3>
                      <p className="text-[#B0B0B0] text-sm mb-4 leading-relaxed">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} className="w-6 h-6 rounded-full mr-2" />
                          <p className="text-[#E0E0E0] text-sm">{post.author.name}</p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-[#4A90E2]/20 text-[#4A90E2] rounded text-xs">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
            {filteredPosts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-[#B0B0B0] text-lg">No articles found matching your search criteria.</p>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  )
}

export default function BlogClient() {
  return (
    <Suspense fallback={
      <div className="pt-32 text-center relative z-10">
        <Sparkles className="w-6 h-6 animate-spin mx-auto text-blue-400 mb-4" />
        <p className="text-gray-400">Loading blog...</p>
      </div>
    }>
      <BlogClientInner />
    </Suspense>
  )
}
