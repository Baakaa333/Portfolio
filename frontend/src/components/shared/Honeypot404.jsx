import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

// Honeypot 404 — shown to fuzzers/crawlers hitting sensitive paths
export default function Honeypot404() {
  const location = useLocation()
  const [tick, setTick] = useState(true)

  useEffect(() => {
    document.body.className = 'hacker-mode'
    const id = setInterval(() => setTick(t => !t), 500)
    return () => {
      clearInterval(id)
      document.body.className = 'clean-mode'
    }
  }, [])

  const ua = navigator.userAgent
  const ts = new Date().toISOString()
  const path = location.pathname

  const lines = [
    '╔══════════════════════════════════════════════════════╗',
    '║         ⚠  UNAUTHORIZED ACCESS DETECTED  ⚠          ║',
    '╚══════════════════════════════════════════════════════╝',
    '',
    'SYSTEM: MAINFRAME SECURITY LAYER 3 — ACCESS DENIED',
    '────────────────────────────────────────────────────────',
    `TIMESTAMP    : ${ts}`,
    `TARGET PATH  : ${path}`,
    `USER AGENT   : ${ua.substring(0, 60)}...`,
    `REFERRER     : ${document.referrer || 'NONE'}`,
    '',
    'STATUS       : INTRUSION ATTEMPT LOGGED',
    'ACTION       : CREDENTIALS FLAGGED',
    'REPORT FILED : YES — SEC-INC-2026-CRITICAL',
    '',
    '────────────────────────────────────────────────────────',
    'This system is protected under international cybersecurity',
    'statutes. All access attempts are logged and reported.',
    '',
    'If you believe this is an error, you are wrong.',
    '',
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#080808',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'JetBrains Mono', monospace", padding: '2rem',
    }}>
      <div style={{ maxWidth: 640, width: '100%' }}>
        {lines.map((line, i) => (
          <div key={i} style={{
            color: line.startsWith('╔') || line.startsWith('╚') || line.startsWith('║')
              ? '#ff0000'
              : line.startsWith('────')
              ? '#440000'
              : line.startsWith('STATUS') || line.startsWith('ACTION') || line.startsWith('REPORT')
              ? '#ff3333'
              : '#aa1111',
            textShadow: i < 3 ? '0 0 12px rgba(255,0,0,0.6)' : 'none',
            fontSize: '0.75rem',
            lineHeight: 1.8,
            whiteSpace: 'pre',
          }}>
            {line}
          </div>
        ))}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          color: '#ff2222', fontSize: '0.75rem',
        }}>
          <span>root@sec-layer-3:~#</span>
          <span style={{ visibility: tick ? 'visible' : 'hidden' }}>█</span>
        </div>
      </div>
    </div>
  )
}
