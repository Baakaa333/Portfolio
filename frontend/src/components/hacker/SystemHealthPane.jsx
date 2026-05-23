import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

// ── Tor init log lines ──────────────────────────────────────────────────────
const TOR_INIT = [
  { t: 100,  c: '#4b1082', s: '[....] Bootstrapping Tor daemon...' },
  { t: 300,  c: '#6b21a8', s: '[OK  ] Loaded configuration /etc/tor/torrc' },
  { t: 550,  c: '#7c3aed', s: '[OK  ] Socks listener opened on 127.0.0.1:9050' },
  { t: 800,  c: '#7c3aed', s: '[....] Establishing circuit via guard relay...' },
  { t: 1100, c: '#7c3aed', s: '[OK  ] Guard: NL/Amsterdam — 185.220.101.47 [42ms]' },
  { t: 1400, c: '#7c3aed', s: '[OK  ] Middle: DE/Frankfurt — 45.141.215.111 [78ms]' },
  { t: 1700, c: '#7c3aed', s: '[OK  ] Exit: RO/Bucharest — 193.11.114.32 [131ms]' },
  { t: 2000, c: '#9333ea', s: '[OK  ] 3-hop circuit established. Latency: 251ms' },
  { t: 2300, c: '#a855f7', s: '[OK  ] Hidden service descriptor published.' },
  { t: 2600, c: '#ff0033', s: '╔══════════════════════════════════════════╗' },
  { t: 2700, c: '#ff0033', s: '║  HIDDEN SERVICE INITIALIZED              ║' },
  { t: 2800, c: '#ff6666', s: '║  baakaa777xr3p4qzm9y2kwd81c3.onion      ║' },
  { t: 2900, c: '#ff0033', s: '╚══════════════════════════════════════════╝' },
  { t: 3100, c: '#10b981', s: '[OK  ] Anonymity layer: ACTIVE' },
  { t: 3300, c: '#10b981', s: '[OK  ] System ready. Starting health monitor...' },
]

// ── Deterministic pseudo-random helper ─────────────────────────────────────
let _seed = 42
const seededRand = (min, max) => {
  _seed = (_seed * 1664525 + 1013904223) & 0xffffffff
  return min + (Math.abs(_seed) % (max - min))
}

// ── Firewall rules ──────────────────────────────────────────────────────────
const FW_RULES = [
  'ACCEPT tcp dpt:443 src:tor-circuit',
  'DROP   all  src:0.0.0.0/0 dpt:22 [brute-force]',
  'ACCEPT tcp dpt:8000 src:localhost',
  'DROP   udp dpt:53 src:!8.8.8.8',
  'ACCEPT tcp dpt:5173 src:localhost',
  'DROP   all  src:45.33.32.156 [blacklist]',
  'ACCEPT icmp type:echo-request src:192.168.1.0/24',
]

export default function SystemHealthPane() {
  const [torLines, setTorLines] = useState([])
  const [torDone, setTorDone] = useState(false)
  const [tick, setTick] = useState(0)
  const [metrics, setMetrics] = useState({ cpu: 12, mem: 34, net: 8, fw: 847 })
  const [fwIdx, setFwIdx] = useState(0)
  const logRef = useRef(null)

  // Tor init sequence
  useEffect(() => {
    const timers = TOR_INIT.map(l =>
      setTimeout(() => {
        setTorLines(p => [...p, l])
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
      }, l.t)
    )
    setTimeout(() => setTorDone(true), 3600)
    return () => timers.forEach(clearTimeout)
  }, [])

  // Live metrics tick
  useEffect(() => {
    if (!torDone) return
    const id = setInterval(() => {
      setTick(t => t + 1)
      setMetrics({
        cpu: 8 + seededRand(0, 55),
        mem: 28 + seededRand(0, 40),
        net: seededRand(1, 24),
        fw: 840 + seededRand(0, 30),
      })
      setFwIdx(i => (i + 1) % FW_RULES.length)
    }, 1400)
    return () => clearInterval(id)
  }, [torDone])

  const bar = (pct, width = 14) => {
    const n = Math.round(pct / 100 * width)
    return `[${'█'.repeat(n)}${'░'.repeat(width - n)}] ${String(pct).padStart(3)}%`
  }

  const barColor = (pct) => pct > 75 ? '#ff0000' : pct > 45 ? '#ffcc00' : '#00ff41'

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6875rem', overflow: 'hidden', padding: '0.25rem 0.5rem' }}>

      {/* Tor init log */}
      <div ref={logRef} style={{ flex: torDone ? '0 0 auto' : 1, overflow: 'hidden', marginBottom: '0.25rem', maxHeight: torDone ? 90 : 'none' }}>
        {torLines.map((l, i) => (
          <div key={i} style={{ color: l.c, lineHeight: 1.65, whiteSpace: 'pre' }}>{l.s}</div>
        ))}
        {!torDone && <motion.span animate={{ opacity: [1,0,1] }} transition={{ duration: 0.8, repeat: Infinity }} style={{ color: '#7c3aed' }}>█</motion.span>}
      </div>

      {torDone && (
        <>
          {/* Section divider */}
          <div style={{ color: '#330000', marginBottom: '0.375rem' }}>{'─'.repeat(38)}</div>

          {/* System health header */}
          <div style={{ color: '#661111', fontSize: '0.625rem', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            [SYS-HEALTH] LIVE METRICS — PID {1337 + tick % 99}
          </div>

          {/* CPU */}
          <div style={{ marginBottom: '0.375rem' }}>
            <div style={{ color: '#441111' }}>CPU  cores:8  freq:3.6GHz</div>
            <div style={{ color: barColor(metrics.cpu) }}>{bar(metrics.cpu)}</div>
          </div>

          {/* MEM */}
          <div style={{ marginBottom: '0.375rem' }}>
            <div style={{ color: '#441111' }}>MEM  total:16GB  swap:4GB</div>
            <div style={{ color: barColor(metrics.mem) }}>{bar(metrics.mem)}</div>
          </div>

          {/* NET */}
          <div style={{ marginBottom: '0.375rem' }}>
            <div style={{ color: '#441111' }}>NET  eth0  tor-circuit:UP</div>
            <div style={{ color: '#00ccff' }}>{bar(metrics.net, 14)} {metrics.net}MB/s</div>
          </div>

          {/* Firewall */}
          <div style={{ color: '#330000', margin: '0.375rem 0' }}>{'─'.repeat(38)}</div>
          <div style={{ color: '#661111', fontSize: '0.625rem', letterSpacing: '0.1em', marginBottom: '0.375rem' }}>
            [FW] iptables — {metrics.fw} rules active
          </div>
          <div style={{ color: '#441111', fontSize: '0.625rem', lineHeight: 1.75 }}>
            {FW_RULES.slice(fwIdx, fwIdx + 4).concat(
              FW_RULES.slice(0, Math.max(0, (fwIdx + 4) - FW_RULES.length))
            ).map((r, i) => (
              <div key={i} style={{ color: r.startsWith('DROP') ? '#ff3333' : r.startsWith('ACCEPT') ? '#10b981' : '#441111' }}>
                {r}
              </div>
            ))}
          </div>

          {/* Tor circuit status */}
          <div style={{ color: '#330000', margin: '0.375rem 0' }}>{'─'.repeat(38)}</div>
          <div style={{ fontSize: '0.6rem', lineHeight: 1.65 }}>
            <div style={{ color: '#4b1082' }}>🧅 baakaa777...onion</div>
            <div style={{ color: '#10b981' }}>CIRCUIT: NL→DE→RO [UP]</div>
            <div style={{ color: '#441111' }}>ANON: ACTIVE | TLS: 1.3</div>
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ color: '#ff0033' }}
            >
              ● MONITORING ACTIVE
            </motion.div>
          </div>
        </>
      )}
    </div>
  )
}
