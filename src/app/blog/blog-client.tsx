"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  TrendingUp,
  Clock,
  Eye,
  Heart,
  Bookmark,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Hash,
  Flame,
  X,
} from "lucide-react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import PremiumPageBackground from "@/components/premium-page-background"
import { cn } from "@/lib/utils"

export interface BlogListItem {
  id: string
  title: string
  slug: string
  excerpt: string
  coverImage: string
  publishedAt: string
  readTime: string
  featured: boolean
  viewCount: number
  likeCount: number
  bookmarkCount: number
  author: { id: string; name: string; avatar: string; bio: string; role: string }
  category: { name: string; slug: string; color: string } | null
  tags: string[]
}

export interface BlogCategoryItem {
  id: string
  name: string
  slug: string
  color: string
  iconName: string
  count: number
}

export interface BlogTagItem {
  id: string
  name: string
  slug: string
}

export interface TrendingItem {
  id: string
  title: string
  slug: string
  excerpt: string
  coverImage: string
  publishedAt: string
  readTime: string
  viewCount: number
  likeCount: number
  author: { name: string; avatar: string; role: string }
  category: { name: string; slug: string; color: string } | null
}

type FilterMode = "latest" | "trending" | "featured" | "most-read"

interface BlogClientProps {
  blogs: BlogListItem[]
  categories: BlogCategoryItem[]
  tags: BlogTagItem[]
  trending: TrendingItem[]
  heroTitle: string
  heroDescription: string
}

export default function BlogClient({
  blogs,
  categories,
  tags,
  trending,
  heroTitle,
  heroDescription,
}: BlogClientProps) {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [filter, setFilter] = useState<FilterMode>("latest")
  const [showFilters, setShowFilters] = useState(false)

  // Filtered + sorted blogs
  const filteredBlogs = useMemo(() => {
    let result = blogs
    if (activeCategory !== "all") {
      result = result.filter((b) => b.category?.slug === activeCategory)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((b) =>
        (b.title + " " + b.excerpt + " " + b.tags.join(" ")).toLowerCase().includes(q),
      )
    }
    switch (filter) {
      case "featured":
        result = [...result].filter((b) => b.featured)
        break
      case "trending":
        result = [...result].sort(
          (a, b) =>
            b.viewCount + b.likeCount * 5 - (a.viewCount + a.likeCount * 5),
        )
        break
      case "most-read":
        result = [...result].sort((a, b) => b.viewCount - a.viewCount)
        break
      case "latest":
      default:
        result = [...result].sort(
          (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
        )
        break
    }
    return result
  }, [blogs, activeCategory, search, filter])

  // The featured story (highest-featured, latest)
  const featuredStory = useMemo(() => {
    const featured = blogs.find((b) => b.featured)
    return featured || blogs[0] || null
  }, [blogs])

  // Latest articles (excluding the featured story)
  const latestArticles = useMemo(() => {
    return filteredBlogs.filter((b) => b.id !== featuredStory?.id)
  }, [filteredBlogs, featuredStory])

  return (
    <main className="min-h-screen relative">
      <PremiumPageBackground />
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 glass rounded-full border border-white/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#4A90E2]" />
            <span className="text-xs font-medium text-gray-300">Coding Club Stories</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-heading font-bold text-5xl sm:text-6xl lg:text-7xl mb-6"
          >
            <span className="gradient-text-premium">{heroTitle}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            {heroDescription}
          </motion.p>
        </div>
      </section>

      {/* Featured Story */}
      {featuredStory && filter === "latest" && activeCategory === "all" && !search && (
        <section className="px-4 sm:px-6 lg:px-8 mb-20 relative z-10">
          <div className="max-w-7xl mx-auto">
            <FeaturedStory story={featuredStory} />
          </div>
        </section>
      )}

      {/* Search + Filters */}
      <section className="px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles, tags, or topics..."
                className="w-full pl-12 pr-4 py-3.5 glass-strong rounded-xl border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A90E2]/50 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {/* Filter chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <FilterChip
                active={filter === "latest"}
                onClick={() => setFilter("latest")}
                icon={<Clock className="w-3.5 h-3.5" />}
                label="Latest"
              />
              <FilterChip
                active={filter === "trending"}
                onClick={() => setFilter("trending")}
                icon={<Flame className="w-3.5 h-3.5" />}
                label="Trending"
              />
              <FilterChip
                active={filter === "featured"}
                onClick={() => setFilter("featured")}
                icon={<Sparkles className="w-3.5 h-3.5" />}
                label="Featured"
              />
              <FilterChip
                active={filter === "most-read"}
                onClick={() => setFilter("most-read")}
                icon={<Eye className="w-3.5 h-3.5" />}
                label="Most Read"
              />
            </div>
          </div>

          {/* Category chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <CategoryChip
              active={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
              label="All Topics"
              count={blogs.length}
            />
            {categories.map((c) => (
              <CategoryChip
                key={c.id}
                active={activeCategory === c.slug}
                onClick={() => setActiveCategory(c.slug)}
                label={c.name}
                count={c.count}
                color={c.color}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trending Section */}
      {filter === "latest" && activeCategory === "all" && !search && trending.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 mb-20 relative z-10">
          <div className="max-w-7xl mx-auto">
            <SectionHeader
              icon={<Flame className="w-5 h-5 text-[#FF6B6B]" />}
              title="Trending Articles"
              subtitle="What the community is reading right now"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trending.slice(0, 3).map((item, i) => (
                <TrendingCard key={item.id} item={item} rank={i + 1} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Articles */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20 relative z-10">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            icon={<Clock className="w-5 h-5 text-[#4A90E2]" />}
            title={search || activeCategory !== "all" || filter !== "latest" ? "Search Results" : "Latest Articles"}
            subtitle={`${filteredBlogs.length} article${filteredBlogs.length === 1 ? "" : "s"}`}
          />
          {filteredBlogs.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestArticles.map((blog, i) => (
                <BlogCard key={blog.id} blog={blog} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Topics / Categories Grid */}
      {filter === "latest" && activeCategory === "all" && !search && categories.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 pb-24 relative z-10">
          <div className="max-w-7xl mx-auto">
            <SectionHeader
              icon={<Hash className="w-5 h-5 text-[#9B59B6]" />}
              title="Explore Topics"
              subtitle="Browse articles by category"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveCategory(c.slug)
                    setFilter("latest")
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                  className="group p-4 glass rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-300 text-left"
                  style={{ ["--cat-color" as string]: c.color }}
                >
                  <div
                    className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center"
                    style={{ background: `${c.color}20`, color: c.color }}
                  >
                    <Hash className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-medium text-white mb-1 group-hover:text-[#4A90E2] transition-colors line-clamp-1">
                    {c.name}
                  </p>
                  <p className="text-xs text-gray-400">{c.count} articles</p>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
}

// ============================================================
// Sub-components
// ============================================================

function FeaturedStory({ story }: { story: BlogListItem }) {
  return (
    <Link href={`/blog/${story.slug}`} className="group block featured-story">
      <div className="absolute inset-0 -z-10">
        <img
          src={story.coverImage}
          alt={story.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#02040A] via-[#02040A]/80 to-transparent" />
      </div>
      <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-4xl">
        {story.category && (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full text-xs font-semibold glass-strong border"
            style={{
              borderColor: `${story.category.color}40`,
              color: story.category.color,
              background: `${story.category.color}15`,
            }}
          >
            <Sparkles className="w-3 h-3" />
            {story.category.name}
          </span>
        )}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-white mb-4 group-hover:text-[#4A90E2] transition-colors duration-300"
        >
          {story.title}
        </motion.h2>
        <p className="text-base sm:text-lg text-gray-300 mb-6 line-clamp-2 max-w-2xl">
          {story.excerpt}
        </p>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <img
              src={story.author.avatar}
              alt={story.author.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10"
            />
            <span className="text-white font-medium">{story.author.name}</span>
          </div>
          <span className="w-1 h-1 bg-gray-500 rounded-full" />
          <span>{story.readTime}</span>
          <span className="w-1 h-1 bg-gray-500 rounded-full" />
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> {story.viewCount}
          </span>
        </div>
        <div className="mt-6 inline-flex items-center gap-2 text-[#4A90E2] font-medium group-hover:gap-3 transition-all">
          Read story
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  )
}

function FilterChip({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap",
        active
          ? "bg-[#4A90E2] text-white shadow-lg shadow-[#4A90E2]/25"
          : "glass text-gray-300 hover:text-white hover:bg-white/5 border border-white/10",
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function CategoryChip({
  active,
  onClick,
  label,
  count,
  color,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
  color?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 whitespace-nowrap",
        active
          ? "text-white shadow-md"
          : "glass text-gray-400 hover:text-white hover:bg-white/5 border border-white/10",
      )}
      style={active ? { background: color || "#4A90E2", borderColor: color || "#4A90E2" } : undefined}
    >
      {label}
      <span className={cn("text-[10px]", active ? "text-white/70" : "text-gray-500")}>
        {count}
      </span>
    </button>
  )
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl glass flex items-center justify-center border border-white/10">
        {icon}
      </div>
      <div>
        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white">{title}</h2>
        <p className="text-sm text-gray-400">{subtitle}</p>
      </div>
    </div>
  )
}

function TrendingCard({ item, rank }: { item: TrendingItem; rank: number }) {
  return (
    <Link href={`/blog/${item.slug}`} className="group block blog-card">
      <div className="glass-strong rounded-2xl overflow-hidden border border-white/10 h-full">
        <div className="relative h-48 overflow-hidden">
          <img
            src={item.coverImage}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FF6B6B] text-white text-xs font-bold">
            <Flame className="w-3 h-3" />
            #{rank}
          </div>
          {item.category && (
            <div className="absolute bottom-3 left-3">
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-semibold glass-strong border"
                style={{
                  borderColor: `${item.category.color}40`,
                  color: item.category.color,
                  background: `${item.category.color}15`,
                }}
              >
                {item.category.name}
              </span>
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="font-bold text-white text-lg mb-2 line-clamp-2 group-hover:text-[#4A90E2] transition-colors">
            {item.title}
          </h3>
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">{item.excerpt}</p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <img src={item.author.avatar} alt={item.author.name} className="w-6 h-6 rounded-full" />
              <span>{item.author.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" /> {item.viewCount}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" /> {item.likeCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

function BlogCard({ blog, index }: { blog: BlogListItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/blog/${blog.slug}`} className="group block blog-card h-full">
        <div className="glass-strong rounded-2xl overflow-hidden border border-white/10 hover:border-[#4A90E2]/30 transition-all duration-500 h-full flex flex-col">
          {/* Cover image */}
          <div className="relative h-52 overflow-hidden bg-gray-900">
            <img
              src={blog.coverImage}
              alt={blog.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            {blog.featured && (
              <div className="absolute top-3 right-3">
                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#4A90E2]/20 text-[#4A90E2] text-[10px] font-semibold border border-[#4A90E2]/30 glass-strong">
                  <Sparkles className="w-3 h-3" /> Featured
                </span>
              </div>
            )}
            {blog.category && (
              <div className="absolute bottom-3 left-3">
                <span
                  className="px-2.5 py-1 rounded-full text-[10px] font-semibold glass-strong border"
                  style={{
                    borderColor: `${blog.category.color}40`,
                    color: blog.category.color,
                    background: `${blog.category.color}15`,
                  }}
                >
                  {blog.category.name}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col flex-grow">
            <h3 className="font-bold text-white text-lg mb-2 line-clamp-2 group-hover:text-[#4A90E2] transition-colors duration-300">
              {blog.title}
            </h3>
            <p className="text-sm text-gray-400 mb-4 line-clamp-3 flex-grow">{blog.excerpt}</p>

            {/* Tags */}
            {blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {blog.tags.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-md bg-white/5 text-gray-400 text-[10px] font-medium border border-white/5"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Footer: author + stats */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <img
                  src={blog.author.avatar}
                  alt={blog.author.name}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-white/10"
                />
                <div>
                  <p className="text-xs font-medium text-white">{blog.author.name}</p>
                  <p className="text-[10px] text-gray-500">{formatDate(blog.publishedAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {formatCount(blog.viewCount)}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" /> {formatCount(blog.likeCount)}
                </span>
                <span className="text-gray-400">{blog.readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function EmptyState() {
  return (
    <div className="py-20 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl glass-strong flex items-center justify-center">
        <Search className="w-7 h-7 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No articles found</h3>
      <p className="text-gray-400">Try adjusting your search or filters</p>
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k"
  return String(n)
}
