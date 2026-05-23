import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PROFILE } from '../../data/profile'

// ── Packet data pools ───────────────────────────────────────────────────────
const SRC_IPS = ['10.0.0.42', '192.168.1.1', '127.0.0.1', '172.16.0.8', '10.10.2.7', '192.168.0.99']
const DST_IPS = ['baakaa.onion', 'sec-core.local', 'flutter.dev', 'n8n.baakaa.dev', 'git.baakaa.io']

const PACKET_TEMPLATES = [
  {
    proto: 'FLUTTER',
    color: '#06b6d4',
    bgColor: 'rgba(6,182,212,0.06)',
    borderColor: 'rgba(6,182,212,0.3)',
    infos: [
      'BLoC state transition: OrderBloc → OrderLoaded',
      'Provider tree rebuild: CartProvider → UI sync',
      'Dart FFI bridge: native_call → libportfolio.so',
      'Widget rebuild: 3 affected subtrees redrawn',
      'Platform channel: iOS → flutter_method_channel',
      'Hot reload: 247ms — 0 errors, 3 widgets rebuilt',
    ],
    detail: {
      title: 'Khaja Ghar — Flutter/Dart Frontend',
      hex: '46 4c 54 52 00 01 02 03 4b 48 41 4a 41 20 47 48',
      fields: [
        { key: 'Frame Protocol', val: 'FLUTTER/2.0' },
        { key: 'Platform', val: 'Android + iOS + Web' },
        { key: 'State Mgmt', val: 'BLoC + Provider' },
        { key: 'Project', val: 'Khaja Ghar — Multi-Vendor Food Marketplace' },
        { key: 'Status', val: 'In Development' },
        { key: 'Tech', val: 'Flutter, Dart, Python, MySQL' },
        { key: 'Description', val: 'Secure digital marketplace onboarding independent food vendors onto a formalized tech platform with real-time order management and mobile-first UX.' },
      ],
    },
  },
  {
    proto: 'SEC',
    color: '#ff0033',
    bgColor: 'rgba(255,0,51,0.06)',
    borderColor: 'rgba(255,0,51,0.35)',
    infos: [
      'WPA2 handshake captured: BSSID aa:bb:cc:dd:ee:ff',
      'Deauth frame flood detected: 802.11 — 147 frames/s',
      'Port scan: nmap -sV -p- 192.168.1.0/24 [STEALTH]',
      'ARP poison injected: gateway spoofed → MitM active',
      'CVE-2024-1337: SQLi payload submitted [DETECTED]',
      'Metasploit session opened: meterpreter > getuid',
      'Bettercap sniffer: HTTP credentials intercepted',
      'SIEM alert: anomalous login attempt from 45.x.x.x',
    ],
    detail: {
      title: 'Campus Net Plan — Network Security Audit',
      hex: '53 45 43 00 ff 00 33 00 43 41 4d 50 55 53 20 4e',
      fields: [
        { key: 'Frame Protocol', val: 'SEC/2.0 — Offensive Recon' },
        { key: 'Tools', val: 'Aircrack-ng, Bettercap, Wireshark, Metasploit' },
        { key: 'Project', val: 'Campus Net Plan — 1,100+ Node Infrastructure' },
        { key: 'Status', val: 'Completed' },
        { key: 'Findings', val: '27 CVEs identified, 19 remediated' },
        { key: 'Scope', val: 'VLAN segmentation, traffic shaping, wireless audit' },
        { key: 'Description', val: 'Full network security assessment and hardened infrastructure design for a campus environment supporting over 1,100 active nodes.' },
      ],
    },
  },
  {
    proto: 'AI_ML',
    color: '#10b981',
    bgColor: 'rgba(16,185,129,0.06)',
    borderColor: 'rgba(16,185,129,0.3)',
    infos: [
      'n8n webhook trigger: POST /orders → 3 nodes executed',
      'AI inference: GPT-4o response latency 842ms',
      'Automation pipeline: input → transform → output [OK]',
      'n8n cron: daily_report job started [04:00 UTC]',
      'HTTP request node: API call completed in 312ms',
      'Data transform: JSON → normalized schema → DB write',
    ],
    detail: {
      title: 'AI/ML & Automation — n8n Workflows',
      hex: '41 49 4d 4c 00 6e 38 6e 20 77 6f 72 6b 66 6c 6f',
      fields: [
        { key: 'Frame Protocol', val: 'AI_ML/1.2' },
        { key: 'Platform', val: 'n8n Workflow Automation' },
        { key: 'Integrations', val: 'AI tools, REST APIs, webhooks, cron jobs' },
        { key: 'Skill Level', val: '80% — Advanced workflow design' },
        { key: 'Use Cases', val: 'Order automation, data normalization, AI-augmented pipelines' },
        { key: 'Description', val: 'Custom workflow development using n8n with advanced AI integration tools for real-time data processing and automated decision pipelines.' },
      ],
    },
  },
  {
    proto: 'CMS',
    color: '#f59e0b',
    bgColor: 'rgba(245,158,11,0.06)',
    borderColor: 'rgba(245,158,11,0.3)',
    infos: [
      'WordPress: plugin audit — 3 outdated, 1 critical CVE',
      'WP REST API: GET /wp/v2/posts → 200 OK [12ms]',
      'Security hardening: wp-login.php rate-limited [OK]',
      'WooCommerce: checkout session initialized [cart_id:7f]',
      'DB optimize: wp_options autoloaded data pruned [3.2MB]',
      'Firewall rule: xmlrpc.php access blocked [DROP]',
    ],
    detail: {
      title: 'WordPress Architecture & Security',
      hex: '43 4d 53 00 57 50 00 61 72 63 68 69 74 65 63 74',
      fields: [
        { key: 'Frame Protocol', val: 'CMS/WP-5.x' },
        { key: 'Platform', val: 'WordPress Architecture' },
        { key: 'Specialization', val: 'Security hardening, optimization, deployment' },
        { key: 'Skill Level', val: '78% — Advanced configuration' },
        { key: 'Focus Areas', val: 'Custom theme dev, plugin auditing, REST API, WooCommerce' },
        { key: 'Description', val: 'WordPress optimization, customization, and deployment security — including REST API hardening, rate limiting, and performance tuning.' },
      ],
    },
  },
  {
    proto: 'TCP',
    color: '#6366f1',
    bgColor: 'rgba(99,102,241,0.05)',
    borderColor: 'rgba(99,102,241,0.2)',
    infos: [
      'SYN → SYN-ACK → ACK [3-way handshake complete]',
      'TCP window scaling: 65535 → 4194304 bytes',
      'Retransmission: seq=1337 [timeout 200ms]',
      'FIN-ACK: connection teardown initiated',
      'TCP PUSH: payload delivery 1460B MSS',
    ],
    detail: {
      title: 'Terminal Portfolio Core — This System',
      hex: '54 43 50 00 50 4f 52 54 46 4f 4c 49 4f 20 43 4f',
      fields: [
        { key: 'Frame Protocol', val: 'TCP/IPv6' },
        { key: 'Project', val: 'Terminal Portfolio Core — This very system' },
        { key: 'Status', val: 'Live' },
        { key: 'Stack', val: 'React JSX + Python FastAPI + Three.js + OpenPGP.js' },
        { key: 'Features', val: 'Tor boot, draggable terminal, CLI shell, packet capture, 3D globe' },
        { key: 'Description', val: 'A dual-interface custom-engineered web application featuring baakaa OS bootloader, interactive terminal, live packet capture stream, and CVE-style resume download.' },
      ],
    },
  },
]

let _packetIdCounter = 0
function makePacket() {
  const tpl = PACKET_TEMPLATES[Math.floor(Math.random() * PACKET_TEMPLATES.length)]
  const info = tpl.infos[Math.floor(Math.random() * tpl.infos.length)]
  const src = SRC_IPS[Math.floor(Math.random() * SRC_IPS.length)]
  const dst = DST_IPS[Math.floor(Math.random() * DST_IPS.length)]
  const len = 64 + Math.floor(Math.random() * 1400)
  const now = new Date()
  const ts = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}.${String(now.getMilliseconds()).padStart(3,'0')}`
  return { id: ++_packetIdCounter, ts, src, dst, proto: tpl.proto, len, info, tpl }
}

// ── Hex dump renderer ───────────────────────────────────────────────────────
function HexDump({ packet, onClose }) {
  const tpl = packet.tpl
  const hexRows = [tpl.detail.hex, ...Array.from({ length: 5 }, (_, i) => {
    const bytes = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2,'0'))
    return bytes.join(' ')
  })]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: '#050010', border: '1.5px solid ' + tpl.borderColor,
        borderRadius: '12px 12px 0 0', zIndex: 20,
        maxHeight: '70%', overflow: 'auto',
        boxShadow: `0 -8px 40px ${tpl.bgColor}`,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem', borderBottom: '1px solid ' + tpl.borderColor, position: 'sticky', top: 0, background: '#050010' }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.75rem', color: tpl.color, fontWeight: 700, marginBottom: '0.125rem' }}>
            ▶ PACKET #{packet.id} — {tpl.detail.title}
          </div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', color: '#4b5563' }}>
            {packet.ts} · {packet.src} → {packet.dst} · {packet.len} bytes
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: '1rem', padding: '0.25rem 0.5rem' }}>✕</button>
      </div>

      <div style={{ padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Parsed fields */}
        <div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', color: '#4b5563', marginBottom: '0.75rem', letterSpacing: '0.08em' }}>FRAME DISSECTION</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {tpl.detail.fields.map(f => (
              <div key={f.key} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ color: '#4b5563', minWidth: 120, flexShrink: 0 }}>{f.key}:</span>
                <span style={{ color: f.key === 'Description' ? '#9ca3af' : tpl.color }}>{f.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hex dump */}
        <div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', color: '#4b5563', marginBottom: '0.75rem', letterSpacing: '0.08em' }}>HEX DUMP</div>
          <div style={{ background: '#0a0010', border: '1px solid #1f1050', borderRadius: 8, padding: '0.75rem', overflow: 'auto' }}>
            {hexRows.map((row, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', marginBottom: '0.2rem' }}>
                <span style={{ color: '#374151', minWidth: 32 }}>{String(i * 16).padStart(4, '0')}</span>
                <span style={{ color: tpl.color, opacity: 0.7 }}>{row}</span>
                <span style={{ color: '#4b5563' }}>
                  {row.split(' ').map(b => {
                    const n = parseInt(b, 16)
                    return n >= 32 && n < 127 ? String.fromCharCode(n) : '.'
                  }).join('')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main PacketCapture component ─────────────────────────────────────────────
export default function PacketCapture() {
  const [packets, setPackets] = useState(() => Array.from({ length: 18 }, makePacket))
  const [paused, setPaused] = useState(false)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('ALL')
  const bodyRef = useRef(null)
  const autoScrollRef = useRef(true)

  // Stream new packets
  useEffect(() => {
    if (paused) return
    const interval = setInterval(() => {
      setPackets(p => {
        const next = [...p, makePacket()]
        return next.length > 120 ? next.slice(-120) : next
      })
    }, 700 + Math.random() * 500)
    return () => clearInterval(interval)
  }, [paused])

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScrollRef.current && bodyRef.current && !paused) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [packets, paused])

  const handleScroll = () => {
    if (!bodyRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = bodyRef.current
    autoScrollRef.current = scrollHeight - scrollTop - clientHeight < 40
  }

  const handleRowClick = useCallback((pkt) => {
    setPaused(true)
    setSelected(pkt)
  }, [])

  const handleClose = useCallback(() => {
    setSelected(null)
    setPaused(false)
  }, [])

  const protos = ['ALL', ...PACKET_TEMPLATES.map(t => t.proto)]
  const visible = filter === 'ALL' ? packets : packets.filter(p => p.proto === filter)

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: '#030010', fontFamily: "'JetBrains Mono',monospace",
      position: 'relative',
    }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 1rem', borderBottom: '1px solid #1f1050', background: '#050015', flexShrink: 0, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.7rem', color: '#7c3aed', fontWeight: 700, letterSpacing: '0.08em' }}>
          LIVE CAPTURE
        </span>
        <motion.div
          animate={paused ? {} : { opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          style={{ width: 8, height: 8, borderRadius: '50%', background: paused ? '#374151' : '#ff0033', flexShrink: 0 }}
        />
        <span style={{ fontSize: '0.6rem', color: '#4b5563' }}>{paused ? 'PAUSED' : `${packets.length} packets captured`}</span>
        <button
          onClick={() => { setPaused(p => !p); setSelected(null) }}
          style={{ marginLeft: 'auto', background: paused ? 'rgba(255,0,51,0.1)' : 'rgba(55,65,81,0.5)', border: `1px solid ${paused ? '#ff003355' : '#374151'}`, borderRadius: 6, padding: '0.25rem 0.75rem', color: paused ? '#ff6666' : '#6b7280', fontSize: '0.65rem', cursor: 'pointer', fontFamily: 'inherit' }}>
          {paused ? '▶ RESUME' : '⏸ PAUSE'}
        </button>

        {/* Protocol filters */}
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          {protos.map(p => {
            const tpl = PACKET_TEMPLATES.find(t => t.proto === p)
            const color = tpl?.color || '#6b7280'
            return (
              <button
                key={p}
                onClick={() => setFilter(p)}
                style={{
                  background: filter === p ? `${color}22` : 'transparent',
                  border: `1px solid ${filter === p ? color : '#1f1f1f'}`,
                  borderRadius: 4, padding: '0.2rem 0.5rem',
                  color: filter === p ? color : '#4b5563',
                  fontSize: '0.6rem', cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 150ms',
                }}
              >{p}</button>
            )
          })}
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '70px 110px 110px 80px 50px 1fr', gap: '0 0.5rem', padding: '0.3rem 1rem', borderBottom: '1px solid #0f0025', background: '#04000f', fontSize: '0.6rem', color: '#374151', flexShrink: 0 }}>
        <span>No.</span>
        <span>Source</span>
        <span>Destination</span>
        <span>Protocol</span>
        <span>Len</span>
        <span>Info</span>
      </div>

      {/* Packet rows */}
      <div ref={bodyRef} onScroll={handleScroll} style={{ flex: 1, overflow: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#1f1050 transparent' }}>
        {visible.map((pkt, i) => {
          const tpl = pkt.tpl
          const isSelected = selected?.id === pkt.id
          return (
            <motion.div
              key={pkt.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => handleRowClick(pkt)}
              style={{
                display: 'grid', gridTemplateColumns: '70px 110px 110px 80px 50px 1fr',
                gap: '0 0.5rem', padding: '0.3rem 1rem',
                background: isSelected ? `${tpl.bgColor}` : i % 2 === 0 ? 'transparent' : '#04000d',
                borderLeft: isSelected ? `3px solid ${tpl.color}` : '3px solid transparent',
                cursor: 'pointer', transition: 'background 100ms', fontSize: '0.65rem',
                borderBottom: '1px solid #050015',
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#08001a' }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : '#04000d' }}
            >
              <span style={{ color: '#374151' }}>{pkt.id}</span>
              <span style={{ color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pkt.src}</span>
              <span style={{ color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pkt.dst}</span>
              <span style={{
                color: tpl.color, fontWeight: 700,
                background: tpl.bgColor, borderRadius: 3,
                padding: '0.05rem 0.35rem', textAlign: 'center', fontSize: '0.6rem',
              }}>{pkt.proto}</span>
              <span style={{ color: '#4b5563' }}>{pkt.len}</span>
              <span style={{ color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pkt.info}</span>
            </motion.div>
          )
        })}
      </div>

      {/* Hex dump panel */}
      <AnimatePresence>
        {selected && <HexDump key={selected.id} packet={selected} onClose={handleClose} />}
      </AnimatePresence>
    </div>
  )
}
