"use client"

import { useEffect, useState, useCallback } from "react"
import { Heart, Bookmark, Link2, Linkedin, Twitter, Check, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ArticleActionsProps {
  slug: string
}

/**
 * ArticleActions — a client component providing:
 *   - Sticky reading progress bar (top of viewport)
 *   - Floating share bar (desktop): LinkedIn, Twitter/X, Copy Link
 *   - Like button (toggles on click, persists to /api/blogs/[slug]/like)
 *   - Bookmark button (toggles on click, persists to /api/blogs/[slug]/bookmark)
 *
 * The like/bookmark state is fetched on mount and updated optimistically.
 */
export default function ArticleActions({ slug }: ArticleActionsProps) {
  const [progress, setProgress] = useState(0)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [bookmarked, setBookmarked] = useState(false)
  const [copied, setCopied] = useState(false)

  // Track reading progress
  useEffect(() => {
    const onScroll = () => {
      const article = document.querySelector(".article-content")
      if (!article) return
      const rect = article.getBoundingClientRect()
      const articleHeight = rect.height
      const scrolled = window.scrollY - rect.top + window.innerHeight
      const pct = Math.max(0, Math.min(100, (scrolled / articleHeight) * 100))
      setProgress(pct)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Fetch initial like/bookmark state + counts
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // Fetch like state
        const [likeRes, bookmarkRes] = await Promise.all([
          fetch(`/api/blogs/${slug}/like`, { credentials: "same-origin" }),
          fetch(`/api/blogs/${slug}/bookmark`, { credentials: "same-origin" }),
        ])
        if (likeRes.ok) {
          const data = await likeRes.json()
          if (mounted) setLiked(data.liked)
        }
        if (bookmarkRes.ok) {
          const data = await bookmarkRes.json()
          if (mounted) setBookmarked(data.bookmarked)
        }
        // Get like count from the blog's data (fetched via the article page)
        // We'll fetch it from the page via a selector
        const countEl = document.querySelector("[data-like-count]")
        if (countEl) {
          const count = parseInt(countEl.getAttribute("data-like-count") || "0", 10)
          if (mounted) setLikeCount(count)
        }
      } catch {
        // ignore — user may not be authenticated
      }
    })()
    return () => {
      mounted = false
    }
  }, [slug])

  const toggleLike = useCallback(async () => {
    const prevLiked = liked
    setLiked(!liked)
    setLikeCount((c) => (liked ? c - 1 : c + 1))
    try {
      const res = await fetch(`/api/blogs/${slug}/like`, {
        method: "POST",
        credentials: "same-origin",
      })
      if (res.ok) {
        const data = await res.json()
        setLiked(data.liked)
        setLikeCount(data.likeCount)
      } else {
        // Revert on failure
        setLiked(prevLiked)
        setLikeCount((c) => (liked ? c + 1 : c - 1))
      }
    } catch {
      setLiked(prevLiked)
      setLikeCount((c) => (liked ? c + 1 : c - 1))
    }
  }, [liked, likeCount, slug])

  const toggleBookmark = useCallback(async () => {
    const prevBookmarked = bookmarked
    setBookmarked(!bookmarked)
    try {
      const res = await fetch(`/api/blogs/${slug}/bookmark`, {
        method: "POST",
        credentials: "same-origin",
      })
      if (res.ok) {
        const data = await res.json()
        setBookmarked(data.bookmarked)
      } else {
        setBookmarked(prevBookmarked)
      }
    } catch {
      setBookmarked(prevBookmarked)
    }
  }, [bookmarked, slug])

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  return (
    <>
      {/* Sticky reading progress bar */}
      <div className="reading-progress-bar">
        <div className="reading-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Floating action bar (desktop) */}
      <div className="hidden lg:block fixed left-4 top-1/2 -translate-y-1/2 z-40">
        <div className="floating-share-bar">
          {/* Like */}
          <button
            onClick={toggleLike}
            aria-label={liked ? "Unlike" : "Like"}
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110",
              liked
                ? "bg-[#FF6B6B]/20 text-[#FF6B6B] border border-[#FF6B6B]/30"
                : "text-gray-400 hover:text-white hover:bg-white/5",
            )}
          >
            <Heart className={cn("w-4 h-4", liked && "fill-current")} />
          </button>
          {likeCount > 0 && (
            <span className="text-xs text-center text-gray-500">{likeCount}</span>
          )}

          {/* Divider */}
          <div className="w-6 h-px bg-white/10 mx-auto my-1" />

          {/* Bookmark */}
          <button
            onClick={toggleBookmark}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110",
              bookmarked
                ? "bg-[#4A90E2]/20 text-[#4A90E2] border border-[#4A90E2]/30"
                : "text-gray-400 hover:text-white hover:bg-white/5",
            )}
          >
            <Bookmark className={cn("w-4 h-4", bookmarked && "fill-current")} />
          </button>

          {/* Divider */}
          <div className="w-6 h-px bg-white/10 mx-auto my-1" />

          {/* Share: LinkedIn */}
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.href : "",
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on LinkedIn"
            className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#0A66C2]/20 transition-all duration-300 hover:scale-110"
          >
            <Linkedin className="w-4 h-4" />
          </a>

          {/* Share: Twitter/X */}
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.href : "",
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Twitter/X"
            className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 hover:scale-110"
          >
            <Twitter className="w-4 h-4" />
          </a>

          {/* Copy link */}
          <button
            onClick={copyLink}
            aria-label="Copy link"
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110",
              copied
                ? "bg-[#50C878]/20 text-[#50C878] border border-[#50C878]/30"
                : "text-gray-400 hover:text-white hover:bg-white/5",
            )}
          >
            {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile action bar (bottom) */}
      <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-2 px-4 py-2 glass-strong rounded-full border border-white/10">
          <button
            onClick={toggleLike}
            aria-label={liked ? "Unlike" : "Like"}
            className={cn(
              "p-2 rounded-full transition-all",
              liked ? "text-[#FF6B6B]" : "text-gray-400",
            )}
          >
            <Heart className={cn("w-5 h-5", liked && "fill-current")} />
          </button>
          <button
            onClick={toggleBookmark}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
            className={cn(
              "p-2 rounded-full transition-all",
              bookmarked ? "text-[#4A90E2]" : "text-gray-400",
            )}
          >
            <Bookmark className={cn("w-5 h-5", bookmarked && "fill-current")} />
          </button>
          <button
            onClick={copyLink}
            aria-label="Copy link"
            className={cn(
              "p-2 rounded-full transition-all",
              copied ? "text-[#50C878]" : "text-gray-400",
            )}
          >
            {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </>
  )
}
