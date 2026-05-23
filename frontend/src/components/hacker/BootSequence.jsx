import { useState, useEffect, useRef } from 'react'

const BOOT_LINES = [
  { text: '██████╗  █████╗  █████╗ ██╗  ██╗ █████╗  █████╗', delay: 0, color: '#ff0000' },
  { text: '██╔══██╗██╔══██╗██╔══██╗██║ ██╔╝██╔══██╗██╔══██╗', delay: 60, color: '#ff0000' },
  { text: '██████╔╝███████║███████║█████╔╝ ███████║███████║', delay: 120, color: '#ff0000' },
  { text: '██╔══██╗██╔══██║██╔══██║██╔═██╗ ██╔══██║██╔══██║', delay: 180, color: '#880000' },
  { text: '██████╔╝██║  ██║██║  ██║██║  ██╗██║  ██║██║  ██║', delay: 240, color: '#880000' },
  { text: '╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝', delay: 300, color: '#441111' },
  { text: '', delay: 380, color: '#000' },
  { text: '         baakaa OS Bootloader v1.0 — Prajwal Chaudhary', delay: 420, color: '#ff2222' },
  { text: '         ─────────────────────────────────────────────', delay: 480, color: '#441111' },
  { text: '', delay: 530, color: '#000' },
  { text: 'POST: Initializing hardware scan...', delay: 560, color: '#aa1111' },
  { text: 'CPU: Cortex-A72 @ 3.6GHz × 8 cores ............... OK', delay: 680, color: '#661111' },
  { text: 'MEM: Checking memory blocks:', delay: 800, color: '#661111' },
  { text: '  [0x00000000 - 0x0003FFFF]  256KB ................ OK', delay: 880, color: '#441111' },
  { text: '  [0x00040000 - 0x0FFFFFFF]  65024KB .............. OK', delay: 960, color: '#441111' },
  { text: 'NET: Interface wlan0 .......................... ACTIVE', delay: 1060, color: '#661111' },
  { text: 'SEC: Firewall rules loaded ..................... OK', delay: 1140, color: '#661111' },
  { text: '', delay: 1200, color: '#000' },
  { text: 'Loading baakaa kernel modules:', delay: 1240, color: '#880000' },
  { text: '  [    0.000] module: portfolio_engine ......... loaded', delay: 1320, color: '#441111' },
  { text: '  [    0.012] module: skill_manifest ........... loaded', delay: 1400, color: '#441111' },
  { text: '  [    0.024] module: project_registry ......... loaded', delay: 1480, color: '#441111' },
  { text: '  [    0.036] module: cyber_toolkit ............ loaded', delay: 1560, color: '#441111' },
  { text: '  [    0.048] module: shell_interface ........... loaded', delay: 1640, color: '#441111' },
  { text: '', delay: 1720, color: '#000' },
  { text: '┌──────────────────────────────────────────────────┐', delay: 1760, color: '#ff0000' },
  { text: '│   IDENTITY VERIFIED: Prajwal Chaudhary          │', delay: 1840, color: '#ff0000' },
  { text: '│   ALIAS: baakaa  |  CLEARANCE: ROOT             │', delay: 1920, color: '#ff0000' },
  { text: '│   LOCATION: Itahari 7, Sunsari, Nepal           │', delay: 2000, color: '#ff0000' },
  { text: '└──────────────────────────────────────────────────┘', delay: 2080, color: '#ff0000' },
  { text: '', delay: 2160, color: '#000' },
  { text: 'Spawning baakaa interactive shell...', delay: 2240, color: '#ff3333' },
]

export default function BootSequence({ onComplete }) {
  const [visibleLines, setVisibleLines] = useState([])
  const [barProgress, setBarProgress] = useState(0)
  const bodyRef = useRef(null)

  useEffect(() => {
    const timers = []
    BOOT_LINES.forEach((line, i) => {
      timers.push(setTimeout(() => {
        setVisibleLines(prev => [...prev, line])
        if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
      }, line.delay))
    })

    const barTimer = setInterval(() => {
      setBarProgress(p => {
        if (p >= 100) { clearInterval(barTimer); return 100 }
        return p + 2.2
      })
    }, 28)

    timers.push(setTimeout(() => onComplete(), 3000))
    return () => { timers.forEach(clearTimeout); clearInterval(barTimer) }
  }, [onComplete])

  const barFilled = Math.min(20, Math.floor(barProgress / 5))
  const barEmpty = 20 - barFilled

  return (
    <div className="boot-screen flicker" style={{ justifyContent: 'flex-start', paddingTop: '2rem' }}>
      <div ref={bodyRef} style={{ flex: 1, overflow: 'auto', marginBottom: '1.5rem' }}>
        {visibleLines.map((line, i) => (
          <div
            key={i}
            style={{
              color: line.color,
              fontSize: i < 6 ? '0.55rem' : '0.8125rem',
              lineHeight: i < 6 ? 1.2 : 1.75,
              fontFamily: "'JetBrains Mono', monospace",
              textShadow: line.color === '#ff0000' || line.color === '#ff2222' ? '0 0 10px rgba(255,0,0,0.5)' : 'none',
              whiteSpace: 'pre',
            }}
          >
            {line.text}
          </div>
        ))}
      </div>

      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8125rem' }}>
        <div style={{ color: '#661111', marginBottom: '0.375rem' }}>
          Loading baakaa OS environment...
        </div>
        <div style={{ color: '#ff2222', textShadow: '0 0 8px rgba(255,0,0,0.4)' }}>
          [{('█'.repeat(barFilled) + '░'.repeat(barEmpty))}] {Math.min(100, Math.floor(barProgress))}%
        </div>
        {barProgress >= 100 && (
          <div style={{ color: '#ff3333', marginTop: '0.5rem', textShadow: '0 0 10px rgba(255,0,0,0.5)' }}>
            ■ baakaa terminal ready. Welcome, root.
          </div>
        )}
      </div>
    </div>
  )
}
