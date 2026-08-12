"use client"

import { Github, Linkedin, Twitter } from "lucide-react"

export interface TeamMemberData {
  name: string
  /** Legacy field — kept for backwards-compat with the DB seed, but no longer displayed. */
  position?: string
  /** Displayed under the member's name. e.g. "Core Committee", "Volunteer". */
  category?: string
  image: string
  bio?: string
  skills?: string[]
  social?: {
    github?: string
    linkedin?: string
    twitter?: string
  }
}

/**
 * MemberGrid
 *
 * Performance notes:
 *   - Removed per-card framer-motion `motion.div` wrappers. Each card previously
 *     subscribed to framer-motion's internal animation loop, which scaled linearly
 *     with the number of cards (36 members = 36 active animators).
 *   - Replaced with a single CSS keyframe (`member-card-enter`) defined in
 *     globals.css. Cards stagger via an inline `animationDelay` based on index.
 *   - Removed `useMagnetic` / `useSpotlight` hooks — both attached `mousemove`
 *     listeners and `requestAnimationFrame` loops to every card. With 36 cards
 *     that's 36 rAF loops running simultaneously on every mousemove, which was
 *     the primary cause of UI jank on the /team page.
 *   - Image hover-zoom is preserved via pure CSS (`group-hover:scale-110`).
 *   - The card still feels premium: glassmorphism, gradient border on hover,
 *     smooth image zoom, and staggered entry animation.
 */
export default function MemberGrid({ members }: { members: TeamMemberData[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {members.map((member, index) => (
        <MemberCard key={member.name} member={member} index={index} />
      ))}
    </div>
  )
}

function MemberCard({ member, index }: { member: TeamMemberData; index: number }) {
  return (
    <div
      className="member-card-enter h-full"
      style={{ animationDelay: `${(index % 4) * 80}ms` }}
    >
      <div className="group relative h-full">
        <div className="card-premium rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/30 transition-all duration-500 h-full flex flex-col relative bg-[#0B1120]">
          {/* Animated gradient border on hover */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" />
          </div>

          {/* Profile image with effect */}
          <div className="relative overflow-hidden h-64 bg-gray-900">
            <img
              src={member.image || "/placeholder.svg"}
              alt={member.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          </div>

          <div className="p-6 flex flex-col flex-grow relative z-10">
            <h3 className="font-heading font-bold text-xl text-white mb-1 group-hover:text-blue-400 transition-colors duration-300">
              {member.name}
            </h3>

            {/* Category shown under the name (replaces the old position badge) */}
            {member.category && (
              <span className="inline-block self-start px-3 py-1 mb-3 rounded-full glass-strong border border-blue-500/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
                {member.category}
              </span>
            )}

            {member.bio && (
              <p className="text-gray-400 text-sm mb-4 leading-relaxed flex-grow line-clamp-3">
                {member.bio}
              </p>
            )}

            {/* Skills as comma separated text */}
            {(member.skills?.length ?? 0) > 0 && (
              <p className="text-blue-400 text-xs font-medium mb-4 truncate">
                {member.skills?.join(", ")}
              </p>
            )}

            {/* Premium social icons */}
            {member.social && (
              <div className="flex justify-center items-center gap-2 mt-auto pt-4 border-t border-white/5">
                {member.social.github && member.social.github !== "/" && (
                  <a
                    href={member.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name}'s Github Profile`}
                    className="w-9 h-9 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-500/20 hover:border-blue-500/30 transition-all duration-300 hover:scale-110"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                )}
                {member.social.linkedin && member.social.linkedin !== "/" && (
                  <a
                    href={member.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name}'s LinkedIn Profile`}
                    className="w-9 h-9 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-500/20 hover:border-blue-500/30 transition-all duration-300 hover:scale-110"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
                {member.social.twitter && member.social.twitter !== "/" && (
                  <a
                    href={member.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name}'s Twitter Profile`}
                    className="w-9 h-9 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-500/20 hover:border-blue-500/30 transition-all duration-300 hover:scale-110"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
