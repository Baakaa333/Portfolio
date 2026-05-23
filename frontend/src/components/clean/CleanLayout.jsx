import { useState, useEffect } from 'react'
import { PROFILE } from '../../data/profile'
import Hero from './Hero'
// typedSoFar is passed from App.jsx and forwarded to Hero for live sudo su echo
import About from './About'
import Skills from './Skills'
import ProjectGlobe from './ProjectGlobe'
import CodePlayground from './CodePlayground'
import ContactForm from './ContactForm'
import CVEDownload from './CVEDownload'
import { motion, AnimatePresence } from 'framer-motion'

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return (
    <nav className={`clean-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-inner">
        <a href="#hero" className="nav-logo">
          {PROFILE.meta.alias}<span>.</span>
        </a>
        <ul className="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#skills">Skills</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#playground">Code</a></li>
          <li><a href="#system">System</a></li>
          <li><a href="#contact" className="nav-cta">Contact</a></li>
        </ul>
      </div>
    </nav>
  )
}

function AboutSystem() {
  const [open, setOpen] = useState(false)
  return (
    <section id="system" className="section" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container">
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <div className="section-label">Meta</div>
          <h2 className="display-lg" style={{ marginBottom: '1rem' }}>
            About the <span className="gradient-text">System</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', lineHeight: 1.75, marginBottom: '1.5rem', maxWidth: 580 }}>
            This isn't an ordinary portfolio. It's a custom-engineered dual-interface platform
            built and crafted entirely by <strong>baakaa</strong>.
          </p>

          <button
            onClick={() => setOpen(o => !o)}
            className="btn btn-secondary"
            style={{ marginBottom: '1.5rem' }}
          >
            {open ? '▲ Hide System Data' : '▼ Reveal System Data'}
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="card" style={{ padding: '2rem', borderLeft: '4px solid var(--accent)', marginBottom: '1.5rem' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent)', marginBottom: '1rem', letterSpacing: '0.1em' }}>
                    SYSTEM MANIFEST / about_system
                  </div>
                  <p style={{ color: 'var(--text-primary)', lineHeight: 1.8, fontSize: '1rem', marginBottom: '1.5rem' }}>
                    {PROFILE.aboutSystem}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {[
                      { label: 'Frontend', value: 'React JSX + Vite' },
                      { label: 'Backend', value: 'Python FastAPI' },
                      { label: 'Animation', value: 'Framer Motion' },
                      { label: '3D Globe', value: 'Three.js / R3F' },
                      { label: 'Security', value: 'OpenPGP.js' },
                      { label: 'Terminal', value: 'Custom React Shell' },
                    ].map(item => (
                      <div key={item.label} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          {item.label}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', lineHeight: 1.9,
                  color: 'var(--text-muted)', background: 'var(--bg-tertiary)',
                  padding: '1.5rem', borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>// Terminal access hint</div>
                  <div>Type <strong style={{ color: 'var(--text-primary)' }}>sudo su</strong> anywhere on the page</div>
                  <div>to unlock the <strong style={{ color: 'var(--text-primary)' }}>baakaa OS terminal</strong>.</div>
                  <div style={{ marginTop: '0.5rem' }}>Inside: run <strong style={{ color: 'var(--text-primary)' }}>about system</strong> for terminal metadata.</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem 0', background: 'var(--bg)' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          © 2026 Prajwal Chaudhary (baakaa). Built with React + FastAPI.
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {[
            { label: 'GitHub', href: PROFILE.meta.github },
            { label: 'Instagram', href: PROFILE.meta.instagram },
            { label: 'Email', href: `mailto:${PROFILE.meta.email}` },
          ].map(l => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
              style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 150ms ease' }}
              onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
            >
              {l.label}
            </a>
          ))}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', opacity: 0.4 }}>
          // root@baakaa — dual interface active
        </div>
      </div>
    </footer>
  )
}

export default function CleanLayout({ typedSoFar = '' }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main>
        <Hero typedSoFar={typedSoFar} />
        <About />
        <Skills />
        <ProjectGlobe />
        <CodePlayground />
        <AboutSystem />
        <section id="contact" className="section">
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'start' }}>
              <div>
                <div className="section-label">Get In Touch</div>
                <h2 className="display-lg" style={{ marginBottom: '1rem' }}>
                  Let's build<br /><span className="gradient-text">something real</span>
                </h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '2rem', fontSize: '1.0625rem' }}>
                  Messages are PGP-encrypted directly in your browser before transmission.
                  No plaintext ever leaves your device.
                </p>
                <ContactForm />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <div className="section-label">Resume</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                    CVE Security Advisory
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                    Not a PDF. A Mitre CVE-formatted security disclosure — skills as exploit payloads,
                    projects as proof of concept, institution as validation.
                  </p>
                </div>
                <CVEDownload />
                <div className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem' }}>Direct channels</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[
                      { label: PROFILE.meta.github.replace('https://', ''), href: PROFILE.meta.github, icon: '⌨' },
                      { label: 'instagram.com/_____baakaa_/', href: PROFILE.meta.instagram, icon: '📸' },
                      { label: PROFILE.meta.email, href: `mailto:${PROFILE.meta.email}`, icon: '✉' },
                    ].map(l => (
                      <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 150ms ease', wordBreak: 'break-all' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                      >
                        <span style={{ fontSize: '1rem', flexShrink: 0 }}>{l.icon}</span>{l.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
