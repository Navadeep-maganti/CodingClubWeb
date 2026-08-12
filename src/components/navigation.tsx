"use client"

import { useState, useEffect, useMemo, useSyncExternalStore } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Menu, X, Sparkles, LogIn, LayoutDashboard, LogOut, User, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { cn } from "@/lib/utils"

// Detect client-side mount without triggering setState-in-effect lint
const emptySubscribe = () => () => {}
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // client snapshot — always true once hydrated
    () => false, // server snapshot — false during SSR
  )
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const mounted = useMounted()
  const pathname = usePathname()
  const { data: session, status } = useSession()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Only treat as logged-in after mount to avoid SSR hydration mismatch
  const isLoggedIn = mounted && status === "authenticated" && !!session?.user
  const roles = (session?.user?.roles || []) as string[]
  const isAdminLike = isLoggedIn && (roles.includes("SUPER_ADMIN") || roles.includes("ADMIN") || roles.includes("BLOG_AUTHOR"))
  const dashboardHref = isAdminLike ? "/dashboard/admin" : "/dashboard/member"

  const navItems = useMemo(
    () => [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/events", label: "Events" },
      { href: "/team", label: "Team" },
      { href: "/resources", label: "Resources" },
      { href: "/blog", label: "Blog" },
    ],
    [],
  )

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-500",
        scrolled
          ? "glass-strong border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
          : "glass border-b border-transparent",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 overflow-hidden transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                <Image
                  src="/images/coding-club-logo.png"
                  alt="Coding Club"
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-white text-xl font-bold font-heading tracking-tight">
              Coding Club
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group",
                      isActive
                        ? "text-white"
                        : "text-gray-300 hover:text-white",
                    )}
                  >
                    <span className="relative z-10">{item.label}</span>
                    <div
                      className={cn(
                        "absolute inset-0 rounded-lg transition-all duration-300",
                        isActive
                          ? "bg-white/10 opacity-100"
                          : "bg-white/0 group-hover:bg-white/5 opacity-0 group-hover:opacity-100",
                      )}
                    />
                    <div
                      className={cn(
                        "absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300 rounded-full",
                        isActive ? "w-8 opacity-100" : "w-0 group-hover:w-6 opacity-0 group-hover:opacity-100",
                      )}
                    />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link href={dashboardHref}>
                  <Button
                    variant="outline"
                    className="glass border-white/10 text-white hover:bg-white/10 px-5 py-2 rounded-lg font-medium transition-all duration-300 btn-premium"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <UserAvatar session={session} />
              </>
            ) : (
              <>
                <Button
                  asChild
                  variant="outline"
                  className="glass border-white/10 text-white hover:bg-white/10 px-5 py-2 rounded-lg font-medium transition-all duration-300 btn-premium"
                >
                  <Link href="/login">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Link>
                </Button>
                <Button
                  asChild
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 group cursor-pointer btn-premium"
                >
                  <a href="https://discord.gg/DjHkM7TMDK" target="_blank" rel="noopener noreferrer">
                    <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    Get Started
                  </a>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white p-2 rounded-lg transition-colors duration-300 hover:bg-white/5"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div key={pathname} className="md:hidden glass-strong border-t border-white/10 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-4 pb-6 space-y-1">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block px-4 py-3 rounded-lg text-base font-medium transition-all duration-300",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-gray-300 hover:text-white hover:bg-white/5",
                  )}
                  onClick={() => setIsOpen(false)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {item.label}
                </Link>
              )
            })}
            <div className="px-4 pt-4 space-y-2">
              {isLoggedIn ? (
                <>
                  <Link
                    href={dashboardHref}
                    onClick={() => setIsOpen(false)}
                  >
                    <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold btn-premium">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full glass border-white/10 text-white hover:bg-white/5 py-3 rounded-lg"
                    onClick={() => {
                      setIsOpen(false)
                      signOut({ callbackUrl: "/" })
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full glass border-white/10 text-white hover:bg-white/5 py-3 rounded-lg font-semibold btn-premium"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                  <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold btn-premium">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

/**
 * Premium user avatar with dropdown menu.
 */
function UserAvatar({ session }: { session: any }) {
  const [open, setOpen] = useState(false)
  const user = session?.user
  if (!user) return null
  const isAdminLike = user.roles?.includes("SUPER_ADMIN") || user.roles?.includes("ADMIN") || user.roles?.includes("BLOG_AUTHOR")
  const initial = (user.name || user.email || "?").charAt(0).toUpperCase()

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors group"
        aria-label="User menu"
        aria-expanded={open}
      >
        {user.image ? (
           
          <img
            src={user.image}
            alt={user.name || "user"}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-primary/50 transition-all"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold ring-2 ring-white/10 group-hover:ring-primary/50 transition-all">
            {initial}
          </div>
        )}
        <ChevronDown className={cn("w-3 h-3 text-gray-400 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 glass-strong rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-white/10 bg-white/5">
            <p className="text-white text-sm font-semibold truncate">{user.name || "Member"}</p>
            <p className="text-gray-400 text-xs truncate">{user.email}</p>
            {user.roles && user.roles.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {user.roles.map((r: string) => (
                  <span
                    key={r}
                    className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[10px] font-medium border border-blue-500/30"
                  >
                    {r.replace("_", " ")}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="py-1">
            <Link
              href={isAdminLike ? "/dashboard/admin" : "/dashboard/member"}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:text-white hover:bg-white/5 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            {!isAdminLike && (
              <Link
                href="/dashboard/member"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:text-white hover:bg-white/5 transition-colors"
              >
                <User className="w-4 h-4" />
                My Profile
              </Link>
            )}
          </div>
          <div className="border-t border-white/10">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
