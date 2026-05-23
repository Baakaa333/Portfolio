import { motion } from 'framer-motion'
import { PROFILE } from '../../data/profile'

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] } },
})

export default function About() {
  const edu = PROFILE.education

  return (
    <section id="about" className="section">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '4rem', alignItems: 'start' }}>

          {/* Left — bio */}
          <div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0)}>
              <div className="section-label">About Me</div>
              <h2 className="display-lg" style={{ marginBottom: '1.5rem' }}>
                Building at the<br />intersection of
                <br /><span className="gradient-text">code & security</span>
              </h2>
            </motion.div>

            <motion.p
              style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.0625rem', marginBottom: '1.5rem' }}
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0.1)}
            >
              {PROFILE.about}
            </motion.p>

            <motion.div
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0.2)}
            >
              {[
                { icon: '📍', text: PROFILE.meta.location },
                { icon: '✉️', text: PROFILE.meta.email },
                { icon: '🐙', text: 'github.com/Baakaa333' },
                { icon: '📸', text: 'instagram.com/_____baakaa_/' },
              ].map(item => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                  <span>{item.icon}</span><span>{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — education */}
          <div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0.05)}>
              <div className="section-label" style={{ marginBottom: '1.5rem' }}>Education</div>
            </motion.div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {edu.map((e, i) => (
                <motion.div
                  key={e.institution}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    borderLeft: `3px solid ${e.status === 'Currently Enrolled' ? 'var(--accent)' : e.status === 'Completed' ? 'var(--accent-2)' : 'var(--text-muted)'}`,
                  }}
                  initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={fadeUp(0.1 + i * 0.08)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{e.degree}</div>
                      <div style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.875rem' }}>{e.institution}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.125rem' }}>{e.location}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '0.2rem 0.625rem', borderRadius: 'var(--radius-full)' }}>
                        {e.year}
                      </span>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.625rem',
                        borderRadius: 'var(--radius-full)', letterSpacing: '0.04em',
                        background: e.status === 'Currently Enrolled' ? 'rgba(99,102,241,0.1)' : e.status === 'Completed' ? 'rgba(16,185,129,0.1)' : 'rgba(148,163,184,0.1)',
                        color: e.status === 'Currently Enrolled' ? 'var(--accent)' : e.status === 'Completed' ? 'var(--accent-2)' : 'var(--text-muted)',
                      }}>
                        {e.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Experience cards */}
            <motion.div style={{ marginTop: '1.5rem' }} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0.3)}>
              <div className="section-label" style={{ marginBottom: '1rem' }}>Experience</div>
            </motion.div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {PROFILE.experience.map((e, i) => (
                <motion.div
                  key={e.role}
                  className="card"
                  style={{ padding: '1.25rem', borderLeft: '3px solid var(--accent)' }}
                  initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={fadeUp(0.35 + i * 0.08)}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{e.role}</div>
                  <div style={{ color: 'var(--accent)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{e.company} · {e.period}</div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '0.75rem' }}>{e.description}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {e.tech.map(t => <span key={t} className="chip">{t}</span>)}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
