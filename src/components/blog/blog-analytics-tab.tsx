"use client"

import { useEffect, useState } from "react"
import {
  Eye,
  Heart,
  Bookmark,
  FileText,
  TrendingUp,
  BarChart3,
  Calendar,
  Clock,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface AnalyticsData {
  totalBlogs: number
  totalPublished: number
  totalDrafts: number
  totalViews: number
  totalLikes: number
  totalBookmarks: number
  topBlogs: Array<{
    id: string
    title: string
    slug: string
    viewCount: number
    likeCount: number
    bookmarkCount: number
    publishedAt: string
    readTime: string
  }>
  blogsByCategory: Array<{
    name: string
    slug: string
    count: number
    color: string
  }>
  recentActivity: Array<{
    id: string
    title: string
    slug: string
    publishedAt: string
    views: number
    likes: number
  }>
}

/**
 * BlogAnalyticsTab — analytics dashboard for the admin.
 *
 * Fetches from /api/blogs/analytics. SUPER_ADMIN/ADMIN see stats for all blogs.
 * BLOG_AUTHOR sees stats for their own blogs only (enforced server-side).
 */
export default function BlogAnalyticsTab() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/blogs/analytics", { credentials: "same-origin" })
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}))
          throw new Error(body.error || "Failed to load analytics")
        }
        return r.json()
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#4A90E2]" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="glass border-white/10">
        <CardContent className="py-8 text-center">
          <p className="text-red-400 text-sm">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          icon={<FileText className="w-4 h-4 text-[#4A90E2]" />}
          label="Total Posts"
          value={data.totalBlogs}
          gradient="from-[#4A90E2]/20 to-[#4A90E2]/5"
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4 text-[#50C878]" />}
          label="Published"
          value={data.totalPublished}
          gradient="from-[#50C878]/20 to-[#50C878]/5"
        />
        <StatCard
          icon={<FileText className="w-4 h-4 text-[#FFD93D]" />}
          label="Drafts"
          value={data.totalDrafts}
          gradient="from-[#FFD93D]/20 to-[#FFD93D]/5"
        />
        <StatCard
          icon={<Eye className="w-4 h-4 text-[#9B59B6]" />}
          label="Total Views"
          value={data.totalViews}
          gradient="from-[#9B59B6]/20 to-[#9B59B6]/5"
        />
        <StatCard
          icon={<Heart className="w-4 h-4 text-[#FF6B6B]" />}
          label="Total Likes"
          value={data.totalLikes}
          gradient="from-[#FF6B6B]/20 to-[#FF6B6B]/5"
        />
        <StatCard
          icon={<Bookmark className="w-4 h-4 text-[#4A90E2]" />}
          label="Bookmarks"
          value={data.totalBookmarks}
          gradient="from-[#4A90E2]/20 to-[#4A90E2]/5"
        />
      </div>

      {/* Top blogs */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#4A90E2]" /> Top Performing Articles
          </CardTitle>
          <CardDescription className="text-[#B0B0B0]">
            Ranked by view count across all your published posts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.topBlogs.length === 0 ? (
            <p className="text-[#B0B0B0] text-sm text-center py-4">No published blogs yet.</p>
          ) : (
            <div className="space-y-3">
              {data.topBlogs.map((blog, i) => (
                <div
                  key={blog.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#1A1F2E]/50 border border-white/5"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#4A90E2]/20 text-[#4A90E2] flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/blog/${blog.slug}`}
                      target="_blank"
                      className="text-[#E0E0E0] font-medium truncate block hover:text-[#4A90E2] transition-colors"
                    >
                      {blog.title}
                    </Link>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[#B0B0B0]">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {blog.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {blog.likeCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bookmark className="w-3 h-3" /> {blog.bookmarkCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {blog.readTime}
                      </span>
                      {blog.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(blog.publishedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category breakdown + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Categories */}
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#9B59B6]" /> Posts by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.blogsByCategory.length === 0 ? (
              <p className="text-[#B0B0B0] text-sm text-center py-4">No categories with posts.</p>
            ) : (
              <div className="space-y-3">
                {data.blogsByCategory.map((cat) => {
                  const maxCount = Math.max(...data.blogsByCategory.map((c) => c.count))
                  const pct = maxCount > 0 ? (cat.count / maxCount) * 100 : 0
                  return (
                    <div key={cat.slug}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-[#E0E0E0]">{cat.name}</span>
                        <Badge
                          className="text-xs"
                          style={{
                            background: `${cat.color}20`,
                            color: cat.color,
                            border: `1px solid ${cat.color}40`,
                          }}
                        >
                          {cat.count}
                        </Badge>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(to right, ${cat.color}, ${cat.color}80)`,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#50C878]" /> Recent Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentActivity.length === 0 ? (
              <p className="text-[#B0B0B0] text-sm text-center py-4">No recent posts.</p>
            ) : (
              <div className="space-y-2">
                {data.recentActivity.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-[#E0E0E0] truncate">{post.title}</p>
                      <p className="text-xs text-[#B0B0B0]">
                        {formatDate(post.publishedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#B0B0B0] shrink-0">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {post.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {post.likes}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  gradient,
}: {
  icon: React.ReactNode
  label: string
  value: number
  gradient: string
}) {
  return (
    <div className={`p-4 rounded-xl glass border border-white/10 bg-gradient-to-br ${gradient}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-[#B0B0B0] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{formatNum(value)}</p>
    </div>
  )
}

function formatNum(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k"
  return String(n)
}

function formatDate(iso: string): string {
  if (!iso) return "—"
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}
