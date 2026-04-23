import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/lib/context'
import { CURRICULUM, SECTIONS, PHASE_LABELS } from '@/lib/curriculum'
import type { Phase } from '@/types'

const PHASE_COLORS: Record<number, string> = { 0: '#A78BFA', 1: '#C8FF00', 2: '#60CFFF' }
const WEIGHT_COLORS = { 'very-high': '#FF6B6B', 'high': '#C8FF00', 'medium': '#60CFFF', 'low': '#9090A8' }

export default function Curriculum() {
  const { state, dispatch } = useApp()
  const nav = useNavigate()
  const [activePhase, setActivePhase] = useState<Phase | 'all'>('all')
  const [search, setSearch] = useState('')
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null)
  const [logHoursId, setLogHoursId] = useState<string | null>(null)
  const [hoursInput, setHoursInput] = useState('')

  const filtered = useMemo(() => CURRICULUM.filter(t => {
    const phaseMatch = activePhase === 'all' || t.phase === activePhase
    const searchMatch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.section.toLowerCase().includes(search.toLowerCase())
    return phaseMatch && searchMatch
  }), [activePhase, search])

  // Group by section
  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>()
    filtered.forEach(t => {
      if (!map.has(t.section)) map.set(t.section, [])
      map.get(t.section)!.push(t)
    })
    return map
  }, [filtered])

  const totalDone = CURRICULUM.filter(t => state.topicProgress[t.id]?.completed).length

  function handleLogHours(topicId: string) {
    const h = parseFloat(hoursInput)
    if (!isNaN(h) && h > 0) {
      dispatch({ type: 'LOG_HOURS', topicId, hours: h })
      setLogHoursId(null)
      setHoursInput('')
    }
  }

  return (
    <div style={{ padding: '32px 36px', maxWidth: 900, margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 32, color: '#E8E8F0', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          Curriculum
        </h1>
        <p style={{ color: '#9090A8', fontSize: 14, margin: 0 }}>
          {totalDone}/{CURRICULUM.length} topics completed · Track your progress, log hours, and jump into exams
        </p>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        {(['all', 0, 1, 2] as const).map(p => (
          <button key={p} onClick={() => setActivePhase(p)} style={{
            padding: '6px 14px', borderRadius: 8, border: '1px solid',
            borderColor: activePhase === p ? PHASE_COLORS[p as number] ?? '#C8FF00' : '#2E2E3A',
            background: activePhase === p ? `${PHASE_COLORS[p as number] ?? '#C8FF00'}18` : 'transparent',
            color: activePhase === p ? PHASE_COLORS[p as number] ?? '#C8FF00' : '#9090A8',
            fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
          }}>
            {p === 'all' ? 'All phases' : `Phase ${p}`}
          </button>
        ))}
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search topics..."
          style={{
            marginLeft: 'auto', padding: '6px 14px', borderRadius: 8, border: '1px solid #2E2E3A',
            background: '#1A1A1F', color: '#E8E8F0', fontSize: 13, outline: 'none', width: 200,
          }}
        />
      </div>

      {/* Topic list grouped by section */}
      {[...grouped.entries()].map(([section, topics]) => {
        const phase = topics[0].phase
        const sectionDone = topics.filter(t => state.topicProgress[t.id]?.completed).length
        const sectionScore = state.readiness?.bySection[section]

        return (
          <div key={section} style={{ marginBottom: 24 }}>
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: PHASE_COLORS[phase], textTransform: 'uppercase', letterSpacing: '0.1em', background: `${PHASE_COLORS[phase]}18`, padding: '2px 8px', borderRadius: 4 }}>
                Phase {phase}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#E8E8F0' }}>{section}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9090A8' }}>{sectionDone}/{topics.length}</span>
              {sectionScore !== undefined && (
                <span style={{ fontSize: 11, color: '#C8FF00', fontFamily: 'JetBrains Mono, monospace' }}>
                  {Math.round(sectionScore)}%
                </span>
              )}
            </div>

            {/* Topics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {topics.map(topic => {
                const prog = state.topicProgress[topic.id]
                const isDone = prog?.completed ?? false
                const avgScore = prog?.examScores.length
                  ? Math.round(prog.examScores.reduce((a, b) => a + b, 0) / prog.examScores.length)
                  : null
                const isExpanded = expandedTopic === topic.id
                const isLogging = logHoursId === topic.id

                return (
                  <div key={topic.id} style={{
                    background: '#1A1A1F', border: `1px solid ${isDone ? '#C8FF00' + '30' : '#2E2E3A'}`,
                    borderRadius: 10, overflow: 'hidden', transition: 'border-color 0.15s',
                  }}>
                    <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                      onClick={() => setExpandedTopic(isExpanded ? null : topic.id)}>

                      {/* Checkbox */}
                      <div
                        onClick={e => { e.stopPropagation(); dispatch({ type: 'TOGGLE_TOPIC', topicId: topic.id }) }}
                        style={{
                          width: 20, height: 20, borderRadius: 5, border: `2px solid ${isDone ? '#C8FF00' : '#3A3A45'}`,
                          background: isDone ? '#C8FF00' : 'transparent', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}>
                        {isDone && <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5l2.5 2.5 4.5-5" stroke="#0D0D0F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>

                      {/* Title */}
                      <span style={{ flex: 1, fontSize: 13, color: isDone ? '#9090A8' : '#E8E8F0', textDecoration: isDone ? 'line-through' : 'none', textDecorationColor: '#3A3A45' }}>
                        {topic.title}
                      </span>

                      {/* Metadata badges */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <span style={{ fontSize: 10, color: WEIGHT_COLORS[topic.interviewWeight], background: `${WEIGHT_COLORS[topic.interviewWeight]}18`, padding: '2px 7px', borderRadius: 4, fontWeight: 500 }}>
                          {topic.interviewWeight.replace('-', ' ')}
                        </span>
                        <span style={{ fontSize: 11, color: '#6060A8', fontFamily: 'JetBrains Mono, monospace' }}>
                          {topic.estimatedHours}h
                        </span>
                        {avgScore !== null && (
                          <span style={{ fontSize: 11, color: avgScore >= 70 ? '#C8FF00' : avgScore >= 50 ? '#60CFFF' : '#FF6B6B', fontFamily: 'JetBrains Mono, monospace' }}>
                            {avgScore}%
                          </span>
                        )}
                        <span style={{ color: '#6060A8', fontSize: 12 }}>{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {/* Expanded panel */}
                    {isExpanded && (
                      <div style={{ borderTop: '1px solid #2E2E3A', padding: '14px 16px', animation: 'slideUp 0.2s ease' }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                          {/* Exam history */}
                          {prog?.examScores.length ? (
                            <div style={{ flex: 1, minWidth: 160 }}>
                              <div style={{ fontSize: 11, color: '#9090A8', marginBottom: 6 }}>Exam history</div>
                              <div style={{ display: 'flex', gap: 4 }}>
                                {prog.examScores.map((s, i) => (
                                  <div key={i} style={{
                                    width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: s >= 70 ? '#C8FF0020' : s >= 50 ? '#60CFFF20' : '#FF6B6B20',
                                    border: `1px solid ${s >= 70 ? '#C8FF0040' : s >= 50 ? '#60CFFF40' : '#FF6B6B40'}`,
                                    fontSize: 10, color: s >= 70 ? '#C8FF00' : s >= 50 ? '#60CFFF' : '#FF6B6B',
                                    fontFamily: 'JetBrains Mono, monospace',
                                  }}>{s}</div>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          {/* Hours */}
                          <div>
                            <div style={{ fontSize: 11, color: '#9090A8', marginBottom: 6 }}>Hours spent</div>
                            <span style={{ fontSize: 15, color: '#E8E8F0', fontFamily: 'JetBrains Mono, monospace' }}>
                              {prog?.hoursSpent ?? 0}h
                            </span>
                            <span style={{ fontSize: 11, color: '#6060A8' }}> / {topic.estimatedHours}h est.</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button
                            onClick={() => nav(`/exam?topic=${topic.id}`)}
                            style={{ padding: '6px 14px', background: '#C8FF00', color: '#0D0D0F', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            Take exam
                          </button>
                          {!isLogging ? (
                            <button
                              onClick={() => setLogHoursId(topic.id)}
                              style={{ padding: '6px 14px', background: 'transparent', color: '#9090A8', border: '1px solid #2E2E3A', borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>
                              Log hours
                            </button>
                          ) : (
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <input
                                autoFocus
                                type="number" min="0.5" max="12" step="0.5"
                                value={hoursInput} onChange={e => setHoursInput(e.target.value)}
                                placeholder="2.5"
                                style={{ width: 64, padding: '5px 10px', background: '#0D0D0F', border: '1px solid #C8FF00', borderRadius: 7, color: '#C8FF00', fontSize: 13, outline: 'none', fontFamily: 'JetBrains Mono, monospace' }}
                                onKeyDown={e => e.key === 'Enter' && handleLogHours(topic.id)}
                              />
                              <button onClick={() => handleLogHours(topic.id)} style={{ padding: '5px 12px', background: '#C8FF0020', color: '#C8FF00', border: '1px solid #C8FF0040', borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>Save</button>
                              <button onClick={() => setLogHoursId(null)} style={{ padding: '5px 10px', background: 'transparent', color: '#9090A8', border: '1px solid #2E2E3A', borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>✕</button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
