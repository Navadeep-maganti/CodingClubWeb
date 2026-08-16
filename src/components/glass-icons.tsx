"use client"

import React from "react"
import { cn } from "@/lib/utils"

export interface GlassIconsItem {
  icon: React.ReactElement
  color: string
  label: string
  customClass?: string
  href?: string
  onClick?: () => void
}

export interface GlassIconsProps {
  items: GlassIconsItem[]
  className?: string
  size?: "sm" | "md" | "lg"
}

const gradientMapping: Record<string, string> = {
  blue: "linear-gradient(hsl(223, 90%, 50%), hsl(208, 90%, 50%))",
  purple: "linear-gradient(hsl(283, 90%, 50%), hsl(268, 90%, 50%))",
  red: "linear-gradient(hsl(3, 90%, 50%), hsl(348, 90%, 50%))",
  indigo: "linear-gradient(hsl(253, 90%, 50%), hsl(238, 90%, 50%))",
  orange: "linear-gradient(hsl(43, 90%, 50%), hsl(28, 90%, 50%))",
  green: "linear-gradient(hsl(123, 90%, 40%), hsl(108, 90%, 40%))",
  cyan: "linear-gradient(hsl(183, 90%, 50%), hsl(168, 90%, 50%))",
  pink: "linear-gradient(hsl(323, 90%, 60%), hsl(343, 90%, 60%))",
}

const getBackgroundStyle = (color: string): React.CSSProperties => {
  if (gradientMapping[color]) {
    return { background: gradientMapping[color] }
  }
  return { background: color }
}

const sizeClasses = {
  sm: "icon-btn--sm",
  md: "icon-btn--md",
  lg: "icon-btn--lg",
}

/**
 * Premium glass icon button group with gradient backgrounds, animated hover
 * states, and accessibility labels. Used for social links, action buttons,
 * and premium feature icons across the site.
 */
const GlassIcons: React.FC<GlassIconsProps> = ({
  items,
  className,
  size = "md",
}) => {
  return (
    <div className={cn("icon-btns", className)}>
      {items.map((item, index) => {
        const Tag = item.href ? "a" : "button"
        const extraProps: any = item.href
          ? { href: item.href, target: "_blank", rel: "noopener noreferrer" }
          : { type: "button" }
        return (
          <Tag
            key={index}
            {...extraProps}
            onClick={item.onClick}
            className={cn(
              "icon-btn",
              item.customClass,
              sizeClasses[size],
            )}
            aria-label={item.label}
            title={item.label}
          >
            <span
              className="icon-btn__back"
              style={getBackgroundStyle(item.color)}
            />
            <span className="icon-btn__front">
              <span className="icon-btn__icon" aria-hidden="true">
                {item.icon}
              </span>
            </span>
            <span className="icon-btn__label">{item.label}</span>
          </Tag>
        )
      })}
    </div>
  )
}

export default GlassIcons

/**
 * A single premium glass icon button (for standalone usage).
 */
export function GlassIcon({
  icon,
  color,
  label,
  href,
  onClick,
  size = "md",
  customClass,
}: GlassIconsItem & { size?: "sm" | "md" | "lg" }) {
  const Tag = href ? "a" : "button"
  const extraProps: any = href
    ? { href, target: "_blank", rel: "noopener noreferrer" }
    : { type: "button" }
  return (
    <Tag
      {...extraProps}
      onClick={onClick}
      className={cn("icon-btn", customClass, sizeClasses[size])}
      aria-label={label}
      title={label}
    >
      <span className="icon-btn__back" style={getBackgroundStyle(color)} />
      <span className="icon-btn__front">
        <span className="icon-btn__icon" aria-hidden="true">
          {icon}
        </span>
      </span>
      <span className="icon-btn__label">{label}</span>
    </Tag>
  )
}
