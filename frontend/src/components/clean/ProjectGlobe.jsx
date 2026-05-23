import { useEffect, useRef, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { PROFILE } from '../../data/profile'
import { motion, AnimatePresence } from 'framer-motion'

// Convert lat/lng to 3D sphere coordinates
function latLngToVec3(lat, lng, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

function Globe({ onNodeClick }) {
  const meshRef = useRef()
  const groupRef = useRef()

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12
    }
  })

  const nodes = PROFILE.projects.map(p => ({
    ...p,
    vec: latLngToVec3(p.position.lat, p.position.lng, 1.02),
  }))

  return (
    <group ref={groupRef}>
      {/* Earth sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.1}
          roughness={0.8}
          wireframe={false}
        />
      </mesh>

      {/* Wireframe overlay */}
      <mesh>
        <sphereGeometry args={[1.001, 32, 32]} />
        <meshBasicMaterial
          color="#6366f1"
          wireframe
          transparent
          opacity={0.08}
        />
      </mesh>

      {/* Project node markers */}
      {nodes.map(node => (
        <group key={node.id} position={node.vec}>
          <mesh
            onClick={(e) => { e.stopPropagation(); onNodeClick(node) }}
            onPointerEnter={() => document.body.style.cursor = 'pointer'}
            onPointerLeave={() => document.body.style.cursor = 'auto'}
          >
            <sphereGeometry args={[0.025, 16, 16]} />
            <meshBasicMaterial color={node.color} />
          </mesh>
          {/* Outer glow ring */}
          <mesh>
            <ringGeometry args={[0.028, 0.038, 16]} />
            <meshBasicMaterial color={node.color} transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* Atmosphere */}
      <mesh>
        <sphereGeometry args={[1.05, 32, 32]} />
        <meshBasicMaterial color="#6366f1" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}

function NodeModal({ node, onClose }) {
  if (!node) return null
  const statusClass = `status-badge status-${node.status.replace(' ', '')}`
  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-card"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onClick={e => e.stopPropagation()}
        >
          <button className="modal-close" onClick={onClose}>✕</button>
          <div style={{ marginBottom: '0.25rem' }}>
            <span className={statusClass}>{node.status}</span>
          </div>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.75rem',
            fontWeight: 700, marginTop: '0.5rem', marginBottom: '0.25rem',
            color: node.color,
          }}>
            {node.title}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '1rem' }}>
            {node.subtitle}
          </p>
          <p style={{ color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
            {node.description}
          </p>
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Stack
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {node.tech.map(t => (
                <span key={t} className="chip chip-accent">{t}</span>
              ))}
            </div>
          </div>
          <div style={{
            background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
            padding: '0.875rem 1rem', fontSize: '0.875rem',
            color: 'var(--text-secondary)', marginBottom: '1.25rem',
          }}>
            📈 {node.impact}
          </div>
          {node.github && (
            <a
              href={node.github}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
              style={{ textDecoration: 'none' }}
            >
              View on GitHub →
            </a>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function ProjectGlobe() {
  const [selectedNode, setSelectedNode] = useState(null)

  return (
    <section id="projects" className="section" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container">
        <div style={{ marginBottom: '3rem' }}>
          <div className="section-label">Projects</div>
          <h2 className="display-lg" style={{ marginBottom: '1rem' }}>
            What I've Built
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 520, fontSize: '1.0625rem' }}>
            Click any node on the globe to explore a project. Each point represents a deployed system.
          </p>
        </div>

        <div style={{
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          border: '1px solid var(--border)',
          background: '#0f172a',
          height: 480,
          position: 'relative',
        }}>
          <Canvas camera={{ position: [0, 0, 2.6], fov: 45 }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
            <pointLight position={[-5, -3, -5]} intensity={0.3} color="#6366f1" />
            <Globe onNodeClick={setSelectedNode} />
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              autoRotate={false}
              minPolarAngle={Math.PI * 0.2}
              maxPolarAngle={Math.PI * 0.8}
            />
          </Canvas>

          {/* Legend overlay */}
          <div style={{
            position: 'absolute', bottom: '1.25rem', left: '1.25rem',
            display: 'flex', flexWrap: 'wrap', gap: '0.75rem', maxWidth: '70%',
          }}>
            {PROFILE.projects.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedNode(p)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 'var(--radius-full)', padding: '0.25rem 0.75rem',
                  cursor: 'pointer', color: '#fff', fontSize: '0.75rem', fontWeight: 600,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                {p.title}
              </button>
            ))}
          </div>
        </div>

        {selectedNode && (
          <NodeModal node={selectedNode} onClose={() => setSelectedNode(null)} />
        )}
      </div>
    </section>
  )
}
