import { useEffect, useRef } from 'react'

// Full-screen RGB glitch effect shown during 'sudo su' → hacker transition
export default function GlitchOverlay() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let frame = 0
    let raf

    const draw = () => {
      frame++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Red channel shift
      ctx.globalAlpha = 0.85
      ctx.fillStyle = `rgba(200, 0, 0, ${0.3 + Math.random() * 0.4})`

      const slices = 8 + Math.floor(Math.random() * 12)
      for (let i = 0; i < slices; i++) {
        const y = Math.random() * canvas.height
        const h = 2 + Math.random() * 40
        const offset = (Math.random() - 0.5) * 30
        ctx.fillRect(offset, y, canvas.width, h)
      }

      // Noise pixels
      ctx.globalAlpha = 0.6
      for (let n = 0; n < 300; n++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const r = Math.floor(Math.random() * 255)
        ctx.fillStyle = `rgb(${r},0,0)`
        ctx.fillRect(x, y, 2, 2)
      }

      // White flash on alternating frames
      if (frame % 8 === 0) {
        ctx.globalAlpha = 0.08
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
        mixBlendMode: 'screen',
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(8,0,0,0.7)',
          animation: 'flicker 0.1s step-end infinite',
        }}
      />
    </div>
  )
}
