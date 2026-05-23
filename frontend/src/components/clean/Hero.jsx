import { motion } from 'framer-motion'
import { PROFILE } from '../../data/profile'

const TARGET = 'sudo su'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

// Stylized profile photo placeholder
function PhotoFrame() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.5 }}
      style={{ position: 'relative', width: 200, height: 200, flexShrink: 0 }}
    >
      {/* Rotating outer ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute', inset: -6,
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, var(--accent), var(--accent-light), var(--accent-2), var(--accent))',
          opacity: 0.7,
        }}
      />
      {/* White mask ring */}
      <div style={{
        position: 'absolute', inset: -3, borderRadius: '50%',
        background: 'var(--bg)',
      }} />
      {/* Inner circle — photo placeholder */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        border: '2px solid var(--border)',
        overflow: 'hidden',
      }}>
        {/* Silhouette SVG */}
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ opacity: 0.25 }}>
          <circle cx="50" cy="38" r="18" fill="var(--text-secondary)" />
          <ellipse cx="50" cy="85" rx="30" ry="22" fill="var(--text-secondary)" />
        </svg>
        <div style={{
          position: 'absolute', bottom: '1rem',
          fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)',
          letterSpacing: '0.06em', textTransform: 'uppercase',
          fontFamily: 'var(--font-mono)',
        }}>
          Add Photo
        </div>
      </div>
      {/* Corner accent dots */}
      {['-4px', 'auto', 'auto', '-4px'].map((t, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: i < 2 ? '-4px' : 'auto', bottom: i >= 2 ? '-4px' : 'auto',
          left: i % 2 === 0 ? '-4px' : 'auto', right: i % 2 !== 0 ? '-4px' : 'auto',
          width: 12, height: 12, borderRadius: '50%',
          background: 'var(--accent)',
        }} />
      ))}
    </motion.div>
  )
}

export default function Hero({ typedSoFar = '' }) {
  const typed = typedSoFar || ''
  const remaining = TARGET.slice(typed.length)
  return (
    <section id="hero" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      paddingTop: '6rem', position: 'relative', overflow: 'hidden', background: 'var(--bg)',
    }}>
      {/* Gradient orbs */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-5%', left: '-8%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      {/* ── HACKER MODE EASTER EGG TEASER ─────── */}
      <motion.div
        initial={{ opacity: 0, x: 40, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'absolute', top: '7.5rem', right: 'clamp(1.5rem, 4vw, 3rem)', zIndex: 10, width: 260 }}
      >
        <motion.div
          animate={{ boxShadow: ['0 0 0px 0px rgba(220,38,38,0)', '0 0 36px 10px rgba(220,38,38,0.25)', '0 0 0px 0px rgba(220,38,38,0)'] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: 'linear-gradient(145deg, #0d0000 0%, #120000 100%)', border: '1.5px solid rgba(220,38,38,0.55)', borderRadius: 14, padding: '1.125rem 1.375rem', backdropFilter: 'blur(12px)', userSelect: 'none' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.875rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
            <span style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: '#441111', letterSpacing: '0.06em' }}>root@baakaa:~</span>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', lineHeight: 1.9 }}>
            <div style={{ color: '#551111' }}>$ system --scan</div>
            <div style={{ color: '#882222' }}>Hidden mode detected.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
              <motion.span style={{ color: '#ff2222', fontSize: '0.6rem' }} animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.85, repeat: Infinity }}>●</motion.span>
              <span style={{ color: '#dd0000', fontWeight: 700, letterSpacing: '0.04em' }}>ROOT ACCESS AVAILABLE</span>
            </div>
          </div>
          <div style={{ height: 1, background: 'rgba(220,38,38,0.2)', margin: '0.875rem 0' }} />
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: '#661111', marginBottom: '0.5rem', letterSpacing: '0.08em' }}>UNLOCK SEQUENCE:</div>

          {/* Live fill-in command line */}
          <div style={{
            fontFamily: "'JetBrains Mono',monospace", fontSize: '1.0625rem', fontWeight: 700,
            letterSpacing: '0.14em', display: 'flex', alignItems: 'center', gap: '0.25rem',
            textShadow: typed.length > 0 ? '0 0 18px rgba(255,0,0,0.7)' : undefined,
          }}>
            <span style={{ color: '#661111' }}>$</span>
            <span style={{ marginLeft: '0.25rem' }}>
              {/* Typed so far — bright red/green */}
              <span style={{ color: typed.length > 0 ? '#00ff41' : '#ff1111' }}>
                {typed || 'sudo su'}
              </span>
              {/* Remaining — dimmed */}
              {typed.length > 0 && (
                <span style={{ color: '#441111' }}>{remaining}</span>
              )}
            </span>
            {/* Blinking cursor */}
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: typed.length > 0 ? 0.5 : 0.9, repeat: Infinity }}
              style={{ color: typed.length > 0 ? '#00ff41' : '#ff3333' }}
            >█</motion.span>
          </div>

          <div style={{ marginTop: '0.625rem', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: '#4a1111', lineHeight: 1.6 }}>
            Type anywhere on the page.<br />No button. No click. Just type.
          </div>
        </motion.div>
        <motion.div animate={{ x: [0, -7, 0] }} transition={{ duration: 1.3, repeat: Infinity }} style={{ position: 'absolute', right: 'calc(100% + 6px)', top: '50%', transform: 'translateY(-50%)', color: 'rgba(220,38,38,0.45)', fontSize: '1.5rem', pointerEvents: 'none' }}>←</motion.div>
      </motion.div>

      <div className="container" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', flexWrap: 'wrap' }}>
          {/* Text content */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <div className="section-label" style={{ marginBottom: '1rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>baakaa</span> · Available for opportunities
              </div>
            </motion.div>

            <motion.h1 className="display-xl"
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.1 } } }}
            >
              Hi, I'm<br />
              <span className="gradient-text">{PROFILE.meta.name}</span>
            </motion.h1>

            <motion.p style={{ fontSize: 'clamp(1rem, 2vw, 1.1875rem)', color: 'var(--text-secondary)', marginTop: '1rem', lineHeight: 1.75, maxWidth: 520 }}
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6, delay: 0.25 } } }}
            >
              {PROFILE.meta.title}
            </motion.p>
            <motion.p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '2rem' }}
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6, delay: 0.35 } } }}
            >
              📍 {PROFILE.meta.location}
            </motion.p>

            <motion.p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: 500, marginBottom: '2rem' }}
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6, delay: 0.4 } } }}
            >
              {PROFILE.meta.tagline}
            </motion.p>

            <motion.div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.5 } } }}
            >
              <a href="#projects" className="btn btn-primary">View Projects ↓</a>
              <a href="#contact" className="btn btn-secondary">Get in Touch</a>
              <a href={PROFILE.meta.github} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">GitHub ↗</a>
            </motion.div>

            <motion.div style={{ marginTop: '3rem', display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6, delay: 0.6 } } }}
            >
              {[
                { label: 'Years Active', value: `${PROFILE.meta.yearsExperience}+` },
                { label: 'Projects', value: `${PROFILE.projects.length}` },
                { label: 'Skills', value: `${PROFILE.skills.length}` },
              ].map(stat => (
                <div key={stat.label}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.04em' }}>{stat.value}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '0.125rem' }}>{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Profile photo placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
          >
            <PhotoFrame />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>{PROFILE.meta.name}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>@{PROFILE.meta.alias}</div>
            </div>
          </motion.div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
        <motion.div style={{ width: 1.5, height: 32, background: 'var(--border-strong)', borderRadius: 4 }} animate={{ scaleY: [1, 0.4, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.4, repeat: Infinity }} />
      </div>
    </section>
  )
}
