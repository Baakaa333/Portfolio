import { useState, useEffect, useRef, useCallback } from 'react'

const ts = () => {
  const n = new Date()
  return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}:${String(n.getSeconds()).padStart(2,'0')}.${String(n.getMilliseconds()).padStart(3,'0')}`
}
const rand = (a,b) => Math.floor(Math.random()*(b-a+1))+a
const pick = a => a[rand(0,a.length-1)]
const hex2 = () => Math.floor(Math.random()*256).toString(16).padStart(2,'0')
const hexRow = () => Array.from({length:8},hex2).join(' ')
const randIP = () => `${rand(1,254)}.${rand(1,254)}.${rand(1,254)}.${rand(1,254)}`
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
const randB64 = n => Array.from({length:n},()=>B64[rand(0,63)]).join('')
const GARBLED = '!@#$%^&*<>[]|~ÐŁÆ§ΩΨΔΣΦ∂∇'.split('')
const garble = n => Array.from({length:n},()=>pick(GARBLED)).join('')
const pbar = (p,w=14) => `[${'▓'.repeat(Math.round(p/100*w))}${'░'.repeat(w-Math.round(p/100*w))}] ${String(p).padStart(3)}%`

const TOR_IPS = ['185.220.101.47','45.141.215.111','193.11.114.32','51.75.52.118','176.10.104.240']
const DECRYPT_TARGETS = ['GHOST_WIRE_PAYLOAD','ACCESS_GRANTED','CIRCUIT_ESTABLISHED','KERNEL_LOADED','IDENTITY_CONFIRMED']

const TYPES = {
  INFO: { prefix: '[INFO]', color: '#22d3ee' },
  WARN: { prefix: '[WARN]', color: '#f59e0b' },
  CRIT: { prefix: '[CRIT]', color: '#ff2222' },
  OK:   { prefix: '[ OK ]', color: '#00ff41' },
  SYS:  { prefix: '[SYS ]', color: '#8b5cf6' },
  NET:  { prefix: '[NET ]', color: '#38bdf8' },
  HEX:  { prefix: '[HEX ]', color: '#4b5563' },
  BIN:  { prefix: '[BIN ]', color: '#4ade80' },
}

let _lid = 0
const mkLine = (type, text, extra={}) => ({
  id: ++_lid, type, prefix: TYPES[type].prefix, color: TYPES[type].color,
  time: ts(), text, flash: type==='CRIT', ...extra,
})

const EVENTS = [
  { t:'ip',   w:14, fn:(add)=> add(mkLine('INFO',`TRACING ${pick(TOR_IPS)} → ${pbar(rand(5,95),10)} — ${rand(10,340)}ms RTT`)) },
  { t:'hex',  w:8,  fn:(add)=> add(mkLine('HEX', `0x${rand(0,0xFFFF).toString(16).toUpperCase().padStart(4,'0')}: ${hexRow()}  |  ${hexRow()}`)) },
  { t:'hash', w:7,  fn:(add)=> add(mkLine('WARN',`SHA256 ${pbar(rand(10,96),12)} ${(rand(10,45)/10).toFixed(1)}M/s — ETA ${rand(2,90)}s`)) },
  { t:'ok',   w:15, fn:(add)=> add(mkLine('OK',  pick([
    `Circuit established — latency ${rand(80,320)}ms — 3 hops`,
    `TLS 1.3 handshake complete — cipher AES-256-GCM`,
    `Payload delivered — ${rand(512,65535)} bytes — checksum OK`,
    `Firewall rule applied — DROP src:${randIP()} port:${rand(1,65535)}`,
  ]))) },
  { t:'warn', w:8,  fn:(add)=> add(mkLine('WARN', pick([
    `Relay ${randIP()} latency spike — ${rand(400,1200)}ms — rerouting`,
    `Memory pressure: ${rand(72,91)}% — GC triggered`,
    `Certificate expiry in ${rand(1,14)} days — sec-core.local`,
    `Rate limit: ${rand(85,99)}% of quota consumed`,
  ]))) },
  { t:'net',  w:10, fn:(add)=> add(mkLine('NET', pick([
    `eth0 ↑ ${rand(1,50)}KB/s  ↓ ${rand(1,120)}KB/s — via tor-circuit`,
    `TCP SYN→SYN-ACK→ACK complete — ${randIP()}:${rand(1024,65535)}`,
    `DNS query: api.github.com → ${randIP()} [cached]`,
    `Packet capture: ${rand(1,12)} frames — proto TOR filtered`,
  ]))) },
  { t:'crit', w:3,  fn:(add)=> add(mkLine('CRIT', pick([
    `ANOMALOUS LOGIN — ${randIP()} — ${rand(20,200)} attempts — BLOCKED`,
    `BRUTE FORCE DETECTED port 22 — src ${randIP()} — DROPPING`,
    `CVE-2024-${rand(1000,9999)}: EXPLOIT ATTEMPT — MITIGATED`,
    `ARP SPOOF DETECTED: ${randIP()} claiming gateway MAC`,
  ]))) },
  { t:'b64',  w:5,  fn:(add)=> add(mkLine('SYS', `BASE64: ${randB64(44)}== [decoding...]`)) },
  { t:'bin',  w:4,  fn:(add)=> add(mkLine('BIN', `${Array.from({length:4},()=>Array.from({length:8},()=>rand(0,1)).join('')).join(' ')} → collapsing to metric`)) },
  {
    t:'decrypt', w:3,
    fn:(add, upd) => {
      const target = pick(DECRYPT_TARGETS)
      const id = ++_lid
      add({ id, type:'SYS', prefix:'[SYS ]', color:'#8b5cf6', time:ts(), text:`DECRYPT: ${garble(target.length)}`, flash:false })
      let step = 0
      const iv = setInterval(() => {
        step++
        const txt = target.slice(0,step) + garble(target.length-step)
        upd(id, `DECRYPT: ${txt}`, step>=target.length?'#00ff41':undefined)
        if (step>=target.length) {
          clearInterval(iv)
          setTimeout(()=>upd(id,`DECRYPT: ${target} ✓ RESOLVED`,'#00ff41'),200)
        }
      }, 75)
      return ()=>clearInterval(iv)
    },
  },
  {
    t:'stutter', w:3,
    fn:(add, upd) => {
      const labels = ['PAYLOAD DELIVERY','KEY EXCHANGE','RECON SCAN','TUNNEL BUILD','CERT VALIDATION']
      const label = pick(labels)
      const id = ++_lid
      let pct = rand(0,10)
      add({ id, type:'INFO', prefix:'[INFO]', color:'#22d3ee', time:ts(), text:`${label} ${pbar(pct)}`, flash:false })
      let stall = 0
      const tick = () => {
        if (pct>=100) return
        if (stall>0) { stall--; setTimeout(tick,rand(200,600)); return }
        if (Math.random()<0.28) { stall=rand(1,3); upd(id,`${label} ${pbar(pct)} ⟳ stalled`) }
        else { pct=Math.min(100,pct+rand(3,15)); upd(id,`${label} ${pbar(pct)}${pct===100?' — COMPLETE':''}`,pct===100?'#00ff41':undefined) }
        if (pct<100) setTimeout(tick,rand(150,500))
      }
      setTimeout(tick,300)
    },
  },
  {
    t:'sudo', w:1,
    fn:(add) => {
      const steps = [
        { d:0,    type:'SYS', text:`[sudo] password for ghost@node-7:` },
        { d:900,  type:'SYS', text:`[sudo] password for ghost@node-7: ${'•'.repeat(rand(6,10))}` },
        { d:1800, type:'SYS', text:`Verifying credentials — PAM auth v2.0` },
        { d:2600, type:'OK',  text:`Authentication successful — root shell opened` },
      ]
      const timers = steps.map(s=>setTimeout(()=>add(mkLine(s.type,s.text)),s.d))
      return ()=>timers.forEach(clearTimeout)
    },
  },
  {
    t:'typo', w:2,
    fn:(add) => {
      const seq = [
        { d:0,    type:'SYS', text:'ghost@node-7:~# scna --target 192.168.1.0' },
        { d:700,  type:'SYS', text:'ghost@node-7:~# sc' },
        { d:950,  type:'SYS', text:'ghost@node-7:~# ' },
        { d:1300, type:'SYS', text:'ghost@node-7:~# scan --target 192.168.1.0/24 --silent' },
        { d:2100, type:'NET', text:`Stealth SYN scan initiated — ${rand(1,65535)} ports — ${randIP()}` },
      ]
      const timers = seq.map(s=>setTimeout(()=>add(mkLine(s.type,s.text)),s.d))
      return ()=>timers.forEach(clearTimeout)
    },
  },
]

const TOTAL_W = EVENTS.reduce((s,e)=>s+e.w,0)
const pickEvent = () => {
  let r = Math.random()*TOTAL_W
  for (const e of EVENTS) { r-=e.w; if(r<=0) return e }
  return EVENTS[0]
}

const BOOT = [
  mkLine('SYS',  'Initializing ghost session — node-7 / cluster-alpha'),
  mkLine('OK',   'Tor circuit established — NL→DE→RO — latency 251ms'),
  mkLine('NET',  'eth0 active — MAC spoofed — DHCP lease acquired'),
  mkLine('OK',   'Hidden service descriptor published'),
  mkLine('SYS',  'Starting live intelligence stream...'),
  mkLine('HEX',  `0x0000: ${hexRow()}  |  ${hexRow()}`),
]

export default function LiveTerminalStream({ style }) {
  const [lines, setLines] = useState([])
  const scrollRef = useRef(null)
  const cleanups = useRef([])

  const addLine  = useCallback(l => setLines(p => { const n=[...p,l]; return n.length>200?n.slice(-200):n }),[])
  const updLine  = useCallback((id,text,color) => setLines(p=>p.map(l=>l.id===id?{...l,text,color:color||l.color}:l)),[])

  useEffect(()=>{
    BOOT.forEach((l,i)=>setTimeout(()=>addLine(l),i*160))
  // eslint-disable-next-line
  },[])

  useEffect(()=>{
    let stopped = false
    const fire = () => {
      if (stopped) return
      const ev = pickEvent()
      const c = ev.fn(addLine, updLine)
      if (c) cleanups.current.push(c)
      const tid = setTimeout(fire, rand(350,1500))
      cleanups.current.push(()=>clearTimeout(tid))
    }
    const startTid = setTimeout(fire, 1400)
    cleanups.current.push(()=>clearTimeout(startTid))
    return ()=>{ stopped=true; cleanups.current.forEach(fn=>fn?.()); cleanups.current=[] }
  // eslint-disable-next-line
  },[])

  useEffect(()=>{ const el=scrollRef.current; if(el) el.scrollTop=el.scrollHeight },[lines])

  return (
    <div style={{ height:'100%', overflow:'hidden', display:'flex', flexDirection:'column', position:'relative', ...style }}>
      <div ref={scrollRef} style={{ flex:1, overflowY:'auto', padding:'0.375rem 0.625rem', scrollbarWidth:'thin', scrollbarColor:'#1a3a2a transparent' }}>
        {lines.map(line=>(
          <div
            key={line.id}
            className={line.flash?'flash-alert':''}
            style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.6rem', lineHeight:1.65, whiteSpace:'pre', color:line.color, textShadow:line.flash?'0 0 10px #ff0000':`0 0 3px ${line.color}44` }}
          >
            <span style={{color:'#1e3a2a',marginRight:'0.4rem'}}>{line.time}</span>
            <span style={{color:line.color,fontWeight:700,marginRight:'0.4rem'}}>{line.prefix}</span>
            {line.text}
          </div>
        ))}
      </div>
    </div>
  )
}
