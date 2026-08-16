"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Magnetic hover hook — pulls an element toward the cursor while it's
 * inside the trigger area. Returns a ref to attach to the element
 * and the current x/y offset (in px).
 *
 * Inspired by the StringTune magnetic interaction from tutorial-07.
 *
 * @param strength 0-1, how strongly the element follows the cursor
 * @param radius   radius (px) of the magnetic field
 */
export function useMagnetic<T extends HTMLElement>(
  strength: number = 0.3,
  radius: number = 200,
) {
  const ref = useRef<T | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Disable on touch / small screens
    if (window.matchMedia("(hover: none)").matches) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let raf = 0
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.hypot(dx, dy)
      if (dist < radius) {
        targetX = dx * strength
        targetY = dy * strength
      } else {
        targetX = 0
        targetY = 0
      }
    }

    const onLeave = () => {
      targetX = 0
      targetY = 0
    }

    const loop = () => {
      currentX += (targetX - currentX) * 0.15
      currentY += (targetY - currentY) * 0.15
      setOffset({ x: currentX, y: currentY })
      raf = requestAnimationFrame(loop)
    }

    el.addEventListener("mousemove", onMove)
    el.addEventListener("mouseleave", onLeave)
    raf = requestAnimationFrame(loop)

    return () => {
      el.removeEventListener("mousemove", onMove)
      el.removeEventListener("mouseleave", onLeave)
      cancelAnimationFrame(raf)
    }
  }, [strength, radius])

  return { ref, offset }
}

/**
 * Spotlight hover hook — tracks cursor position relative to an element
 * and returns the position as a percentage (0-100) for use in CSS
 * `radial-gradient` spotlight effects.
 */
export function useSpotlight<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [pos, setPos] = useState({ x: 50, y: 50 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(hover: none)").matches) return

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setPos({ x, y })
    }

    el.addEventListener("mousemove", onMove)
    return () => el.removeEventListener("mousemove", onMove)
  }, [])

  return { ref, pos }
}
