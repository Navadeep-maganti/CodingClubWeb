"use client"

import { ArrowRight, Lightbulb, Code, Github } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { IconByName } from "@/lib/icon-client"
import { useMagnetic, useSpotlight } from "@/hooks/use-magnetic"

export interface Pillar {
  id: string
  title: string
  description: string
  iconName: string
  colorFrom: string
  colorTo: string
  features: string[]
}

interface WhoWeAreProps {
  pillars: Pillar[]
  settings: {
    who_we_are_badge?: string
    who_we_are_title_pre?: string
    who_we_are_title_highlight?: string
    who_we_are_description?: string
    who_we_are_cta_title?: string
    who_we_are_cta_description?: string
    who_we_are_cta_primary_label?: string
    who_we_are_cta_primary_href?: string
    who_we_are_cta_secondary_label?: string
    who_we_are_cta_secondary_href?: string
  }
}

export default function WhoWeAre({ pillars, settings }: WhoWeAreProps) {
  const primaryHref = settings.who_we_are_cta_primary_href || "https://discord.gg/DjHkM7TMDK"
  const secondaryHref = settings.who_we_are_cta_secondary_href || "/resources"
  const primaryLabel = settings.who_we_are_cta_primary_label || "Join Our Community"
  const secondaryLabel = settings.who_we_are_cta_secondary_label || "View Projects"

  const isPrimaryInternal = primaryHref.startsWith("/") || primaryHref.startsWith("#")
  const isSecondaryInternal = secondaryHref.startsWith("/") || secondaryHref.startsWith("#")

  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 aurora-bg opacity-30" />
      <div className="absolute inset-0 grid-bg opacity-20" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full glass border border-white/10 mb-6 text-sm font-medium text-blue-200">
            <Lightbulb className="w-4 h-4 mr-2 text-blue-400" />
            {settings.who_we_are_badge || "Our Mission & Vision"}
          </div>

          <h2 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl mb-8">
            <span className="text-white">{settings.who_we_are_title_pre || "Who "}</span>
            <span className="gradient-text-premium">
              {settings.who_we_are_title_highlight || "We Are"}
            </span>
          </h2>

          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-medium">
            {settings.who_we_are_description ||
              "The Coding Club of NIT Andhra Pradesh is a student-driven initiative built for all engineering students — from absolute beginners to advanced coders. We break down barriers and provide a supportive environment where students can explore, build, and grow together."}
          </p>
        </motion.div>

        {/* Pillars grid with magnetic hover */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {pillars.map((pillar, index) => (
            <PillarCard key={pillar.id} pillar={pillar} index={index} />
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center relative overflow-hidden"
        >
          <div className="glass-strong rounded-3xl p-12 border border-white/10 relative overflow-hidden">
            {/* Animated gradient backdrop */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl" />

            <div className="relative z-10">
              <h3 className="font-heading font-bold text-3xl sm:text-4xl mb-4 gradient-text-premium">
                {settings.who_we_are_cta_title || "Ready to Start Your Journey?"}
              </h3>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                {settings.who_we_are_cta_description ||
                  "Join hundreds of students who are already building the future through code."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isPrimaryInternal ? (
                  <Link href={primaryHref}>
                    <Button
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl glow-hover btn-premium"
                    >
                      <Code className="w-5 h-5 mr-2" />
                      {primaryLabel}
                    </Button>
                  </Link>
                ) : (
                  <Button
                    size="lg"
                    asChild
                    className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl glow-hover btn-premium"
                  >
                    <a href={primaryHref} target="_blank" rel="noopener noreferrer">
                      <Code className="w-5 h-5 mr-2" />
                      {primaryLabel}
                    </a>
                  </Button>
                )}
                {isSecondaryInternal ? (
                  <Link href={secondaryHref}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="glass border-white/20 px-8 py-3 rounded-xl btn-premium"
                    >
                      <Github className="w-5 h-5 mr-2" />
                      {secondaryLabel}
                    </Button>
                  </Link>
                ) : (
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="glass border-white/20 px-8 py-3 rounded-xl btn-premium"
                  >
                    <a href={secondaryHref} target="_blank" rel="noopener noreferrer">
                      <Github className="w-5 h-5 mr-2" />
                      {secondaryLabel}
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/**
 * Magnetic premium pillar card with spotlight effect.
 */
function PillarCard({ pillar, index }: { pillar: Pillar; index: number }) {
  const { ref: magneticRef, offset } = useMagnetic<HTMLDivElement>(0.15, 300)
  const { ref: spotlightRef, pos } = useSpotlight<HTMLDivElement>()

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        ref={(el) => {
          magneticRef.current = el
          spotlightRef.current = el
        }}
        className="group relative h-full premium-card"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
        }}
      >
        <div
          className="card-premium rounded-3xl p-8 border border-white/10 h-full overflow-hidden spotlight-card"
          style={
            {
              "--spotlight-x": `${pos.x}%`,
              "--spotlight-y": `${pos.y}%`,
            } as React.CSSProperties
          }
        >
          {/* Animated border glow */}
          <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/20" />
          </div>

          <div className="relative z-10">
            {/* Icon + arrow */}
            <div className="flex items-start justify-between mb-6">
              <div
                className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${pillar.colorFrom} ${pillar.colorTo} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl`}
              >
                <IconByName name={pillar.iconName} className="h-10 w-10 text-white" />
              </div>
              <div className="w-10 h-10 rounded-full glass flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all duration-300" />
              </div>
            </div>

            <h3 className="font-heading font-bold text-2xl mb-4 text-white group-hover:text-blue-400 transition-colors duration-300">
              {pillar.title}
            </h3>

            <p className="text-gray-300 leading-relaxed mb-6 text-base">
              {pillar.description}
            </p>

            {/* Features */}
            <div className="space-y-2.5 mb-6">
              {pillar.features.map((feature, featureIndex) => (
                <div
                  key={featureIndex}
                  className="flex items-center text-sm text-gray-300"
                >
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 group-hover:scale-150 transition-transform" />
                  {feature}
                </div>
              ))}
            </div>

            <Button
              variant="ghost"
              className="w-full group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-all duration-300"
            >
              Learn More
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
