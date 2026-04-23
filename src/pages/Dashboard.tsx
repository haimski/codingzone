import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/lib/context'
import { CURRICULUM, PHASE_LABELS } from '@/lib/curriculum'

export default function Dashboard() {
  const { state } = useApp()
  const nav = useNavigate()
  const { readiness, topicProgress, totalHoursStudied } = state

  const overall = readiness?.overall ?? 0
  const verdict = readiness?.verdict ?? 'not-yet'

  const verdictConfig = {
    'not-yet': { color: '#9090A8', label: 'Not ready yet', sub: 'Keep studying — you\'re building the foundation' },
    'junior':  { color: '#A78BFA', label: 'Junior-ready',  sub: 'Start applying to junior frontend roles now' },
    'mid':     { color: '#60CFFF', label: 'Mid-level ready', sub: 'Strong candidate for mid-level positions' },
    'senior':  { color: '#C8FF00', label: 'Senior-ready',   sub: 'Apply confidently to senior & fullstack roles' },
  }[verdict]

  const phaseStats = useMemo(() => [0, 1, 2].map(phase => {
    const topics = CURRICULUM.filter(t => t.phase === phase)
    const done = topics.filter(t => topicProgress[t.id]?.completed).length
    const score = readiness?.byPhase[phase as 0|1|2] ?? 0
    return { phase, label: PHASE_LABELS[phase], total: topics.length, done, score }
  }), [topicProgress, readiness])

  const recentExams = [...state.examSessions]
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .slice(0, 4)

  const totalTopics = CURRICULUM.length
  const completedTopics = CURRICULUM.filter(t => topicProgress[t.id]?.completed).length
  const pctComplete = Math.round((completedTopics / totalTopics) * 100)

  // Top weaknesses and strengths
  const weaknesses = readiness?.topWeaknesses ?? []
  const strengths = readiness?.topStrengths ?? []

  return (
    <div style={{ padding: '32px 36px', maxWidth: 960, margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 32, color: '#E8E8F0', margin: 0, letterSpacing: '-0.5px' }}>
          Your progress
        </h1>
        <p style={{ color: '#9090A8', marginTop: 6, fontSize: 14 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Top row: big score + verdict */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, marginBottom: 20 }}>

        {/* Score ring */}
        <div style={{
          background: '#1A1A1F', border: '1px solid #2E2E3A', borderRadius: 16,
          padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }}>
          <div style={{ position: 'relative', width: 140, height: 140 }}>
            <svg viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)', width: 140, height: 140 }}>
              <circle cx="70" cy="70" r="58" fill="none" stroke="#2A2A32" strokeWidth="10"/>
              <circle cx="70" cy="70" r="58" fill="none" stroke={verdictConfig.color}
                strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 58}`}
                strokeDashoffset={`${2 * Math.PI * 58 * (1 - overall / 100)}`}
                style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.4s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 34, fontWeight: 700, color: verdictConfig.color, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>
                {Math.round(overall)}
              </span>
              <span style={{ fontSize: 11, color: '#9090A8', marginTop: 2 }}>/ 100</span>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: verdictConfig.color }}>{verdictConfig.label}</div>
            <div style={{ fontSize: 12, color: '#9090A8', marginTop: 4, lineHeight: 1.4 }}>{verdictConfig.sub}</div>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 12 }}>
          <StatCard label="Topics completed" value={`${completedTopics}/${totalTopics}`} sub={`${pctComplete}% of curriculum`} color="#C8FF00" />
          <StatCard label="Hours studied" value={`${Math.round(totalHoursStudied)}h`} sub="logged across all topics" color="#60CFFF" />
          <StatCard label="Exams taken" value={state.examSessions.length} sub={`avg ${state.examSessions.length ? Math.round(state.examSessions.reduce((a,b)=>a+b.overallScore,0)/state.examSessions.length) : 0}% score`} color="#A78BFA" />
          <StatCard label="Day streak" value={`${state.streakDays}`} sub="consecutive study days" color="#FF6B6B" />
        </div>
      </div>

      {/* Phase breakdown */}
      <div style={{ marginBottom: 20 }}>
        <SectionHeader title="Phase breakdown" action={{ label: 'View curriculum →', onClick: () => nav('/curriculum') }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {phaseStats.map(ps => (
            <div key={ps.phase} style={{
              background: '#1A1A1F', border: '1px solid #2E2E3A', borderRadius: 12, padding: 20,
              cursor: 'pointer', transition: 'border-color 0.15s',
            }}
              onClick={() => nav('/curriculum')}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#C8FF00')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#2E2E3A')}
            >
              <div style={{ fontSize: 11, color: '#9090A8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                Phase {ps.phase}
              </div>
              <div style={{ fontSize: 13, color: '#E8E8F0', marginBottom: 14, fontWeight: 500 }}>
                {ps.label.split('—')[1]?.trim()}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                <span style={{ color: '#9090A8' }}>{ps.done}/{ps.total} topics</span>
                <span style={{ color: '#C8FF00', fontFamily: 'JetBrains Mono, monospace' }}>{Math.round(ps.score)}%</span>
              </div>
              <ProgressBar value={ps.done / ps.total * 100} />
            </div>
          ))}
        </div>
      </div>

      {/* Weaknesses + Strengths */}
      {readiness && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div style={{ background: '#1A1A1F', border: '1px solid #2E2E3A', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: '#FF6B6B', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
              Focus areas
            </div>
            {weaknesses.length ? weaknesses.map(w => (
              <div key={w} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF6B6B', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#E8E8F0' }}>{w}</span>
              </div>
            )) : <p style={{ color: '#9090A8', fontSize: 13 }}>Complete some exams to see your weak spots</p>}
          </div>
          <div style={{ background: '#1A1A1F', border: '1px solid #2E2E3A', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: '#C8FF00', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
              Strengths
            </div>
            {strengths.length ? strengths.map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C8FF00', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#E8E8F0' }}>{s}</span>
              </div>
            )) : <p style={{ color: '#9090A8', fontSize: 13 }}>Your strengths will appear as you take exams</p>}
          </div>
        </div>
      )}

      {/* Recent exams */}
      <div>
        <SectionHeader title="Recent exams" action={{ label: 'Go to exam room →', onClick: () => nav('/exam') }} />
        {recentExams.length === 0 ? (
          <EmptyState message="No exams yet" sub="Head to the Exam Room to test your knowledge on any topic" cta="Start an exam" onClick={() => nav('/exam')} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentExams.map(session => {
              const topic = CURRICULUM.find(t => t.id === session.topicId)
              return (
                <div key={session.id} style={{
                  background: '#1A1A1F', border: '1px solid #2E2E3A', borderRadius: 10,
                  padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16,
                }}>
                  <ScoreBadge score={session.overallScore} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: '#E8E8F0', fontWeight: 500 }}>{topic?.title ?? session.topicId}</div>
                    <div style={{ fontSize: 11, color: '#9090A8', marginTop: 2 }}>{new Date(session.startedAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ fontSize: 11, color: '#6060A8', fontFamily: 'JetBrains Mono, monospace' }}>
                    {session.questions.length}q
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub: string; color: string }) {
  return (
    <div style={{ background: '#1A1A1F', border: '1px solid #2E2E3A', borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ fontSize: 11, color: '#9090A8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#6060A8', marginTop: 6 }}>{sub}</div>
    </div>
  )
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div style={{ height: 3, background: '#2A2A32', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ width: `${value}%`, height: '100%', background: '#C8FF00', borderRadius: 2, transition: 'width 0.6s ease' }} />
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? '#C8FF00' : score >= 60 ? '#60CFFF' : score >= 40 ? '#A78BFA' : '#FF6B6B'
  return (
    <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 14, fontWeight: 700, color, fontFamily: 'JetBrains Mono, monospace' }}>{score}</span>
    </div>
  )
}

function SectionHeader({ title, action }: { title: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <h2 style={{ fontSize: 13, fontWeight: 600, color: '#9090A8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>{title}</h2>
      {action && <button onClick={action.onClick} style={{ fontSize: 12, color: '#C8FF00', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>{action.label}</button>}
    </div>
  )
}

function EmptyState({ message, sub, cta, onClick }: { message: string; sub: string; cta: string; onClick: () => void }) {
  return (
    <div style={{ background: '#1A1A1F', border: '1px dashed #2E2E3A', borderRadius: 12, padding: '32px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 15, color: '#E8E8F0', marginBottom: 6 }}>{message}</div>
      <div style={{ fontSize: 13, color: '#9090A8', marginBottom: 16 }}>{sub}</div>
      <button onClick={onClick} style={{ padding: '8px 18px', background: '#C8FF00', color: '#0D0D0F', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{cta}</button>
    </div>
  )
}
