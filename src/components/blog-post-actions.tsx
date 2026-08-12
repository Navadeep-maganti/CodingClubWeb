"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Bookmark, Share2 } from "lucide-react"

interface AuthorInfo {
  name: string
  avatar: string
  bio: string
}

/**
 * Client-side reading progress bar (matches original implementation).
 */
export function ReadingProgress() {
  const [readingProgress, setReadingProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (window.scrollY / totalHeight) * 100
      setReadingProgress(Math.min(progress, 100))
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-[#1A1F2E] z-50">
      <div
        className="h-full bg-gradient-to-r from-[#4A90E2] to-[#50C878] transition-all duration-150"
        style={{ width: `${readingProgress}%` }}
      />
    </div>
  )
}

/**
 * Author info row with like/save/share buttons (client-side state).
 */
export function AuthorRow({ author }: { author: AuthorInfo }) {
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center">
        <img
          src={author.avatar || "/placeholder.svg"}
          alt={author.name}
          className="w-12 h-12 rounded-full mr-4"
        />
        <div>
          <p className="text-[#E0E0E0] font-semibold">{author.name}</p>
          <p className="text-[#B0B0B0] text-sm">{author.bio}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsLiked(!isLiked)}
          className={`border-[#4A90E2]/30 ${isLiked ? "bg-[#4A90E2] text-white" : "text-[#4A90E2]"}`}
        >
          <Heart className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
          Like
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsBookmarked(!isBookmarked)}
          className={`border-[#50C878]/30 ${isBookmarked ? "bg-[#50C878] text-white" : "text-[#50C878]"}`}
        >
          <Bookmark className={`h-4 w-4 mr-1 ${isBookmarked ? "fill-current" : ""}`} />
          Save
        </Button>
        <Button size="sm" variant="outline" className="border-[#FF6B6B]/30 text-[#FF6B6B] bg-transparent">
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>
      </div>
    </div>
  )
}
