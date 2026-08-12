"use client"

import dynamic from "next/dynamic"
import { Suspense, useSyncExternalStore } from "react"

/**
 * Lazy-load Scanner only on capable devices (skips SSR).
 * Falls back to a CSS gradient when WebGL2 is unavailable or
 * prefers-reduced-motion is set.
 */
const Scanner = dynamic(() => import("@/components/scanner-background"), {
  ssr: false,
  loading: () => <div className="scanner-container scanner-fallback" aria-hidden />,
})

// Detect client-side mount without triggering setState-in-effect lint
const emptySubscribe = () => () => {}
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
}

interface PremiumPageBackgroundProps {
  /** Optional className to append to the background wrapper */
  className?: string
  /** Override default colors */
  color1?: string
  color2?: string
  color3?: string
  /** Opacity 0-1 */
  opacity?: number
  /** Direction of the scan */
  direction?: "vertical" | "horizontal" | "diagonal"
}

/**
 * Premium animated page background used on all pages EXCEPT the landing page.
 * The landing page has its own cinematic hero background.
 *
 * Renders a fixed-position Scanner WebGL canvas behind the page content.
 */
export default function PremiumPageBackground({
  className,
  color1 = "#4A90E2",
  color2 = "#9B59B6",
  color3 = "#FFFFFF",
  opacity = 0.4,
  direction = "vertical",
}: PremiumPageBackgroundProps) {
  const mounted = useMounted()

  if (!mounted) {
    return (
      <div className="fixed inset-0 -z-10 scanner-container scanner-fallback" aria-hidden>
        <div className={className} />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden>
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E] via-[#0D1424] to-[#0A0F1E]" />
      {/* Scanner WebGL layer */}
      <Suspense fallback={<div className="scanner-container scanner-fallback" />}>
        <Scanner
          color1={color1}
          color2={color2}
          color3={color3}
          opacity={opacity}
          scanDirection={direction}
          speed={0.3}
          brightness={0.7}
          glow={0.15}
          className={className}
        />
      </Suspense>
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-20" />
      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </div>
  )
}
