"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, Clock } from "lucide-react"
interface RelatedArticle {
  id: string
  title: string
  slug: string
  excerpt: string
  coverImage: string
  publishedAt: string
  readTime: string
  viewCount: number
  likeCount: number
  category: { name: string; slug: string; color: string } | null
  author: { displayName: string; avatar: string; role: string } | null
}

interface RelatedArticlesProps {
  slug: string
}

/**
 * RelatedArticles — fetches and displays 3 related articles
 * from /api/blogs/related?slug=...
 */
export default function RelatedArticles({ slug }: RelatedArticlesProps) {
  const [articles, setArticles] = useState<RelatedArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    fetch(`/api/blogs/related?slug=${encodeURIComponent(slug)}&limit=3`)
      .then((r) => r.json())
      .then((data) => {
        if (mounted && Array.isArray(data)) setArticles(data)
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [slug])

  if (loading) {
    return (
      <div>
        <h3 className="font-heading font-bold text-2xl text-white mb-6">Related Articles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-strong rounded-2xl overflow-hidden border border-white/10">
              <div className="h-32 bg-white/5 animate-pulse" />
              <div className="p-4">
                <div className="h-4 w-3/4 bg-white/5 rounded mb-2 animate-pulse" />
                <div className="h-3 w-1/2 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (articles.length === 0) return null

  return (
    <div>
      <h3 className="font-heading font-bold text-2xl text-white mb-6">Related Articles</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article, i) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Link href={`/blog/${article.slug}`} className="group block blog-card h-full">
              <div className="glass-strong rounded-2xl overflow-hidden border border-white/10 hover:border-[#4A90E2]/30 transition-all duration-500 h-full flex flex-col">
                <div className="relative h-32 overflow-hidden">
                  {article.coverImage ? (
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <span className="text-white/20 font-bold text-xl">{article.title.charAt(0)}</span>
                    </div>
                  )}
                  {article.category && (
                    <span
                      className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold glass-strong border"
                      style={{
                        borderColor: `${article.category.color}40`,
                        color: article.category.color,
                        background: `${article.category.color}15`,
                      }}
                    >
                      {article.category.name}
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h4 className="font-semibold text-white text-sm mb-2 line-clamp-2 group-hover:text-[#4A90E2] transition-colors">
                    {article.title}
                  </h4>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-3 flex-grow">{article.excerpt}</p>
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {article.readTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {article.viewCount}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
