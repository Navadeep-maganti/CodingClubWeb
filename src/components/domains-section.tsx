"use client"

import { motion } from "framer-motion"
import { IconByName } from "@/lib/icon-client"
import { useSpotlight } from "@/hooks/use-magnetic"

export interface Domain {
  id: string
  title: string
  description: string
  iconName: string
  color: string
}

interface DomainsSectionProps {
  domains: Domain[]
  settings: {
    domains_title?: string
    domains_description?: string
  }
}

export default function DomainsSection({ domains, settings }: DomainsSectionProps) {
  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 dot-bg opacity-30" />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl mb-6">
            <span className="gradient-text-premium">
              {settings.domains_title || "Our Domains"}
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {settings.domains_description ||
              "Explore diverse technology domains and find your passion in the ever-evolving world of software development."}
          </p>
        </motion.div>

        {domains.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {domains.map((domain, index) => (
              <DomainCard key={domain.id} domain={domain} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function DomainCard({ domain, index }: { domain: Domain; index: number }) {
  const { ref, pos } = useSpotlight<HTMLDivElement>()
  const bgColor = hexToRgba(domain.color, 0.15)
  const borderColor = hexToRgba(domain.color, 0.3)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
    >
      <div
        ref={ref}
        className="group relative h-full card-premium rounded-2xl p-8 border border-white/10 hover:border-blue-500/20 transition-all duration-500 overflow-hidden spotlight-card"
        style={
          {
            "--spotlight-x": `${pos.x}%`,
            "--spotlight-y": `${pos.y}%`,
          } as React.CSSProperties
        }
      >
        {/* Color glow on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(400px circle at ${pos.x}% ${pos.y}%, ${bgColor}, transparent 40%)`,
          }}
        />

        <div className="relative z-10">
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
            style={{
              backgroundColor: bgColor,
              border: `1px solid ${borderColor}`,
            }}
          >
            <span style={{ color: domain.color, display: "inline-flex" }}>
              <IconByName name={domain.iconName} className="h-8 w-8" />
            </span>
          </div>

          <h3 className="font-heading font-bold text-xl text-white mb-3 group-hover:text-white transition-colors">
            {domain.title}
          </h3>
          <p className="text-gray-400 leading-relaxed">{domain.description}</p>

          {/* Arrow indicator */}
          <div className="mt-6 flex items-center text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: domain.color }}>
            Explore
            <svg
              className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16 glass rounded-2xl">
      <p className="text-gray-400">No domains configured yet.</p>
    </div>
  )
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "")
  if (clean.length !== 6) return `rgba(74, 144, 226, ${alpha})`
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
