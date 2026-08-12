"use client"

import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { motion } from "framer-motion"
import * as LucideIcons from "lucide-react"
import PremiumPageBackground from "@/components/premium-page-background"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

export interface MissionCard {
  id: string
  title: string
  description: string
  iconName: string
}

interface AboutContentProps {
  settings: Record<string, string>
  missions: MissionCard[]
}

function IconByName({ name, className }: { name: string; className?: string }) {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>
  const Cmp = icons[name] || icons.Code
  return <Cmp className={className} />
}

export default function AboutContent({ settings, missions }: AboutContentProps) {
  const heroTitlePre = settings.about_hero_title_pre || "About "
  const heroTitleHighlight = settings.about_hero_title_highlight || "Our Club"
  const heroDescription =
    settings.about_hero_description ||
    "The Coding Club of NIT Andhra Pradesh is a student-driven initiative built for all engineering students — from absolute beginners to advanced coders."

  const visionTitle = settings.about_vision_title || "Our Vision"
  const visionText =
    settings.about_vision_text ||
    "To foster a thriving, inclusive, and innovative tech community at NIT Andhra Pradesh that empowers students to explore, learn, and excel in the ever-evolving world of technology."
  const visionCardTitle = settings.about_vision_card_title || "Tech Community"
  const visionCardSubtitle = settings.about_vision_card_subtitle || "Creating tomorrow's tech leaders today"

  const missionTitlePre = settings.about_mission_title_pre || "Our "
  const missionTitleHighlight = settings.about_mission_title_highlight || "Mission"
  const missionIntro =
    settings.about_mission_intro || "We are committed to three core principles that guide everything we do."

  const facultyTitlePre = settings.about_faculty_title_pre || "Faculty "
  const facultyTitleHighlight = settings.about_faculty_title_highlight || "Advisor"

  const facultyName = settings.faculty_advisor_name || "Dr. K. Himabindu"
  const facultyPosition = settings.faculty_advisor_position || "Faculty Advisor"
  const facultyDepartment = settings.faculty_advisor_department || "Computer Science & Engineering"
  const facultyImage = settings.faculty_advisor_image || "/placeholder.svg"
  const facultyBio = settings.faculty_advisor_bio || ""
  const facultyEmail = settings.faculty_advisor_email || ""
  const facultyQuote =
    settings.about_faculty_quote ||
    settings.faculty_advisor_quote ||
    '"The Coding Club represents the spirit of innovation and collaboration that defines our institution. I am proud to guide these talented students as they build the future of technology."'

  let expertise: string[] = []
  try {
    const parsed = JSON.parse(settings.faculty_advisor_expertise || "[]")
    if (Array.isArray(parsed)) expertise = parsed.map((x) => String(x))
  } catch {
    // ignore
  }

  return (
    <main className="min-h-screen relative">
      <PremiumPageBackground />
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading font-bold text-5xl sm:text-6xl lg:text-7xl mb-6"
          >
            <span className="text-white">{heroTitlePre}</span>
            <span className="gradient-text-premium">{heroTitleHighlight}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300 leading-relaxed"
          >
            {heroDescription}
          </motion.p>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl glass-strong border border-blue-500/20 flex items-center justify-center">
                  <IconByName name="Eye" className="h-6 w-6 text-blue-400" />
                </div>
                <h2 className="font-heading font-bold text-3xl text-white">{visionTitle}</h2>
              </div>
              <p className="text-lg text-gray-300 leading-relaxed">{visionText}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="glass-strong rounded-2xl p-8 border border-white/10 relative overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl" />
              <div className="text-center relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <IconByName name="Laptop2" className="h-10 w-10 text-white" />
                </div>
                <h3 className="font-heading font-semibold text-xl text-white mb-2">{visionCardTitle}</h3>
                <p className="text-gray-400">{visionCardSubtitle}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="font-heading font-bold text-3xl sm:text-4xl mb-6"
            >
              <span className="text-white">{missionTitlePre}</span>
              <span className="gradient-text-premium">{missionTitleHighlight}</span>
            </motion.h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">{missionIntro}</p>
          </div>

          {missions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {missions.map((mission, index) => (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -6 }}
                  className="group glass-strong rounded-2xl p-8 border border-white/10 hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                      <IconByName name={mission.iconName} className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-heading font-semibold text-xl mb-4 text-white">{mission.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{mission.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Faculty Advisor Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="font-heading font-bold text-3xl sm:text-4xl mb-12"
          >
            <span className="text-white">{facultyTitlePre}</span>
            <span className="gradient-text-premium">{facultyTitleHighlight}</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="glass-strong rounded-3xl p-8 max-w-2xl mx-auto border border-white/10 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
            <div className="relative z-10">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-2xl opacity-30" />
                <img
                  src={facultyImage}
                  alt={facultyName}
                  className="relative w-32 h-32 object-cover rounded-full ring-4 ring-white/10"
                />
              </div>
              <h3 className="font-heading font-bold text-2xl text-white mb-2">{facultyName}</h3>
              <p className="text-blue-400 mb-4">{facultyPosition}</p>
              <p className="text-gray-400 text-sm mb-4">{facultyDepartment}</p>
              {facultyBio && (
                <p className="text-gray-300 leading-relaxed mb-4">{facultyBio}</p>
              )}
              {facultyQuote && (
                <p className="text-gray-400 leading-relaxed italic mb-6">{facultyQuote}</p>
              )}
              {expertise.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {expertise.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-blue-500/10 text-blue-300 rounded-full text-sm border border-blue-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
              {facultyEmail && (
                <Button asChild className="bg-blue-500 hover:bg-blue-600 btn-premium">
                  <a href={`mailto:${facultyEmail}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Contact
                  </a>
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
