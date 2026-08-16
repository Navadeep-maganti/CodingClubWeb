"use client"

import { useEffect, useRef } from "react"
import { Renderer, Program, Mesh, Triangle } from "ogl"
import { cn } from "@/lib/utils"

export type ScanDirection = "vertical" | "horizontal" | "diagonal"

export interface ScannerProps {
  color1?: string
  color2?: string
  color3?: string
  speed?: number
  sweepSpeed?: number
  sweepWidth?: number
  sweepFalloff?: number
  scale?: number
  frequency?: number
  ripple?: number
  bandDensity?: number
  lineSharpness?: number
  glow?: number
  scanDirection?: ScanDirection
  colorSpread?: number
  brightness?: number
  contrast?: number
  softness?: number
  vignette?: number
  scanline?: boolean
  grain?: boolean
  grainIntensity?: number
  opacity?: number
  mouseInteraction?: boolean
  mouseRadius?: number
  mouseStrength?: number
  className?: string
}

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return [1, 1, 1]
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ]
}

const directionToFloat = (dir: ScanDirection): number =>
  dir === "horizontal" ? 1.0 : dir === "diagonal" ? 2.0 : 0.0

const vertex = /* glsl */ `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragment = /* glsl */ `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uSweepSpeed;
uniform float uSweepWidth;
uniform float uSweepFalloff;
uniform float uScale;
uniform float uFrequency;
uniform float uRipple;
uniform float uBandDensity;
uniform float uLineSharpness;
uniform float uGlow;
uniform float uColorSpread;
uniform float uBrightness;
uniform float uContrast;
uniform float uSoftness;
uniform float uVignette;
uniform float uOpacity;
uniform float uScanline;
uniform float uGrain;
uniform float uGrainIntensity;
uniform float uDirection;
uniform vec2 uMouse;
uniform float uMouseEnabled;
uniform float uMouseRadius;
uniform float uMouseStrength;
uniform float uMouseActive;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;

const float TAU = 6.2831853;

float signalField(vec2 p, float t) {
  float w = sin(p.x * 1.3 + t * 0.7);
  w += sin(p.y * 1.7 - t * 0.52) * 0.8;
  w += sin((p.x + p.y) * 0.9 + t * 0.91) * 0.6;
  w += sin((p.x - p.y) * 1.53 - t * 0.63) * 0.42;
  return w * 0.35;
}

vec3 palette(float f) {
  f = clamp(f, 0.0, 1.0);
  f = pow(f, uContrast);
  vec3 c = mix(uColor1, uColor2, smoothstep(0.08, 0.6, f));
  return mix(c, uColor3, smoothstep(0.68, 1.0, f));
}

float scanBand(float x, float aa, float sharp) {
  float v = mix(0.5, 0.5 + 0.5 * cos(x * TAU), aa);
  return pow(v, sharp);
}

void main() {
  float aspect = iResolution.x / iResolution.y;
  vec2 uv0 = (gl_FragCoord.xy * 2.0 - iResolution.xy) / iResolution.y;
  vec2 p = uv0 / max(uScale, 0.001);

  float t = iTime * uSpeed;

  float mouseBoost = 0.0;
  if (uMouseEnabled > 0.5) {
    vec2 mUv = vec2((uMouse.x * 2.0 - 1.0) * aspect, uMouse.y * 2.0 - 1.0);
    vec2 md = uv0 - mUv;
    float r = max(uMouseRadius, 0.001);
    mouseBoost = exp(-dot(md, md) / (r * r)) * uMouseStrength * uMouseActive;
  }

  float axis;
  if (uDirection < 0.5) axis = p.y;
  else if (uDirection < 1.5) axis = p.x;
  else axis = (p.x + p.y) * 0.70710678;

  float sig = signalField(p * uFrequency, t);
  float coord = axis + sig * uRipple;

  float phase = coord / max(uSweepWidth, 0.05) - t * uSweepSpeed;
  float sweep = pow(0.5 + 0.5 * cos(phase * TAU), max(uSweepFalloff, 0.1));

  float lc = coord * uBandDensity;
  float aa = 1.0 / (1.0 + uSoftness * fwidth(lc) * 3.0);
  aa = clamp(aa * (1.0 + mouseBoost * 0.6), 0.0, 1.0);

  float bodyBase = clamp(0.5 + 0.5 * sig, 0.0, 1.0);
  float body = bodyBase * bodyBase * uGlow * sweep;

  float sharp = max(uLineSharpness, 0.1);
  float split = uColorSpread * 0.16;
  float fr = clamp(scanBand(lc + split, aa, sharp) * sweep + body, 0.0, 1.0);
  float fg = clamp(scanBand(lc, aa, sharp) * sweep + body, 0.0, 1.0);
  float fb = clamp(scanBand(lc - split, aa, sharp) * sweep + body, 0.0, 1.0);

  vec3 col = vec3(palette(fr).r, palette(fg).g, palette(fb).b);

  float inten = (fr + fg + fb) * 0.3333333 * uBrightness;
  inten *= 1.0 + mouseBoost * 0.9;

  if (uScanline > 0.5) {
    inten *= 1.0 - 0.18 * (0.5 + 0.5 * cos(gl_FragCoord.y * 1.7));
  }

  if (uGrain > 0.5) {
    float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + iTime) * 43758.5453);
    inten += (g - 0.5) * uGrainIntensity;
  }

  inten *= clamp(1.0 - uVignette * smoothstep(0.55, 1.65, length(uv0)), 0.0, 1.0);
  inten = clamp(inten, 0.0, 1.0);

  float a = clamp(inten * uOpacity, 0.0, 1.0);
  fragColor = vec4(clamp(col, 0.0, 1.0) * a, a);
}
`

type ScannerCtx = {
  renderer: InstanceType<typeof Renderer>
  program: InstanceType<typeof Program>
  mesh: InstanceType<typeof Mesh>
}

const ctxMap = new WeakMap<HTMLDivElement, ScannerCtx>()

/**
 * Premium WebGL "Scanner" background — performant, responsive, and gracefully
 * disabled on low-end devices (no WebGL2 support).
 *
 * Used as the ambient animated background on all pages EXCEPT the landing page
 * (which has its own cinematic hero background).
 */
export default function Scanner({
  color1 = "#4A90E2",
  color2 = "#9B59B6",
  color3 = "#FFFFFF",
  speed = 0.4,
  sweepSpeed = 0.2,
  sweepWidth = 1.6,
  sweepFalloff = 6,
  scale = 1.5,
  frequency = 2,
  ripple = 0.22,
  bandDensity = 11,
  lineSharpness = 5.5,
  glow = 0.22,
  scanDirection = "vertical",
  colorSpread = 0.7,
  brightness = 0.9,
  contrast = 1.15,
  softness = 1.4,
  vignette = 0.45,
  scanline = true,
  grain = true,
  grainIntensity = 0.04,
  opacity = 0.55,
  mouseInteraction = true,
  mouseRadius = 0.5,
  mouseStrength = 0.5,
  className = "",
}: ScannerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mouseEnabledRef = useRef<boolean>(mouseInteraction)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Feature-detect WebGL2 — bail gracefully on low-end devices
    const testCanvas = document.createElement("canvas")
    const gl = testCanvas.getContext("webgl2")
    if (!gl) {
      // No WebGL2 — render a CSS gradient fallback
      container.classList.add("scanner-fallback")
      return
    }

    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) {
      container.classList.add("scanner-fallback")
      return
    }

    const renderer = new Renderer({
      webgl: 2,
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    })

    const glCtx = renderer.gl
    glCtx.clearColor(0, 0, 0, 0)
    const canvas = glCtx.canvas as HTMLCanvasElement
    canvas.style.width = "100%"
    canvas.style.height = "100%"
    canvas.style.display = "block"
    container.appendChild(canvas)

    const geometry = new Triangle(glCtx)
    const program = new Program(glCtx, {
      vertex,
      fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uSpeed: { value: speed },
        uSweepSpeed: { value: sweepSpeed },
        uSweepWidth: { value: sweepWidth },
        uSweepFalloff: { value: sweepFalloff },
        uScale: { value: scale },
        uFrequency: { value: frequency },
        uRipple: { value: ripple },
        uBandDensity: { value: bandDensity },
        uLineSharpness: { value: lineSharpness },
        uGlow: { value: glow },
        uColorSpread: { value: colorSpread },
        uBrightness: { value: brightness },
        uContrast: { value: contrast },
        uSoftness: { value: softness },
        uVignette: { value: vignette },
        uOpacity: { value: opacity },
        uScanline: { value: scanline ? 1.0 : 0.0 },
        uGrain: { value: grain ? 1.0 : 0.0 },
        uGrainIntensity: { value: grainIntensity },
        uDirection: { value: directionToFloat(scanDirection) },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
        uMouseEnabled: { value: mouseInteraction ? 1.0 : 0.0 },
        uMouseRadius: { value: mouseRadius },
        uMouseStrength: { value: mouseStrength },
        uMouseActive: { value: 0.0 },
        uColor1: { value: new Float32Array(hexToRgb(color1)) },
        uColor2: { value: new Float32Array(hexToRgb(color2)) },
        uColor3: { value: new Float32Array(hexToRgb(color3)) },
      },
    })

    const mesh = new Mesh(glCtx, { geometry, program })
    ctxMap.set(container, { renderer, program, mesh })

    const setSize = () => {
      const rect = container.getBoundingClientRect()
      const w = Math.max(1, Math.floor(rect.width))
      const h = Math.max(1, Math.floor(rect.height))
      renderer.setSize(w, h)
      const res = (program.uniforms.iResolution as { value: Float32Array }).value
      res[0] = glCtx.drawingBufferWidth
      res[1] = glCtx.drawingBufferHeight
      renderer.render({ scene: mesh })
    }

    const ro = new ResizeObserver(setSize)
    ro.observe(container)
    setSize()

    const currentMouse: [number, number] = [0.5, 0.5]
    let targetMouse: [number, number] = [0.5, 0.5]
    let mouseActive = 0
    let targetMouseActive = 0

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      targetMouse = [
        (e.clientX - rect.left) / rect.width,
        1.0 - (e.clientY - rect.top) / rect.height,
      ]
      targetMouseActive = 1
    }
    const onMouseLeave = () => {
      targetMouseActive = 0
    }
    canvas.addEventListener("mousemove", onMouseMove)
    canvas.addEventListener("mouseleave", onMouseLeave)

    let raf = 0
    let isVisible = true
    let isPageVisible = !document.hidden
    const t0 = performance.now()

    const loop = (t: number) => {
      ;(program.uniforms.iTime as { value: number }).value = (t - t0) * 0.001

      if (!mouseEnabledRef.current) {
        targetMouseActive = 0
      }
      currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0])
      currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1])
      const m = (program.uniforms.uMouse as { value: Float32Array }).value
      m[0] = currentMouse[0]
      m[1] = currentMouse[1]
      mouseActive += 0.05 * (targetMouseActive - mouseActive)
      ;(program.uniforms.uMouseActive as { value: number }).value = mouseActive

      renderer.render({ scene: mesh })
      raf = requestAnimationFrame(loop)
    }

    const tryStart = () => {
      if (isVisible && isPageVisible && raf === 0) raf = requestAnimationFrame(loop)
    }
    const tryStop = () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
        if (isVisible) tryStart()
        else tryStop()
      },
      { threshold: 0 },
    )
    io.observe(container)

    const onVisibility = () => {
      isPageVisible = !document.hidden
      if (isPageVisible) tryStart()
      else tryStop()
    }
    document.addEventListener("visibilitychange", onVisibility)

    tryStart()

    return () => {
      tryStop()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      canvas.removeEventListener("mousemove", onMouseMove)
      canvas.removeEventListener("mouseleave", onMouseLeave)
      ctxMap.delete(container)
      try {
        container.removeChild(canvas)
      } catch {
        // ignore — canvas may have already been removed by React unmount
      }
      glCtx.getExtension("WEBGL_lose_context")?.loseContext()
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const ctx = ctxMap.get(container)
    if (!ctx) return
    const { program } = ctx
    const u = program.uniforms as Record<string, { value: any }>

    u.uSpeed.value = speed
    u.uSweepSpeed.value = sweepSpeed
    u.uSweepWidth.value = sweepWidth
    u.uSweepFalloff.value = sweepFalloff
    u.uScale.value = scale
    u.uFrequency.value = frequency
    u.uRipple.value = ripple
    u.uBandDensity.value = bandDensity
    u.uLineSharpness.value = lineSharpness
    u.uGlow.value = glow
    u.uColorSpread.value = colorSpread
    u.uBrightness.value = brightness
    u.uContrast.value = contrast
    u.uSoftness.value = softness
    u.uVignette.value = vignette
    u.uOpacity.value = opacity
    u.uScanline.value = scanline ? 1.0 : 0.0
    u.uGrain.value = grain ? 1.0 : 0.0
    u.uGrainIntensity.value = grainIntensity
    u.uDirection.value = directionToFloat(scanDirection)
    u.uMouseEnabled.value = mouseInteraction ? 1.0 : 0.0
    u.uMouseRadius.value = mouseRadius
    u.uMouseStrength.value = mouseStrength
    const c1 = hexToRgb(color1)
    const c2 = hexToRgb(color2)
    const c3 = hexToRgb(color3)
    u.uColor1.value[0] = c1[0]
    u.uColor1.value[1] = c1[1]
    u.uColor1.value[2] = c1[2]
    u.uColor2.value[0] = c2[0]
    u.uColor2.value[1] = c2[1]
    u.uColor2.value[2] = c2[2]
    u.uColor3.value[0] = c3[0]
    u.uColor3.value[1] = c3[1]
    u.uColor3.value[2] = c3[2]

    mouseEnabledRef.current = mouseInteraction
  }, [
    speed,
    sweepSpeed,
    sweepWidth,
    sweepFalloff,
    scale,
    frequency,
    ripple,
    bandDensity,
    lineSharpness,
    glow,
    colorSpread,
    brightness,
    contrast,
    softness,
    vignette,
    opacity,
    scanline,
    grain,
    grainIntensity,
    scanDirection,
    mouseInteraction,
    mouseRadius,
    mouseStrength,
    color1,
    color2,
    color3,
  ])

  return (
    <div
      ref={containerRef}
      className={cn("scanner-container", className)}
      aria-hidden="true"
    />
  )
}
