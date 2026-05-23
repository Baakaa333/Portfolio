import { useEffect, useRef } from 'react'

// Katakana + Latin + digits — classic Matrix charset
const CHARS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン' +
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>[]{}|'

const CHAR_SIZE = 13
const OPACITY   = 0.13   // overall canvas opacity — keeps it as atmosphere
const FPS_CAP   = 28     // target FPS — deliberately capped to save CPU

export default function MatrixRain({ style }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let animId
    let lastTime = 0
    const frameInterval = 1000 / FPS_CAP

    // Column state
    let cols = 0
    let drops = []

    const init = () => {
      const W = canvas.offsetWidth
      const H = canvas.offsetHeight
      canvas.width  = W
      canvas.height = H
      cols  = Math.ceil(W / CHAR_SIZE)
      drops = Array.from({ length: cols }, () => Math.random() * -50)
    }

    const draw = (ts) => {
      animId = requestAnimationFrame(draw)
      if (ts - lastTime < frameInterval) return
      lastTime = ts

      // Fading trail
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < cols; i++) {
        const ch   = CHARS[Math.floor(Math.random() * CHARS.length)]
        const x    = i * CHAR_SIZE
        const y    = drops[i] * CHAR_SIZE

        // Leading char — bright cyan/green
        ctx.font        = `${CHAR_SIZE}px "JetBrains Mono", monospace`
        ctx.globalAlpha = OPACITY * 2.5
        ctx.fillStyle   = '#00ffe0'
        ctx.fillText(ch, x, y)

        // Secondary char behind it — dimmer
        if (drops[i] > 2) {
          const ch2 = CHARS[Math.floor(Math.random() * CHARS.length)]
          ctx.globalAlpha = OPACITY * 1.4
          ctx.fillStyle   = '#00cc80'
          ctx.fillText(ch2, x, (drops[i] - 2) * CHAR_SIZE)
        }

        ctx.globalAlpha = 1

        // Reset drop to top with randomised delay
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i] += 0.5 + Math.random() * 0.5
      }
    }

    init()
    animId = requestAnimationFrame(draw)

    const ro = new ResizeObserver(init)
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width:  '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        ...style,
      }}
    />
  )
}
