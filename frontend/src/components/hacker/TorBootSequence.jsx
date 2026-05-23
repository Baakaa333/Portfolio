import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Tor relay nodes ────────────────────────────────────────────────────────
const RELAYS = [
  { id: 1, country: 'NL', city: 'Amsterdam',  ip: '185.220.101.47', type: 'Guard',  latency: 42  },
  { id: 2, country: 'DE', city: 'Frankfurt',  ip: '45.141.215.111', type: 'Middle', latency: 78  },
  { id: 3, country: 'RO', city: 'Bucharest',  ip: '193.11.114.32',  type: 'Exit',   latency: 131 },
]

const TOR_LOG_LINES = [
  { delay: 200,  text: '[notice] Tor 0.4.8.12 running on Linux.', color: '#6b7280' },
  { delay: 600,  text: '[notice] Read configuration file "/etc/tor/torrc".', color: '#6b7280' },
  { delay: 1000, text: '[notice] Opening Socks listener on 127.0.0.1:9050.', color: '#6b7280' },
  { delay: 1400, text: '[notice] Bootstrapped 5% (conn): Connecting to a relay.', color: '#7c3aed' },
  { delay: 1900, text: '[notice] Bootstrapped 14% (handshake): Handshaking with a relay.', color: '#7c3aed' },
  { delay: 2400, text: '[notice] Bootstrapped 25% (done_handshake): Handshake done.', color: '#7c3aed' },
  { delay: 2900, text: '[notice] Bootstrapped 45% (requesting_descriptors): Asking for consensus.', color: '#7c3aed' },
  { delay: 3400, text: '[notice] Bootstrapped 61% (loading_descriptors): Loading relay descriptors.', color: '#7c3aed' },
  { delay: 3900, text: '[notice] Bootstrapped 72% (enough_dirinfo): Loaded enough directory info.', color: '#7c3aed' },
  { delay: 4400, text: '[notice] Bootstrapped 80% (ap_conn): Connecting to a relay to build circuits.', color: '#9333ea' },
  { delay: 4900, text: '[notice] Bootstrapped 90% (circuit_create): Establishing a Tor circuit.', color: '#9333ea' },
  { delay: 5400, text: '[notice] Bootstrapped 100% (done): Done.', color: '#10b981' },
  { delay: 5800, text: '[notice] Now listening on Socks port 9050.', color: '#10b981' },
  { delay: 6100, text: `[notice] Circuit established. Route: ${RELAYS.map(r => r.city).join(' → ')}`, color: '#10b981' },
]

const ONION_URL = 'baakaa777xr3p4qzm9y2kwd81c3.onion'

// ── Phase 1: Tor Connection Loading ────────────────────────────────────────
function TorConnecting({ onDone }) {
  const [progress, setProgress] = useState(0)
  const [lines, setLines] = useState([])
  const logRef = useRef(null)

  useEffect(() => {
    const timers = []
    TOR_LOG_LINES.forEach(l => {
      timers.push(setTimeout(() => {
        setLines(prev => [...prev, l])
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
      }, l.delay))
    })

    const progTimer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(progTimer); return 100 }
        return Math.min(p + 0.7, 100)
      })
    }, 45)

    timers.push(setTimeout(onDone, 7000))
    return () => { timers.forEach(clearTimeout); clearInterval(progTimer) }
  }, [onDone])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#050010',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'JetBrains Mono', monospace",
      zIndex: 1000,
    }}>
      {/* Tor onion logo */}
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        style={{ marginBottom: '2rem', fontSize: '4rem', filter: 'drop-shadow(0 0 20px rgba(124,58,237,0.8))' }}
      >
        🧅
      </motion.div>

      <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#a78bfa', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
        Connecting to the Tor Network...
      </div>
      <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '2rem' }}>
        Establishing anonymous circuit through 3 relay nodes
      </div>

      {/* Progress bar */}
      <div style={{ width: 380, height: 8, background: '#1a0030', borderRadius: 99, overflow: 'hidden', marginBottom: '1rem', border: '1px solid rgba(124,58,237,0.3)' }}>
        <motion.div style={{
          height: '100%', borderRadius: 99,
          background: 'linear-gradient(90deg, #7c3aed, #a855f7, #9333ea)',
          boxShadow: '0 0 12px rgba(168,85,247,0.6)',
          width: `${progress}%`,
          transition: 'width 50ms linear',
        }} />
      </div>

      <div style={{ fontSize: '0.75rem', color: '#7c3aed', marginBottom: '2rem' }}>
        {Math.floor(progress)}% — {progress < 100 ? 'Building circuit...' : 'Circuit established.'}
      </div>

      {/* Relay hops */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.7rem', color: '#4b5563', fontStyle: 'italic' }}>YOU</div>
        {RELAYS.map((relay, i) => (
          <React.Fragment key={relay.id}>
            <motion.div
              style={{ color: progress > 30 + i * 25 ? '#7c3aed' : '#1f1f1f', fontSize: '0.9rem' }}
              animate={progress > 30 + i * 25 ? { opacity: [1, 0.4, 1] } : { opacity: 0.2 }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >▶</motion.div>
            <motion.div
              style={{
                background: progress > 30 + i * 25 ? 'rgba(124,58,237,0.15)' : '#0a0010',
                border: `1px solid ${progress > 30 + i * 25 ? '#7c3aed' : '#1f1f1f'}`,
                borderRadius: 8, padding: '0.375rem 0.625rem', textAlign: 'center', minWidth: 80,
                transition: 'all 0.5s ease',
              }}
            >
              <div style={{ fontSize: '0.65rem', color: progress > 30 + i * 25 ? '#a78bfa' : '#374151', fontWeight: 700 }}>
                [{relay.type}]
              </div>
              <div style={{ fontSize: '0.6rem', color: '#6b7280' }}>{relay.city}</div>
              <div style={{ fontSize: '0.55rem', color: '#374151' }}>{relay.latency}ms</div>
            </motion.div>
          </React.Fragment>
        ))}
        <motion.div
          style={{ color: progress >= 100 ? '#10b981' : '#1f1f1f', fontSize: '0.9rem' }}
          animate={progress >= 100 ? { opacity: [1, 0.4, 1] } : { opacity: 0.2 }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >▶</motion.div>
        <div style={{ fontSize: '0.7rem', color: progress >= 100 ? '#10b981' : '#4b5563', fontStyle: 'italic' }}>DEST</div>
      </div>

      {/* Log window */}
      <div ref={logRef} style={{
        width: 520, height: 140, overflow: 'auto', background: '#0a0010',
        border: '1px solid #1f1050', borderRadius: 8, padding: '0.75rem 1rem',
        scrollbarWidth: 'none',
      }}>
        {lines.map((l, i) => (
          <div key={i} style={{ fontSize: '0.65rem', color: l.color, lineHeight: 1.8 }}>{l.text}</div>
        ))}
        {progress < 100 && <span style={{ color: '#7c3aed', animation: 'none' }}>█</span>}
      </div>
    </div>
  )
}

// ── Phase 2: .onion Hidden Service Warning Page ─────────────────────────────
function OnionLanding({ onProceed }) {
  const [confirmed, setConfirmed] = useState(false)

  const handleProceed = () => {
    setConfirmed(true)
    setTimeout(onProceed, 600)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0,
        background: '#050010',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        zIndex: 1000, overflow: 'auto',
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {/* Fake Tor Browser Address Bar */}
      <div style={{
        width: '100%', background: '#0d0020',
        borderBottom: '1px solid #1f1050',
        padding: '0.75rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, background: '#1a0030', border: '1px solid #7c3aed44', borderRadius: 8, padding: '0.375rem 0.875rem' }}>
          <span style={{ fontSize: '0.75rem' }}>🧅</span>
          <span style={{ fontSize: '0.7rem', color: '#a78bfa' }}>http://</span>
          <span style={{ fontSize: '0.7rem', color: '#e879f9', fontWeight: 700 }}>{ONION_URL}</span>
        </div>
        <span style={{ fontSize: '0.6875rem', color: '#7c3aed', border: '1px solid #7c3aed44', padding: '0.2rem 0.5rem', borderRadius: 4 }}>
          🔒 Tor
        </span>
      </div>

      {/* Warning body */}
      <div style={{ maxWidth: 640, width: '100%', padding: '3rem 1.5rem', margin: '0 auto' }}>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* Onion warning icon */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', filter: 'drop-shadow(0 0 20px rgba(124,58,237,0.5))' }}>🧅</div>
            <div style={{ width: 80, height: 3, background: 'linear-gradient(90deg, #7c3aed, #ff0033)', margin: '0 auto', borderRadius: 99 }} />
          </div>

          {/* Warning block */}
          <div style={{ background: '#0a0018', border: '1.5px solid #7c3aed55', borderRadius: 12, padding: '2rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '1.5rem' }}>⚠️</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#a78bfa', letterSpacing: '0.02em' }}>
                  HIDDEN SERVICE ACCESS
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.125rem' }}>
                  You are about to access an .onion address
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.8125rem', color: '#9ca3af', lineHeight: 1.8, marginBottom: '1.25rem' }}>
              The hidden service at <span style={{ color: '#e879f9', fontWeight: 700 }}>{ONION_URL}</span> is reachable
              only over the Tor network. Your connection is anonymized through a 3-hop circuit.
            </div>

            <div style={{ background: '#050010', borderRadius: 8, padding: '1rem 1.25rem', marginBottom: '1.25rem', border: '1px solid #1f1050' }}>
              <div style={{ fontSize: '0.7rem', color: '#7c3aed', fontWeight: 700, marginBottom: '0.625rem', letterSpacing: '0.08em' }}>
                CIRCUIT MANIFEST:
              </div>
              {RELAYS.map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#7c3aed' }}>[{r.type}]</span>
                  <span>{r.city}, {r.country}</span>
                  <span style={{ fontFamily: 'monospace' }}>{r.ip}</span>
                  <span style={{ color: '#10b981' }}>{r.latency}ms</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(255,0,51,0.06)', border: '1px solid rgba(255,0,51,0.2)', borderRadius: 8, padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#f87171', lineHeight: 1.7 }}>
              <strong style={{ color: '#ff0033' }}>⚡ CLASSIFIED SYSTEM DETECTED.</strong> This interface belongs to
              operator <code style={{ color: '#ff6666' }}>baakaa</code>. Identity verification required.
              Unauthorized access is logged and traced.
            </div>
          </div>

          {/* Identity badge */}
          <div style={{ background: '#050010', border: '1px solid #1f1050', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#4b5563', marginBottom: '0.75rem', letterSpacing: '0.08em' }}>HOST IDENTITY</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.75rem' }}>
              <div><span style={{ color: '#6b7280', width: 80, display: 'inline-block' }}>Operator:</span> <span style={{ color: '#a78bfa' }}>Prajwal Chaudhary (baakaa)</span></div>
              <div><span style={{ color: '#6b7280', width: 80, display: 'inline-block' }}>Role:</span> <span style={{ color: '#e879f9' }}>Flutter Developer & Ethical Hacker</span></div>
              <div><span style={{ color: '#6b7280', width: 80, display: 'inline-block' }}>Location:</span> <span style={{ color: '#9ca3af' }}>Itahari 7, Sunsari, Nepal</span></div>
              <div><span style={{ color: '#6b7280', width: 80, display: 'inline-block' }}>Contact:</span> <span style={{ color: '#9ca3af' }}>prajwalch75@gmail.com</span></div>
              <div><span style={{ color: '#6b7280', width: 80, display: 'inline-block' }}>Service:</span> <span style={{ color: '#10b981', fontFamily: 'monospace' }}>{ONION_URL}</span></div>
            </div>
          </div>

          {/* Proceed buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 0 24px rgba(255,0,51,0.4)' }}
              whileTap={{ scale: 0.97 }}
              onClick={handleProceed}
              disabled={confirmed}
              style={{
                background: confirmed ? '#1a0010' : 'linear-gradient(135deg, #ff0033, #cc0022)',
                color: '#fff', border: 'none', borderRadius: 10, padding: '0.875rem 2.5rem',
                fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '0.875rem',
                cursor: confirmed ? 'not-allowed' : 'pointer', letterSpacing: '0.06em',
                boxShadow: '0 0 0px rgba(255,0,51,0)',
                transition: 'all 0.2s ease',
              }}
            >
              {confirmed ? 'INITIALIZING...' : '⚡ PROCEED TO HIDDEN SERVICE'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.reload()}
              style={{
                background: 'transparent', color: '#6b7280',
                border: '1px solid #374151', borderRadius: 10, padding: '0.875rem 1.5rem',
                fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              ← Go Back
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ── Main export ─────────────────────────────────────────────────────────────
export default function TorBootSequence({ onComplete }) {
  const [phase, setPhase] = useState('connecting') // 'connecting' | 'onion' | 'done'

  return (
    <AnimatePresence mode="wait">
      {phase === 'connecting' && (
        <motion.div key="connecting" exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
          <TorConnecting onDone={() => setPhase('onion')} />
        </motion.div>
      )}
      {phase === 'onion' && (
        <motion.div key="onion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <OnionLanding onProceed={() => { setPhase('done'); onComplete() }} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
