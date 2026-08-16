"use client"

import Link from "next/link"
import { Github, Linkedin, Twitter, PenLine, Eye, Heart, FileText } from "lucide-react"

export interface AuthorData {
  id: string
  name: string
  bio: string
  avatar: string
  role: string
  skills: string[]
  github?: string
  linkedin?: string
  twitter?: string
  postCount?: number
  totalViews?: number
  totalLikes?: number
}

/**
 * AuthorCard — premium author profile card.
 * Displays photo, name, role, bio, skills, social links, and post count.
 */
export default function AuthorCard({ author }: { author: AuthorData }) {
  return (
    <div className="author-profile-card p-8">
      <div className="flex flex-col sm:flex-row items-start gap-6">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#4A90E2] to-[#9B59B6] rounded-full blur-2xl opacity-30" />
          <img
            src={author.avatar}
            alt={author.name}
            className="relative w-24 h-24 rounded-full object-cover ring-4 ring-white/10"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-heading font-bold text-2xl text-white">{author.name}</h3>
            {author.role && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#4A90E2]/15 text-[#4A90E2] text-xs font-semibold border border-[#4A90E2]/30">
                {author.role}
              </span>
            )}
          </div>

          {author.bio && (
            <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-3">{author.bio}</p>
          )}

          {/* Skills */}
          {author.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {author.skills.slice(0, 6).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded-md bg-white/5 text-gray-300 text-[11px] font-medium border border-white/10"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          {(author.postCount !== undefined || author.totalViews !== undefined) && (
            <div className="flex items-center gap-4 mb-4 text-sm">
              {author.postCount !== undefined && (
                <span className="flex items-center gap-1.5 text-gray-400">
                  <FileText className="w-4 h-4 text-[#4A90E2]" />
                  <span className="text-white font-medium">{author.postCount}</span> posts
                </span>
              )}
              {author.totalViews !== undefined && author.totalViews > 0 && (
                <span className="flex items-center gap-1.5 text-gray-400">
                  <Eye className="w-4 h-4 text-[#50C878]" />
                  <span className="text-white font-medium">{formatCount(author.totalViews)}</span> views
                </span>
              )}
              {author.totalLikes !== undefined && author.totalLikes > 0 && (
                <span className="flex items-center gap-1.5 text-gray-400">
                  <Heart className="w-4 h-4 text-[#FF6B6B]" />
                  <span className="text-white font-medium">{formatCount(author.totalLikes)}</span> likes
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href={`/blog/author/${author.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4A90E2] hover:bg-[#3A7BC8] text-white text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#4A90E2]/25"
            >
              <PenLine className="w-4 h-4" />
              View Profile
            </Link>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {author.github && (
                <a
                  href={author.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${author.name}'s GitHub`}
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 hover:scale-110"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {author.linkedin && (
                <a
                  href={author.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${author.name}'s LinkedIn`}
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 hover:scale-110"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {author.twitter && (
                <a
                  href={author.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${author.name}'s Twitter`}
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 hover:scale-110"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k"
  return String(n)
}
