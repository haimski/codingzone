import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { useApp } from './lib/context'
import Dashboard from './pages/Dashboard'
import Curriculum from './pages/Curriculum'
import ExamRoom from './pages/ExamRoom'
import InterviewSim from './pages/InterviewSim'
import Schedule from './pages/Schedule'

const NAV = [
  { to: '/',          label: 'Dashboard',   icon: GridIcon },
  { to: '/curriculum',label: 'Curriculum',  icon: BookIcon },
  { to: '/exam',      label: 'Exam Room',   icon: ZapIcon },
  { to: '/interview', label: 'Interview',   icon: MicIcon },
  { to: '/schedule',  label: 'Schedule',    icon: CalIcon },
]

export default function App() {
  const { state } = useApp()
  const loc = useLocation()

  const overall = state.readiness?.overall ?? 0
  const verdict = state.readiness?.verdict ?? 'not-yet'
  const verdictColor = verdict === 'senior' ? '#C8FF00' : verdict === 'mid' ? '#60CFFF' : verdict === 'junior' ? '#A78BFA' : '#9090A8'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D0D0F' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 220, flexShrink: 0, borderRight: '1px solid #2E2E3A',
        display: 'flex', flexDirection: 'column', padding: '24px 0',
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 20px 28px' }}>
          <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, color: '#E8E8F0', letterSpacing: '-0.5px' }}>
            Dev<span style={{ color: '#C8FF00' }}>Tracker</span>
          </div>
          <div style={{ fontSize: 11, color: '#6060A8', marginTop: 2, fontFamily: 'JetBrains Mono, monospace' }}>
            frontend · fullstack
          </div>
        </div>

        {/* Readiness pill */}
        <div style={{ margin: '0 12px 24px', padding: '10px 14px', background: '#1A1A1F', borderRadius: 10, border: `1px solid ${verdictColor}30` }}>
          <div style={{ fontSize: 10, color: '#9090A8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            Readiness
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 4, background: '#2A2A32', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${overall}%`, height: '100%', background: verdictColor, borderRadius: 2, transition: 'width 0.6s ease' }} />
            </div>
            <span style={{ fontSize: 12, color: verdictColor, fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>
              {Math.round(overall)}%
            </span>
          </div>
          <div style={{ fontSize: 11, color: verdictColor, marginTop: 5 }}>
            {verdict === 'not-yet' ? 'Keep going' : verdict === 'junior' ? 'Junior-ready' : verdict === 'mid' ? 'Mid-level ready' : 'Senior-ready'}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1 }}>
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 20px', fontSize: 14, textDecoration: 'none',
              color: isActive ? '#C8FF00' : '#9090A8',
              background: isActive ? 'rgba(200,255,0,0.06)' : 'transparent',
              borderLeft: isActive ? '2px solid #C8FF00' : '2px solid transparent',
              transition: 'all 0.15s ease',
            })}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Stats footer */}
        <div style={{ padding: '20px', borderTop: '1px solid #2E2E3A', marginTop: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Stat label="Hours" value={Math.round(state.totalHoursStudied)} />
            <Stat label="Streak" value={`${state.streakDays}d`} />
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, overflowY: 'auto', minHeight: '100vh' }}>
        <Routes>
          <Route path="/"           element={<Dashboard />} />
          <Route path="/curriculum" element={<Curriculum />} />
          <Route path="/exam"       element={<ExamRoom />} />
          <Route path="/interview"  element={<InterviewSim />} />
          <Route path="/schedule"   element={<Schedule />} />
        </Routes>
      </main>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 18, fontWeight: 600, color: '#E8E8F0', fontFamily: 'JetBrains Mono, monospace' }}>{value}</div>
      <div style={{ fontSize: 10, color: '#6060A8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  )
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────
function GridIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>
}
function BookIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 2h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/><path d="M6 2v12M9 5h1M9 8h1"/></svg>
}
function ZapIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L3 9h5l-1 6 6-8H8l1-6z"/></svg>
}
function MicIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="5" y="1" width="6" height="8" rx="3"/><path d="M2 8a6 6 0 0 0 12 0M8 14v2"/></svg>
}
function CalIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="3" width="14" height="12" rx="2"/><path d="M5 1v3M11 1v3M1 7h14"/></svg>
}
