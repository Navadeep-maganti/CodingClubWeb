"use client"

import { Button } from "@/components/ui/button"
import { ExternalLink, BookOpen, Code, Zap, Star, Download, Github } from "lucide-react"
import { motion } from "framer-motion"
import PremiumPageBackground from "@/components/premium-page-background"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

export interface Roadmap {
  id: string
  title: string
  description: string
  difficulty: string
  duration: string
  topics: string[]
  url: string
}

export interface Toolkit {
  id: string
  title: string
  description: string
  tools: string[]
  toolkitCategory: string
  downloads: number
}

export interface Project {
  id: string
  title: string
  description: string
  tech: string[]
  author: string
  stars: number
  github: string
}

export interface LinkCategory {
  id: string
  title: string
  links: { id: string; title: string; description: string; url: string }[]
}

interface ResourcesPageProps {
  roadmaps: Roadmap[]
  toolkits: Toolkit[]
  projects: Project[]
  linkCategories: LinkCategory[]
  settings: {
    resources_hero_title?: string
    resources_hero_description?: string
  }
}

export default function ResourcesContent({
  roadmaps,
  toolkits,
  projects,
  linkCategories,
  settings,
}: ResourcesPageProps) {
  const heroTitle = settings.resources_hero_title || "Resources"
  const heroDescription =
    settings.resources_hero_description ||
    "Curated learning paths, tools, and projects to accelerate your coding journey and build amazing things."

  return (
    <>
      <PremiumPageBackground />
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading font-bold text-5xl sm:text-6xl lg:text-7xl mb-6"
          >
            <span className="gradient-text-premium">{heroTitle}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            {heroDescription}
          </motion.p>
        </div>
      </section>

      {/* Learning Roadmaps */}
      {roadmaps.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 mb-16 relative z-10">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-heading font-bold text-3xl mb-12 flex items-center">
              <BookOpen className="mr-3 h-8 w-8 text-blue-400" />
              <span className="gradient-text">Learning Roadmaps</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {roadmaps.map((roadmap, index) => (
                <div key={roadmap.id} className="glass glass-hover rounded-lg p-6">
                  <h3 className="font-heading font-bold text-xl text-white mb-3">{roadmap.title}</h3>
                  <p className="text-[#B0B0B0] mb-4">{roadmap.description}</p>
                  <div className="flex flex-wrap gap-4 mb-4 text-sm">
                    {roadmap.difficulty && <span className="text-[#4A90E2]">📊 {roadmap.difficulty}</span>}
                    {roadmap.duration && <span className="text-[#50C878]">⏱️ {roadmap.duration}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {roadmap.topics.map((topic) => (
                      <span key={topic} className="px-3 py-1 bg-[#4A90E2]/20 text-[#4A90E2] rounded-full text-sm">
                        {topic}
                      </span>
                    ))}
                  </div>
                  {roadmap.url && roadmap.url !== "#" ? (
                    <a href={roadmap.url} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-[#4A90E2] hover:bg-[#5BA0F2]">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Roadmap
                      </Button>
                    </a>
                  ) : (
                    <Button className="w-full bg-[#4A90E2] hover:bg-[#5BA0F2]">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Roadmap
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Toolkits */}
      {toolkits.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-heading font-bold text-3xl mb-12 flex items-center">
              <Zap className="mr-3 h-8 w-8 text-[#50C878]" />
              <span className="gradient-text">Development Toolkits</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {toolkits.map((toolkit) => (
                <div key={toolkit.id} className="glass glass-hover rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        toolkit.toolkitCategory === "Development"
                          ? "bg-[#4A90E2]/20 text-[#4A90E2]"
                          : toolkit.toolkitCategory === "Programming"
                            ? "bg-[#50C878]/20 text-[#50C878]"
                            : toolkit.toolkitCategory === "AI/ML"
                              ? "bg-[#FF6B6B]/20 text-[#FF6B6B]"
                              : "bg-[#FFD93D]/20 text-[#FFD93D]"
                      }`}
                    >
                      {toolkit.toolkitCategory}
                    </span>
                    <span className="text-[#B0B0B0] text-xs flex items-center">
                      <Download className="mr-1 h-3 w-3" />
                      {toolkit.downloads}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-lg text-white mb-2">{toolkit.title}</h3>
                  <p className="text-[#B0B0B0] text-sm mb-4">{toolkit.description}</p>
                  <div className="space-y-1 mb-4">
                    {toolkit.tools.map((tool) => (
                      <div key={tool} className="text-[#E0E0E0] text-sm flex items-center">
                        <div className="w-1 h-1 bg-[#4A90E2] rounded-full mr-2" />
                        {tool}
                      </div>
                    ))}
                  </div>
                  <Button size="sm" className="w-full bg-[#50C878] hover:bg-[#60D888]">
                    <Download className="mr-2 h-4 w-4" />
                    Download Kit
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Club Projects */}
      {projects.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-heading font-bold text-3xl mb-12 flex items-center">
              <Code className="mr-3 h-8 w-8 text-[#FF6B6B]" />
              <span className="gradient-text">Club Projects</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.map((project) => (
                <div key={project.id} className="glass glass-hover rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-heading font-bold text-xl text-white mb-2">{project.title}</h3>
                      <p className="text-[#B0B0B0] mb-3">{project.description}</p>
                    </div>
                    <div className="flex items-center text-[#FFD93D] text-sm">
                      <Star className="mr-1 h-4 w-4 fill-current" />
                      {project.stars}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map((tech) => (
                      <span key={tech} className="px-2 py-1 bg-[#FF6B6B]/20 text-[#FF6B6B] rounded text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#E0E0E0] text-sm">by {project.author}</span>
                    {project.github && (
                      <a href={project.github} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="bg-[#FF6B6B] hover:bg-[#FF7B7B]">
                          <Github className="mr-2 h-4 w-4" />
                          View Code
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Curated Links */}
      {linkCategories.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-heading font-bold text-3xl mb-12 flex items-center">
              <ExternalLink className="mr-3 h-8 w-8 text-[#FFD93D]" />
              <span className="gradient-text">Curated Links</span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {linkCategories.map((category) => (
                <div key={category.id} className="glass rounded-lg p-6">
                  <h3 className="font-heading font-bold text-xl text-white mb-6">{category.title}</h3>
                  <div className="space-y-4">
                    {category.links.map((resource) => (
                      <div key={resource.id} className="border-l-2 border-[#4A90E2] pl-4">
                        <a
                          href={resource.url}
                          className="text-[#4A90E2] hover:text-[#5BA0F2] font-semibold transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {resource.title}
                        </a>
                        <p className="text-[#B0B0B0] text-sm mt-1">{resource.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  )
}
