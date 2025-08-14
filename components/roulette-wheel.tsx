"use client"

import { useEffect, useMemo, useRef, useState } from "react"

type Props = {
items: string[]
spinKey: number
targetIndex: number | null
onDone?: (winnerIndex: number, name: string) => void
resetKey?: number
}

const TAU = Math.PI * 2
const BASE_ROT = -Math.PI / 2

function easeOutCubic(t: number) {
return 1 - Math.pow(1 - t, 3)
}

export default function RouletteWheel({
items,
spinKey,
targetIndex,
onDone,
resetKey,
}: Props) {
const containerRef = useRef<HTMLDivElement | null>(null)
const canvasRef = useRef<HTMLCanvasElement | null>(null)
const rafRef = useRef<number | null>(null)
const rotationRef = useRef(0) // radians
const startRotationRef = useRef(0)
const startTimeRef = useRef<number | null>(null)
const durationRef = useRef(3500) // ms
const finalRotationRef = useRef(0)
const [size, setSize] = useState(360)
const itemsAtStartRef = useRef<string[]>([])

// Colors for segments
const colors = useMemo(() => {
  const n = Math.max(items.length, 1)
  const arr = Array.from({ length: n }, (_, i) => {
    const hue = Math.round((360 * i) / n)
    const light = i % 2 === 0 ? 58 : 48
    return `hsl(${hue} 85% ${light}%)`
  })
  return arr
}, [items.length])

// Resize canvas to container
useEffect(() => {
  const el = containerRef.current
  if (!el) return
  const ro = new ResizeObserver((entries) => {
    const entry = entries[0]
    const w = Math.min(420, entry.contentRect.width)
    setSize(Math.max(220, Math.floor(w)))
  })
  ro.observe(el)
  return () => ro.disconnect()
}, [])

// Reset rotation if asked
useEffect(() => {
  rotationRef.current = 0
  draw()
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [resetKey, items.length, size])

// Draw wheel on updates
useEffect(() => {
  draw()
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [size, items, colors])

// Handle spin trigger
useEffect(() => {
  if (targetIndex == null || items.length === 0) return
  // compute final rotation to land targetIndex at pointer top (-PI/2)
  const anglePer = TAU / items.length
  const mid = targetIndex * anglePer + anglePer / 2
  // Con BASE_ROT = -PI/2, para alinear el centro del segmento con la flecha superior,
  // necesitamos que rotationRef.current sea -mid (más giros completos)
  const baseTarget = -mid
  const current = rotationRef.current
  const extraSpins = 3 + Math.floor(Math.random() * 2) // 3-4 vueltas extra
  const k = Math.ceil((current - baseTarget) / TAU) + extraSpins
  const finalRotation = baseTarget + TAU * k

  startRotationRef.current = current
  finalRotationRef.current = finalRotation
  startTimeRef.current = null
  durationRef.current = 2600 + Math.random() * 1200
  itemsAtStartRef.current = items.slice()

  if (rafRef.current) cancelAnimationFrame(rafRef.current)
  rafRef.current = requestAnimationFrame(tick)
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [spinKey])

function normalizeAngle(a: number) {
  let x = a % TAU
  if (x < 0) x += TAU
  return x
}

function tick(ts: number) {
  if (!startTimeRef.current) startTimeRef.current = ts
  const elapsed = ts - startTimeRef.current
  const t = Math.min(1, elapsed / durationRef.current)
  const e = easeOutCubic(t)
  const rot =
    startRotationRef.current +
    (finalRotationRef.current - startRotationRef.current) * e
  rotationRef.current = rot
  draw()
  if (t < 1) {
    rafRef.current = requestAnimationFrame(tick)
  } else {
    rotationRef.current = finalRotationRef.current
    draw()
    const n = itemsAtStartRef.current.length || items.length
    if (n > 0) {
      const anglePer = TAU / n
      const rot = rotationRef.current
      const pointerWheel = normalizeAngle(-rot)
      let idx = Math.floor(normalizeAngle(pointerWheel + anglePer / 2) / anglePer)
      idx = ((idx % n) + n) % n
      const winnerName = itemsAtStartRef.current[idx] ?? items[idx] ?? ""
      onDone?.(idx, winnerName)
    }
  }
}

function draw() {
  const canvas = canvasRef.current
  if (!canvas) return
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
  const side = size
  const radius = (side / 2) * 0.95
  canvas.width = side * dpr
  canvas.height = side * dpr
  canvas.style.width = `${side}px`
  canvas.style.height = `${side}px`
  ctx.resetTransform()
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, side, side)

  // background circle
  ctx.save()
  ctx.translate(side / 2, side / 2)
  ctx.rotate(BASE_ROT + rotationRef.current)

  // Draw segments
  const n = Math.max(items.length, 1)
  const anglePer = TAU / n
  for (let i = 0; i < n; i++) {
    const start = i * anglePer
    const end = start + anglePer
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.arc(0, 0, radius, start, end)
    ctx.closePath()
    ctx.fillStyle = items[i] ? colors[i] : "hsl(0 0% 92%)"
    ctx.fill()
    ctx.strokeStyle = "hsl(0 0% 100%)"
    ctx.lineWidth = 1.25
    ctx.stroke()

    // Label
    const name = items[i] ?? ""
    if (name) {
      const mid = start + anglePer / 2

      // Radio donde colocamos el texto y posición cartesiana
      const rText = radius * 0.68
      const px = Math.cos(mid) * rText
      const py = Math.sin(mid) * rText

      // Ancho de la cuerda del segmento a ese radio (reduce solapamiento)
      const chord = Math.max(20, 2 * rText * Math.sin(anglePer / 2) - 8)

      ctx.save()
      // Colocar el texto en el centro del segmento
      ctx.translate(px, py)

      // Mantener el texto horizontal en pantalla (sin rotación adicional)
      ctx.fillStyle = "hsl(0 0% 12%)"
      const fontSize = Math.max(10, Math.min(14, chord / 8))
      ctx.font = `500 ${fontSize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Ajustar el texto para que no exceda el ancho disponible del segmento
      const maxWidth = chord * 0.9
      ;(function drawFitted(ctx2: CanvasRenderingContext2D, text: string, mw: number) {
        let display = text
        while (ctx2.measureText(display).width > mw && display.length > 3) {
          display = display.slice(0, -2)
        }
        if (display.length < text.length) {
          display = display.slice(0, -1) + "…"
        }
        ctx2.fillText(display, 0, 0)
      })(ctx, name, maxWidth)

      ctx.restore()
    }
  }

  // Center circle
  ctx.beginPath()
  ctx.arc(0, 0, radius * 0.06, 0, TAU)
  ctx.fillStyle = "hsl(0 0% 12%)"
  ctx.fill()

  ctx.restore()
}

function drawFittedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
) {
  let display = text
  while (ctx.measureText(display).width > maxWidth && display.length > 3) {
    display = display.slice(0, -2)
  }
  if (display.length < text.length) {
    display = display.slice(0, -1) + "…"
  }
  ctx.fillText(display, 0, 0)
}

return (
  <div ref={containerRef} className="relative mx-auto aspect-square w-full">
    <canvas ref={canvasRef} aria-label="Ruleta de nombres" role="img">
      {'Tu navegador no soporta el elemento canvas.'}
    </canvas>
    {/* Pointer */}
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
    >
      <div
        className="h-0 w-0"
        style={{
          borderLeft: "12px solid transparent",
          borderRight: "12px solid transparent",
          borderTop: "18px solid hsl(0 0% 12%)",
        }}
      />
    </div>
    <span className="sr-only">
      La flecha en la parte superior indica el resultado al finalizar el giro.
    </span>
  </div>
)
}
