import { useEffect, useRef, useState } from 'react'
import { PROFILE } from '../../data/profile'

const DELAY = 32

// ASCII art photo placeholder frame
const ASCII_PHOTO = [
  '  ┌──────────────────────────────┐',
  '  │  ░░░░░░░░░░░░░░░░░░░░░░░░░  │',
  '  │  ░░░░░░▓▓▓▓▓▓▓▓▓▓░░░░░░░░  │',
  '  │  ░░░░▓▓▓████████▓▓▓░░░░░░  │',
  '  │  ░░░▓▓████▓▓▓▓████▓▓░░░░░  │',
  '  │  ░░▓▓███▓░░░░░░▓███▓▓░░░░  │',
  '  │  ░░▓████░ ◉  ◉ ░████▓░░░░  │',
  '  │  ░░▓████░░  ▲  ░░████▓░░░  │',
  '  │  ░░▓████▓░ ─── ░▓████▓░░░  │',
  '  │  ░░░▓▓███▓▓▓▓▓▓███▓▓░░░░░  │',
  '  │  ░░░░░▓▓███████▓▓▓░░░░░░░  │',
  '  │  ░░░░░░░░░░░░░░░░░░░░░░░░  │',
  '  │                              │',
  '  │   Prajwal Chaudhary (baakaa) │',
  '  │   Full-Stack + Cyber Sec    │',
  '  └──────────────────────────────┘',
]

function buildViewLines() {
  const m = PROFILE.meta
  const lines = []

  lines.push(...[
    '╔══════════════════════════════════════════════════════════════╗',
    `║   baakaa OS — SYSTEM PROFILE v1.0                          ║`,
    `║   Prajwal Chaudhary  |  ${m.location.padEnd(36)}║`,
    '╚══════════════════════════════════════════════════════════════╝',
    '',
  ].map(t => ({ text: t, color: '#ff0000' })))

  // ASCII photo
  lines.push(...ASCII_PHOTO.map(t => ({ text: t, color: '#882222' })))
  lines.push({ text: '', color: '#000' })

  // Identity
  lines.push(...[
    '── IDENTITY ─────────────────────────────────────────────────',
    `  Alias      : ${m.alias}`,
    `  Title      : ${m.title}`,
    `  Email      : ${m.email}`,
    `  GitHub     : ${m.github}`,
    `  Instagram  : ${m.instagram}`,
    '',
  ].map(t => ({ text: t, color: '#ff4444' })))

  // About
  lines.push({ text: '── ABOUT ────────────────────────────────────────────────────', color: '#ff0000' })
  lines.push({ text: `  ${PROFILE.about}`, color: '#ff6666' })
  lines.push({ text: '', color: '#000' })

  // Skills
  lines.push({ text: '── CAPABILITY MANIFEST ──────────────────────────────────────', color: '#ff0000' })
  PROFILE.skills.forEach(s => {
    const filled = Math.round(s.level / 10)
    const empty = 10 - filled
    const bar = '█'.repeat(filled) + '░'.repeat(empty)
    lines.push({ text: `  ${s.name.padEnd(34)} [${bar}] ${s.level}%`, color: '#ff3333' })
  })
  lines.push({ text: '', color: '#000' })

  // Projects
  lines.push({ text: '── PROJECT NODES ────────────────────────────────────────────', color: '#ff0000' })
  PROFILE.projects.forEach(p => {
    lines.push({ text: `  ▸ [${p.ip}]  ${p.title}  (${p.status})`, color: '#00ccff' })
    lines.push({ text: `    ${p.subtitle}`, color: '#ff6666' })
    lines.push({ text: `    Stack : ${p.tech.join(', ')}`, color: '#441111' })
    lines.push({ text: `    Impact: ${p.impact}`, color: '#441111' })
    lines.push({ text: '', color: '#000' })
  })

  // Education
  lines.push({ text: '── EDUCATION ────────────────────────────────────────────────', color: '#ff0000' })
  PROFILE.education.forEach(e => {
    lines.push({ text: `  ▸ ${e.degree}`, color: '#ff4444' })
    lines.push({ text: `    ${e.institution}, ${e.location}  |  ${e.year}  |  ${e.status}`, color: '#661111' })
  })
  lines.push({ text: '', color: '#000' })

  // Footer
  lines.push(...[
    '─────────────────────────────────────────────────────────────',
    "  Commands: 'mode --cli' | 'exit' | 'about system'",
    '─────────────────────────────────────────────────────────────',
    '',
  ].map(t => ({ text: t, color: '#441111' })))

  return lines
}

export default function ViewMode({ onSwitchCLI, onExit }) {
  const [visibleLines, setVisibleLines] = useState([])
  const [done, setDone] = useState(false)
  const bodyRef = useRef(null)
  const allLines = useRef(buildViewLines())

  useEffect(() => {
    let idx = 0
    const interval = setInterval(() => {
      if (idx >= allLines.current.length) { clearInterval(interval); setDone(true); return }
      setVisibleLines(prev => [...prev, { ...allLines.current[idx], id: idx }])
      idx++
      if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }, DELAY)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <div ref={bodyRef} className="terminal-body">
        {visibleLines.map(line => (
          <div
            key={line.id}
            className="t-line"
            style={{
              color: line.color,
              textShadow: line.color === '#ff0000' ? '0 0 8px rgba(255,0,0,0.4)' : 'none',
              fontWeight: line.color === '#ff0000' ? 600 : 400,
              whiteSpace: 'pre',
            }}
          >
            {line.text}
          </div>
        ))}
        {!done && <span className="blink" style={{ color: '#ff0000' }}>█</span>}
      </div>

      {done && (
        <div className="cli-input-row">
          <span style={{ color: '#661111', fontSize: '0.8125rem' }}>
            <button className="mode-btn active" onClick={onSwitchCLI}>[mode --cli]</button>
            {' '}|{' '}
            <button className="mode-btn" onClick={onExit}>[exit]</button>
          </span>
        </div>
      )}
    </>
  )
}
