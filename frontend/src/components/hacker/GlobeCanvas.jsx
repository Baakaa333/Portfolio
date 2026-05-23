import { useEffect, useRef, useCallback } from 'react'
import { PROFILE } from '../../data/profile'

// ── Simplified land-dot dataset (lat, lng pairs — Mercator sampled) ──────────
// A lightweight set of points covering major landmasses
const LAND_POINTS = (() => {
  const pts = []
  // North America
  for (let lat = 25; lat <= 70; lat += 3) {
    for (let lng = -140; lng <= -60; lng += 4) {
      if (Math.random() > 0.45) pts.push([lat, lng])
    }
  }
  // Europe
  for (let lat = 35; lat <= 70; lat += 3) {
    for (let lng = -10; lng <= 40; lng += 4) {
      if (Math.random() > 0.35) pts.push([lat, lng])
    }
  }
  // Asia
  for (let lat = 10; lat <= 70; lat += 3) {
    for (let lng = 60; lng <= 145; lng += 4) {
      if (Math.random() > 0.38) pts.push([lat, lng])
    }
  }
  // Africa
  for (let lat = -35; lat <= 38; lat += 3) {
    for (let lng = -20; lng <= 52; lng += 4) {
      if (Math.random() > 0.42) pts.push([lat, lng])
    }
  }
  // South America
  for (let lat = -55; lat <= 12; lat += 3) {
    for (let lng = -80; lng <= -34; lng += 4) {
      if (Math.random() > 0.42) pts.push([lat, lng])
    }
  }
  // Australia
  for (let lat = -44; lat <= -10; lat += 3) {
    for (let lng = 114; lng <= 154; lng += 4) {
      if (Math.random() > 0.45) pts.push([lat, lng])
    }
  }
  // Nepal / South Asia dense cluster
  for (let lat = 10; lat <= 30; lat += 2) {
    for (let lng = 68; lng <= 95; lng += 2) {
      if (Math.random() > 0.3) pts.push([lat, lng])
    }
  }
  return pts
})()

// ── Project lat/lng → 3D unit sphere → orthographic 2D ───────────────────────
function project(lat, lng, rotY, cx, cy, R) {
  const phi   = ((90 - lat) * Math.PI) / 180
  const theta = ((lng + rotY) * Math.PI) / 180
  const x3    = Math.sin(phi) * Math.cos(theta)
  const y3    = Math.cos(phi)
  const z3    = Math.sin(phi) * Math.sin(theta)
  return { x: cx + R * x3, y: cy - R * y3, z: z3, visible: x3 < 0 ? false : z3 > 0 }
}

// ── Animated data arc state ───────────────────────────────────────────────────
let arcPool = []

export default function GlobeCanvas({ targetedNode, onNodeClick }) {
  const canvasRef  = useRef(null)
  const stateRef   = useRef({ rotY: 0, pulseT: 0, arcs: [], hoveredNode: null })
  const animRef    = useRef(null)

  const nodes = PROFILE.projects.map(p => ({ ...p }))

  // ── Spawn a new arc between two random nodes ──────────────────────────────
  const spawnArc = useCallback(() => {
    if (nodes.length < 2) return
    const a = nodes[Math.floor(Math.random() * nodes.length)]
    let b
    do { b = nodes[Math.floor(Math.random() * nodes.length)] } while (b.id === a.id)
    stateRef.current.arcs.push({
      fromLat: a.position.lat, fromLng: a.position.lng,
      toLat:   b.position.lat, toLng:   b.position.lng,
      color:   a.color || '#00ffe0',
      t: 0, speed: 0.008 + Math.random() * 0.006,
    })
  }, [nodes])

  useEffect(() => {
    const canvas  = canvasRef.current
    if (!canvas) return
    const ctx     = canvas.getContext('2d')
    let lastArc   = 0

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const render = (ts) => {
      animRef.current = requestAnimationFrame(render)

      const W  = canvas.width
      const H  = canvas.height
      const cx = W / 2
      const cy = H / 2
      const R  = Math.min(W, H) * 0.42

      const st = stateRef.current
      st.rotY   += 0.12   // degrees per frame — slow auto-rotation
      st.pulseT += 0.05

      ctx.clearRect(0, 0, W, H)

      // ── Globe sphere base ─────────────────────────────────────────────────
      const sphere = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.2, R * 0.1, cx, cy, R)
      sphere.addColorStop(0, 'rgba(0,30,25,0.95)')
      sphere.addColorStop(1, 'rgba(0,8,8,0.98)')
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fillStyle = sphere
      ctx.fill()

      // Subtle rim glow
      const rim = ctx.createRadialGradient(cx, cy, R * 0.88, cx, cy, R)
      rim.addColorStop(0, 'transparent')
      rim.addColorStop(1, 'rgba(0,255,200,0.12)')
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fillStyle = rim
      ctx.fill()

      // ── Land dots ──────────────────────────────────────────────────────────
      for (const [lat, lng] of LAND_POINTS) {
        const p = project(lat, lng, st.rotY, cx, cy, R)
        if (!p.visible) continue
        const alpha = Math.max(0, p.z) * 0.7 + 0.1
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.1, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,255,180,${alpha * 0.55})`
        ctx.fill()
      }

      // ── Lat/lng grid lines (faint) ─────────────────────────────────────────
      ctx.strokeStyle = 'rgba(0,255,180,0.04)'
      ctx.lineWidth   = 0.5
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath()
        let first = true
        for (let lng = -180; lng <= 180; lng += 3) {
          const p = project(lat, lng, st.rotY, cx, cy, R)
          if (!p.visible) { first = true; continue }
          first ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
          first = false
        }
        ctx.stroke()
      }
      for (let lng = -180; lng < 180; lng += 30) {
        ctx.beginPath()
        let first = true
        for (let lat = -80; lat <= 80; lat += 3) {
          const p = project(lat, lng, st.rotY, cx, cy, R)
          if (!p.visible) { first = true; continue }
          first ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
          first = false
        }
        ctx.stroke()
      }

      // ── Data arcs ─────────────────────────────────────────────────────────
      if (ts - lastArc > 2800) {
        spawnArc()
        lastArc = ts
      }
      st.arcs = st.arcs.filter(arc => arc.t <= 1.05)
      for (const arc of st.arcs) {
        arc.t += arc.speed
        const from = project(arc.fromLat, arc.fromLng, st.rotY, cx, cy, R)
        const to   = project(arc.toLat,   arc.toLng,   st.rotY, cx, cy, R)
        if (!from.visible || !to.visible) continue

        // Bézier control point — lifted toward the viewer (z out)
        const midX  = (from.x + to.x) / 2
        const midY  = (from.y + to.y) / 2 - R * 0.35

        const alpha = Math.sin(arc.t * Math.PI) * 0.85
        ctx.beginPath()

        // Draw arc up to t progress using quadratic sampling
        const steps = 40
        let first   = true
        for (let i = 0; i <= steps * arc.t; i++) {
          const tt = i / steps
          const bx = (1 - tt) * (1 - tt) * from.x + 2 * (1 - tt) * tt * midX + tt * tt * to.x
          const by = (1 - tt) * (1 - tt) * from.y + 2 * (1 - tt) * tt * midY + tt * tt * to.y
          first ? ctx.moveTo(bx, by) : ctx.lineTo(bx, by)
          first = false
        }
        ctx.strokeStyle = arc.color + Math.floor(alpha * 255).toString(16).padStart(2, '0')
        ctx.lineWidth   = 1.5
        ctx.shadowColor = arc.color
        ctx.shadowBlur  = 8
        ctx.stroke()
        ctx.shadowBlur  = 0
      }

      // ── Project nodes ──────────────────────────────────────────────────────
      const projectedNodes = []
      for (const node of nodes) {
        const p = project(node.position.lat, node.position.lng, st.rotY, cx, cy, R)
        projectedNodes.push({ ...node, px: p.x, py: p.y, visible: p.visible })
        if (!p.visible) continue

        const isTargeted = targetedNode === node.id
        const isHovered  = st.hoveredNode === node.id
        const pulse      = Math.sin(st.pulseT + nodes.indexOf(node)) * 0.5 + 0.5

        // Outer pulse ring
        const outerR = isTargeted ? 12 + pulse * 6 : 8 + pulse * 3
        ctx.beginPath()
        ctx.arc(p.x, p.y, outerR, 0, Math.PI * 2)
        ctx.strokeStyle = isTargeted
          ? `rgba(0,255,65,${0.3 + pulse * 0.4})`
          : `rgba(0,255,220,${0.15 + pulse * 0.25})`
        ctx.lineWidth   = 1.5
        ctx.shadowColor = isTargeted ? '#00ff41' : node.color || '#00ffe0'
        ctx.shadowBlur  = isTargeted ? 18 : 10
        ctx.stroke()
        ctx.shadowBlur  = 0

        // Inner core dot
        ctx.beginPath()
        ctx.arc(p.x, p.y, isTargeted || isHovered ? 4 : 3, 0, Math.PI * 2)
        ctx.fillStyle   = isTargeted ? '#00ff41' : (node.color || '#00ffe0')
        ctx.shadowColor = ctx.fillStyle
        ctx.shadowBlur  = 14
        ctx.fill()
        ctx.shadowBlur  = 0

        // Label
        if (isTargeted || isHovered) {
          ctx.font        = '10px "JetBrains Mono", monospace'
          ctx.fillStyle   = isTargeted ? '#00ff41' : '#00ffe0'
          ctx.shadowColor = ctx.fillStyle
          ctx.shadowBlur  = 8
          ctx.fillText(`[${node.ip}] ${node.title}`, p.x + 10, p.y - 6)
          ctx.shadowBlur  = 0
        }
      }
      stateRef.current._projectedNodes = projectedNodes
    }

    animRef.current = requestAnimationFrame(render)

    // ── Mouse hover detection ───────────────────────────────────────────────
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const mx   = e.clientX - rect.left
      const my   = e.clientY - rect.top
      const pn   = stateRef.current._projectedNodes || []
      let   hit  = null
      for (const n of pn) {
        if (!n.visible) continue
        const d = Math.hypot(n.px - mx, n.py - my)
        if (d < 18) { hit = n.id; break }
      }
      stateRef.current.hoveredNode = hit
      canvas.style.cursor = hit ? 'pointer' : 'default'
    }

    const onClick = (e) => {
      const rect = canvas.getBoundingClientRect()
      const mx   = e.clientX - rect.left
      const my   = e.clientY - rect.top
      const pn   = stateRef.current._projectedNodes || []
      for (const n of pn) {
        if (!n.visible) continue
        const d = Math.hypot(n.px - mx, n.py - my)
        if (d < 18) { onNodeClick?.(n); return }
      }
    }

    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('click', onClick)

    return () => {
      cancelAnimationFrame(animRef.current)
      ro.disconnect()
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('click', onClick)
    }
  }, [spawnArc, targetedNode, onNodeClick])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      {/* Node legend below */}
      <div style={{
        position: 'absolute', bottom: 6, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', gap: '1.5rem',
        fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem',
        flexWrap: 'wrap', padding: '0 0.5rem',
      }}>
        {PROFILE.projects.map(n => (
          <span
            key={n.id}
            onClick={() => onNodeClick?.(n)}
            style={{
              cursor: 'pointer',
              color: targetedNode === n.id ? '#00ff41' : (n.color || '#00ffe0'),
              textShadow: `0 0 8px currentColor`,
              opacity: targetedNode === n.id ? 1 : 0.65,
              transition: 'opacity 0.2s',
            }}
          >
            ◉ [{n.ip}] {n.title}
          </span>
        ))}
      </div>
    </div>
  )
}
