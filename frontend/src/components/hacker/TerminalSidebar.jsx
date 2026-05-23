import { useState, useEffect, useRef } from 'react'

// Deterministic pseudo-random for stable metrics
let _seed = 77
const sr = (min, max) => {
  _seed = (_seed * 1664525 + 1013904223) & 0xffffffff
  return min + (Math.abs(_seed) % (max - min))
}

const bar = (pct, w = 10) => {
  const n = Math.round(pct / 100 * w)
  return `${'█'.repeat(n)}${'░'.repeat(w - n)}`
}
const barColor = pct => pct > 75 ? '#ff4444' : pct > 45 ? '#f59e0b' : '#00ff41'

const FW_RULES = [
  { text: 'ACCEPT tcp dpt:443 src:tor-circuit', c: '#00ff41' },
  { text: 'DROP   all src:0.0.0.0/0 dpt:22',   c: '#ff4444' },
  { text: 'ACCEPT tcp dpt:8000 src:localhost',  c: '#00ff41' },
  { text: 'DROP   udp dpt:53 src:!8.8.8.8',    c: '#ff4444' },
  { text: 'ACCEPT tcp dpt:5173 src:localhost',  c: '#00ff41' },
  { text: 'DROP   all src:45.33.32.156',        c: '#ff4444' },
  { text: 'ACCEPT icmp type:echo src:LAN',      c: '#00ff41' },
]

const CONNS = ['baakaa777...onion', 'sec-core.local', 'github.com', 'api.baakaa.dev', 'n8n.baakaa.dev']

export default function TerminalSidebar({ style }) {
  const [metrics, setMetrics] = useState({ cpu: 14, mem: 32, net: 7, fw: 847, conns: 3, uptime: 0 })
  const [fwIdx, setFwIdx] = useState(0)
  const [tick, setTick] = useState(0)
  const startRef = useRef(Date.now())

  useEffect(() => {
    const id = setInterval(() => {
      setTick(t => t + 1)
      setFwIdx(i => (i + 1) % FW_RULES.length)
      setMetrics({
        cpu:    8  + sr(0, 60),
        mem:    28 + sr(0, 45),
        net:    sr(1, 32),
        fw:     840 + sr(0, 30),
        conns:  sr(1, 8),
        uptime: Math.floor((Date.now() - startRef.current) / 1000),
      })
    }, 1400)
    return () => clearInterval(id)
  }, [])

  const fmt = s => {
    const h = String(Math.floor(s / 3600)).padStart(2,'0')
    const m = String(Math.floor((s % 3600) / 60)).padStart(2,'0')
    const sec = String(s % 60).padStart(2,'0')
    return `${h}:${m}:${sec}`
  }

  const Row = ({ label, pct, extra }) => (
    <div style={{ marginBottom: '0.625rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', color:'#2a4040', fontSize:'0.55rem', marginBottom:'0.15rem' }}>
        <span>{label}</span><span style={{ color: barColor(pct) }}>{pct}%</span>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
        <span style={{ color: barColor(pct), fontFamily:"'JetBrains Mono',monospace", fontSize:'0.55rem', letterSpacing:'-0.03em' }}>
          {bar(pct)}
        </span>
      </div>
      {extra && <div style={{ color:'#1e3030', fontSize:'0.5rem', marginTop:'0.1rem' }}>{extra}</div>}
    </div>
  )

  const Divider = () => (
    <div style={{ color:'#0e2020', margin:'0.5rem 0', fontSize:'0.55rem' }}>{'─'.repeat(30)}</div>
  )

  const Section = ({ title, children }) => (
    <>
      <div style={{ color:'#1a5540', fontSize:'0.55rem', letterSpacing:'0.08em', marginBottom:'0.375rem', fontWeight:700 }}>
        ▸ {title}
      </div>
      {children}
      <Divider />
    </>
  )

  const visibleFw = FW_RULES.slice(fwIdx, fwIdx + 4).concat(
    FW_RULES.slice(0, Math.max(0, (fwIdx + 4) - FW_RULES.length))
  )

  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      padding: '0.5rem 0.625rem',
      fontFamily: "'JetBrains Mono', monospace",
      scrollbarWidth: 'thin',
      scrollbarColor: '#0a2020 transparent',
      ...style,
    }}>
      {/* Session header */}
      <div style={{ marginBottom:'0.5rem' }}>
        <div style={{ color:'#00ffe0', fontSize:'0.6rem', fontWeight:700, textShadow:'0 0 8px #00ffe088', marginBottom:'0.2rem' }}>
          LIVE METRICS
        </div>
        <div style={{ color:'#1a4040', fontSize:'0.5rem' }}>PID:{1337 + tick % 99} | TTY:pts/0</div>
      </div>
      <Divider />

      {/* Resource bars */}
      <Section title="RESOURCES">
        <Row label="CPU  cores:8  3.6GHz" pct={metrics.cpu} extra={`${metrics.cpu > 60 ? '⚠ HIGH LOAD' : 'nominal'}`} />
        <Row label="MEM  total:16GB swap:4G" pct={metrics.mem} extra={`${(metrics.mem / 100 * 16).toFixed(1)}GB used`} />
        <Row label="NET  eth0  tor:UP" pct={metrics.net} extra={`${metrics.net}MB/s`} />
      </Section>

      {/* Connections */}
      <Section title="ACTIVE CONNECTIONS">
        <div style={{ color:'#22d3ee', fontSize:'0.55rem', marginBottom:'0.25rem' }}>
          {metrics.conns} active
        </div>
        {CONNS.slice(0, metrics.conns).map((c, i) => (
          <div key={i} style={{ color:'#1a5040', fontSize:'0.5rem', lineHeight:1.6 }}>
            ◉ {c}
          </div>
        ))}
      </Section>

      {/* Tor circuit */}
      <Section title="TOR CIRCUIT">
        <div style={{ fontSize:'0.55rem', lineHeight:1.7 }}>
          <div style={{ color:'#7c3aed' }}>🧅 baakaa777...onion</div>
          <div style={{ color:'#00ff41' }}>NL → DE → RO [UP]</div>
          <div style={{ color:'#1a4040' }}>LATENCY: 251ms</div>
          <div style={{ color:'#1a4040' }}>ANON: ACTIVE | TLS 1.3</div>
          <div style={{ color:'#f59e0b', animation:'blink 2s step-end infinite' }}>
            ● MONITORING
          </div>
        </div>
      </Section>

      {/* Firewall */}
      <Section title={`FIREWALL — ${metrics.fw} rules`}>
        {visibleFw.map((r, i) => (
          <div key={i} style={{ color: r.c, fontSize:'0.5rem', lineHeight:1.65, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {r.text}
          </div>
        ))}
      </Section>

      {/* Uptime */}
      <div>
        <div style={{ color:'#1a5540', fontSize:'0.55rem', fontWeight:700, marginBottom:'0.2rem' }}>▸ SESSION</div>
        <div style={{ color:'#00ffe0', fontSize:'0.6rem', textShadow:'0 0 6px #00ffe055' }}>
          {fmt(metrics.uptime)}
        </div>
        <div style={{ color:'#1a4040', fontSize:'0.5rem', marginTop:'0.2rem' }}>ghost@node-7</div>
        <div style={{ color:'#1a4040', fontSize:'0.5rem' }}>CONN: ENCRYPTED</div>
      </div>
    </div>
  )
}
