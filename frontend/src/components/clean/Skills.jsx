import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { PROFILE } from '../../data/profile'

const CATEGORY_LABELS = {
  all: 'All',
  languages: 'Languages & Mobile',
  security: 'Cybersecurity Tools',
  ai_automation: 'AI / Automation',
  web_cms: 'Web & CMS',
  frontend: 'Frontend',
  databases: 'Databases',
}

const CATEGORY_COLORS = {
  languages: '#6366f1',
  security: '#ff0033',
  ai_automation: '#10b981',
  web_cms: '#f59e0b',
  frontend: '#6366f1',
  databases: '#06b6d4',
}

export default function Skills() {
  const [active, setActive] = useState('all')
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const categories = ['all', ...Object.keys(CATEGORY_LABELS).filter(k => k !== 'all')]

  const filtered = active === 'all'
    ? PROFILE.skills
    : PROFILE.skills.filter(s => s.category === active)

  return (
    <section id="skills" className="section" ref={ref}>
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <div className="section-label">Capabilities</div>
          <h2 className="display-lg" style={{ marginBottom: '0.75rem' }}>Technical Skills</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 560 }}>
            Spanning full-stack dev, cross-platform mobile (Flutter), and hands-on offensive/defensive security.
          </p>
        </div>

        {/* Role cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {PROFILE.roles.map((role, i) => (
            <motion.div
              key={role.id}
              className="card"
              style={{ padding: '1.5rem', borderTop: `3px solid ${i === 0 ? 'var(--accent)' : '#ff0033'}` }}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{role.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.25rem' }}>{role.title}</div>
              <div style={{ color: 'var(--accent)', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                {role.tagline}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1rem' }}>
                {role.description}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {role.keywords.map(k => <span key={k} className="chip chip-accent">{k}</span>)}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
          {categories.filter(c => CATEGORY_LABELS[c] && (c === 'all' || PROFILE.skills.some(s => s.category === c))).map(cat => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              style={{
                padding: '0.375rem 1rem', borderRadius: 'var(--radius-full)',
                border: '1.5px solid',
                borderColor: active === cat
                  ? (CATEGORY_COLORS[cat] || 'var(--accent)')
                  : 'var(--border)',
                background: active === cat
                  ? `${(CATEGORY_COLORS[cat] || 'var(--accent)')}18`
                  : 'transparent',
                color: active === cat
                  ? (CATEGORY_COLORS[cat] || 'var(--accent)')
                  : 'var(--text-muted)',
                fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 150ms ease',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>

        {/* Skill bars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((skill, i) => {
            const color = CATEGORY_COLORS[skill.category] || 'var(--accent)'
            return (
              <motion.div
                key={skill.name}
                className="card"
                style={{ padding: '1.25rem 1.5rem' }}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: i * 0.04 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{skill.name}</span>
                  <span style={{ color, fontWeight: 700, fontSize: '0.875rem' }}>{skill.level}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                  <motion.div
                    style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${color}88, ${color})`, transformOrigin: 'left' }}
                    initial={{ scaleX: 0 }}
                    animate={inView ? { scaleX: skill.level / 100 } : { scaleX: 0 }}
                    transition={{ duration: 1.1, delay: 0.2 + i * 0.04, ease: [0.34, 1.56, 0.64, 1] }}
                  />
                </div>
                <div style={{ fontSize: '0.7rem', color, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.375rem', opacity: 0.75 }}>
                  {CATEGORY_LABELS[skill.category] || skill.category}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
