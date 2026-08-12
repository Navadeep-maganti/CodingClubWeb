"use client"

import * as LucideIcons from "lucide-react"
import type { LucideIcon } from "lucide-react"

/**
 * Client-side icon resolver. Given a lucide icon name, returns the component.
 * Falls back to a default icon if the name is not found.
 */
export function getIcon(name: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>
  return icons[name] || icons.Code || icons.Circle
}

/**
 * Reusable IconByName component for rendering lucide icons by name.
 * Use this in JSX to avoid the "component created during render" lint error.
 */
export function IconByName({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>
  const Cmp = icons[name] || icons.Code
  return <Cmp className={className} />
}

