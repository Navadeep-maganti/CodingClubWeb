"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users, ArrowRight, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { useSpotlight } from "@/hooks/use-magnetic"

export interface UpcomingEventItem {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  type: string
  image: string
  registrations: number
  maxRegistrations: number
}

interface UpcomingEventsProps {
  events: UpcomingEventItem[]
  settings: {
    upcoming_events_title?: string
    upcoming_events_description?: string
    upcoming_events_empty_title?: string
    upcoming_events_empty_message?: string
  }
}

export default function UpcomingEvents({ events, settings }: UpcomingEventsProps) {
  const hasEvents = events.length > 0
  const title = settings.upcoming_events_title || "Upcoming Events"
  const description =
    settings.upcoming_events_description ||
    "Join us for exciting workshops, competitions, and tech talks designed to enhance your coding journey."
  const emptyTitle = settings.upcoming_events_empty_title || "No Upcoming Events"
  const emptyMessage =
    settings.upcoming_events_empty_message || "Stay tuned!! new events will be announced soon!"

  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent" />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl mb-6">
            <span className="text-white">Upcoming </span>
            <span className="gradient-text-premium">
              {title.replace(/^Upcoming\s+/i, "")}
            </span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">{description}</p>
        </motion.div>

        <div className="mt-12">
          {!hasEvents ? (
            <EmptyState title={emptyTitle} message={emptyMessage} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function EventCard({ event, index }: { event: UpcomingEventItem; index: number }) {
  const { ref, pos } = useSpotlight<HTMLDivElement>()
  const typeColors: Record<string, string> = {
    Workshop: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    Contest: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    Bootcamp: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    Hackathon: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    Webinar: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  }
  const typeClass = typeColors[event.type] || "bg-gray-500/20 text-gray-300 border-gray-500/30"

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
    >
      <div
        ref={ref}
        className="group relative h-full card-premium rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/20 transition-all duration-500 spotlight-card"
        style={
          {
            "--spotlight-x": `${pos.x}%`,
            "--spotlight-y": `${pos.y}%`,
          } as React.CSSProperties
        }
      >
        {/* Image with overlay */}
        {event.image && (
          <div className="relative h-52 overflow-hidden">
            <img
              src={event.image || "/placeholder.svg"}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Type badge */}
            <div className="absolute top-4 left-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${typeClass}`}
              >
                {event.type}
              </span>
            </div>

            {/* Date overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 text-white">
              <div className="glass-strong rounded-lg px-3 py-1.5 text-center">
                <div className="text-xs font-medium uppercase tracking-wide text-blue-300">
                  {new Date(event.date).toLocaleString("default", { month: "short" })}
                </div>
                <div className="text-lg font-bold leading-none">
                  {new Date(event.date).getDate()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-lg text-white truncate drop-shadow-lg">
                  {event.title}
                </h3>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {!event.image && (
            <div className="mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${typeClass}`}>
                {event.type}
              </span>
              <h3 className="font-heading font-bold text-lg text-white mt-3">{event.title}</h3>
            </div>
          )}

          <p className="text-gray-400 mb-4 text-sm line-clamp-2">{event.description}</p>

          {/* Event details */}
          <div className="space-y-2 mb-5">
            <div className="flex items-center text-gray-300 text-sm">
              <Clock className="h-4 w-4 mr-2 text-blue-400" />
              {event.time}
            </div>
            <div className="flex items-center text-gray-300 text-sm">
              <MapPin className="h-4 w-4 mr-2 text-blue-400" />
              {event.location}
            </div>
            <div className="flex items-center text-gray-300 text-sm">
              <Users className="h-4 w-4 mr-2 text-blue-400" />
              {event.registrations}/{event.maxRegistrations} registered
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (event.registrations / event.maxRegistrations) * 100)}%`,
                }}
              />
            </div>
          </div>

          <Link href="/events">
            <Button className="w-full bg-blue-500 hover:bg-blue-600 btn-premium group">
              View Details
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center py-16 glass-strong rounded-2xl border border-white/10 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
      <div className="relative z-10">
        <div className="w-16 h-16 rounded-2xl glass mx-auto mb-4 flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-blue-400" />
        </div>
        <h4 className="font-heading font-semibold text-xl text-white mb-2">{title}</h4>
        <p className="text-gray-400">{message}</p>
      </div>
    </motion.div>
  )
}
