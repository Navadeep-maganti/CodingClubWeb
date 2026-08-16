"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import * as LucideIcons from "lucide-react"

function IconByName({ name, className }: { name: string; className?: string }) {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>
  const Cmp = icons[name] || icons.Code
  return <Cmp className={className} />
}

interface SocialLink {
  id: string
  platform: string
  label: string
  url: string
  iconName: string
}
interface QuickLink {
  id: string
  label: string
  href: string
}
interface Contact {
  id: string
  label: string
  value: string
  iconName: string
}

interface FooterData {
  settings: Record<string, string>
  socialLinks: SocialLink[]
  quickLinks: QuickLink[]
  contacts: Contact[]
}

export default function Footer() {
  const [data, setData] = useState<FooterData | null>(null)

  useEffect(() => {
    fetch("/api/footer")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  const description = data?.settings.footer_description || ""
  const copyright = data?.settings.footer_copyright || ""

  return (
    <footer className="relative bg-gradient-to-b from-transparent via-black/30 to-black/60 border-t border-white/10 py-12 overflow-hidden">
      {/* Premium background accents */}
      <div className="absolute inset-0 premium-bg opacity-30" aria-hidden />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" aria-hidden />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" aria-hidden />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Club Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 overflow-hidden rounded-lg ring-2 ring-white/10">
                <img
                  src="/images/coding-club-logo.png"
                  alt="Coding Club, NIT Andhra Pradesh"
                  width={48}
                  height={48}
                  className="w-12 h-12 object-cover"
                />
              </div>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed max-w-md">{description}</p>
            {/* Social links */}
            <div className="flex space-x-3">
              {(data?.socialLinks || []).map((social) => (
                <Link
                  key={social.id}
                  href={social.url}
                  className="group w-10 h-10 rounded-lg glass border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-blue-500/40 hover:bg-blue-500/10 transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"
                  aria-label={social.label}
                >
                  <IconByName name={social.iconName} className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          {(data?.quickLinks || []).length > 0 && (
            <div>
              <h3 className="font-heading font-semibold text-lg mb-4 text-white">Quick Links</h3>
              <ul className="space-y-3">
                {(data?.quickLinks || []).map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group"
                    >
                      <span className="w-0 h-px bg-blue-400 mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact Info */}
          {(data?.contacts || []).length > 0 && (
            <div>
              <h3 className="font-heading font-semibold text-lg mb-4 text-white">Contact</h3>
              <div className="space-y-3">
                {(data?.contacts || []).map((contact) => (
                  <div key={contact.id} className="flex items-start gap-3 text-gray-400">
                    <div className="w-8 h-8 rounded-lg glass flex items-center justify-center flex-shrink-0 mt-0.5">
                      <IconByName name={contact.iconName} className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-sm whitespace-pre-line leading-relaxed pt-1">
                      {contact.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">{copyright}</p>
        </div>
      </div>
    </footer>
  )
}
