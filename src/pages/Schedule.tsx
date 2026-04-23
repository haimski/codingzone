import { useState, useMemo } from 'react'
import { useApp } from '@/lib/context'
import { CURRICULUM } from '@/lib/curriculum'
import type { StudySession } from '@/types'

function getMondayOf(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

function getWeekDays(weekStart: string): string[] {
  const days = []
  const start = new Date(weekStart)
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Schedule() {
  const { state, dispatch } = useApp()
  const [weekStart, setWeekStart] = useState(() => getMondayOf(new Date()))
  const [showAdd, setShowAdd] = useState(false)
  const [newSession, setNewSession] = useState({ date: new Date().toISOString().split('T')[0], topicId: '', hoursPlanned: 2, notes: '' })

  const days = useMemo(() => getWeekDays(weekStart), [weekStart])
  const currentWeekPlan = state.weekPlans.find(w => w.weekStart === weekStart)
  const sessions = currentWeekPlan?.sessions ?? []

  // Stats for this week
  const hoursPlanned = sessions.reduce((a, s) => a + s.hoursPlanned, 0)
  const hoursActual = sessions.reduce((a, s) => a + s.hoursActual, 0)
  const sessionsCompleted = sessions.filter(s => s.completed).length

  function prevWeek() {
    const d = new Date(weekStart)
    d.setDate(d.getDate() - 7)
    setWeekStart(d.toISOString().split('T')[0])
  }
  function nextWeek() {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 7)
    setWeekStart(d.toISOString().split('T')[0])
  }

  function addSession() {
    if (!newSession.topicId || !newSession.date) return
    const session: StudySession = {
      id: `session_${Date.now()}`,
      date: newSession.date,
      topicId: newSession.topicId,
      hoursPlanned: newSession.hoursPlanned,
      hoursActual: 0,
      completed: false,
      notes: newSession.notes,
    }
    dispatch({ type: 'ADD_STUDY_SESSION', session, weekStart })
    setShowAdd(false)
    setNewSession({ date: new Date().toISOString().split('T')[0], topicId: '', hoursPlanned: 2, notes: '' })
  }

  function toggleComplete(sessionId: string) {
    // Find session and toggle — rebuild weekPlans
    const updatedPlans = state.weekPlans.map(w => {
      if (w.weekStart !== weekStart) return w
      return {
        ...w,
        sessions: w.sessions.map(s => {
          if (s.id !== sessionId) return s
          const completed = !s.completed
          if (completed) {
            dispatch({ type: 'LOG_HOURS', topicId: s.topicId, hours: s.hoursPlanned })
          }
          return { ...s, completed, hoursActual: completed ? s.hoursPlanned : 0 }
        })
      }
    })
    // Direct localStorage update for simplicity
    const raw = JSON.parse(localStorage.getItem('codingzone_state') ?? '{}')
    raw.weekPlans = updatedPlans
    localStorage.setItem('codingzone_state', JSON.stringify(raw))
    window.location.reload() // simplest way to re-sync state
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div style={{ padding: '32px 36px', maxWidth: 900, margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 32, color: '#E8E8F0', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Weekly schedule
          </h1>
          <p style={{ color: '#9090A8', fontSize: 14, margin: 0 }}>
            Plan your study sessions, mark them done, and track your weekly hours
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{
          padding: '10px 18px', background: '#C8FF00', color: '#0D0D0F',
          border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}>
          + Add session
        </button>
      </div>

      {/* Week nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <button onClick={prevWeek} style={{ background: 'none', border: '1px solid #2E2E3A', borderRadius: 8, color: '#9090A8', padding: '6px 12px', cursor: 'pointer', fontSize: 16 }}>‹</button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ fontSize: 14, color: '#E8E8F0', fontWeight: 500 }}>
            Week of {new Date(weekStart + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <button onClick={nextWeek} style={{ background: 'none', border: '1px solid #2E2E3A', borderRadius: 8, color: '#9090A8', padding: '6px 12px', cursor: 'pointer', fontSize: 16 }}>›</button>
      </div>

      {/* Week stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Sessions', value: sessions.length },
          { label: 'Planned hrs', value: `${hoursPlanned}h` },
          { label: 'Actual hrs', value: `${hoursActual}h` },
          { label: 'Completed', value: `${sessionsCompleted}/${sessions.length}` },
        ].map(s => (
          <div key={s.label} style={{ background: '#1A1A1F', border: '1px solid #2E2E3A', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#C8FF00', fontFamily: 'JetBrains Mono, monospace' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#9090A8', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* 7-day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 24 }}>
        {days.map((day, i) => {
          const daySessions = sessions.filter(s => s.date === day)
          const isToday = day === today
          const dayHours = daySessions.reduce((a, s) => a + s.hoursPlanned, 0)

          return (
            <div key={day} style={{
              background: isToday ? '#1A1A22' : '#1A1A1F',
              border: `1px solid ${isToday ? '#C8FF0040' : '#2E2E3A'}`,
              borderRadius: 10, padding: '10px 8px', minHeight: 100,
            }}>
              <div style={{ fontSize: 11, color: isToday ? '#C8FF00' : '#9090A8', marginBottom: 4, fontWeight: isToday ? 600 : 400 }}>
                {DAY_LABELS[i]}
              </div>
              <div style={{ fontSize: 13, color: isToday ? '#E8E8F0' : '#6060A8', marginBottom: 8, fontFamily: 'JetBrains Mono, monospace' }}>
                {new Date(day + 'T12:00:00').getDate()}
              </div>
              {dayHours > 0 && (
                <div style={{ fontSize: 10, color: '#C8FF00', marginBottom: 6, fontFamily: 'JetBrains Mono, monospace' }}>
                  {dayHours}h
                </div>
              )}
              {daySessions.map(s => {
                const topic = CURRICULUM.find(t => t.id === s.topicId)
                return (
                  <div key={s.id} onClick={() => toggleComplete(s.id)} style={{
                    fontSize: 10, padding: '4px 6px', borderRadius: 5, marginBottom: 4,
                    background: s.completed ? '#C8FF0020' : '#2A2A32',
                    border: `1px solid ${s.completed ? '#C8FF0040' : '#3A3A45'}`,
                    color: s.completed ? '#C8FF00' : '#9090A8',
                    cursor: 'pointer', lineHeight: 1.3,
                    textDecoration: s.completed ? 'line-through' : 'none',
                  }}>
                    {topic?.title.substring(0, 22) ?? s.topicId}…
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Session list */}
      {sessions.length > 0 && (
        <div>
          <h2 style={{ fontSize: 13, color: '#9090A8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
            This week's sessions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sessions.sort((a, b) => a.date.localeCompare(b.date)).map(s => {
              const topic = CURRICULUM.find(t => t.id === s.topicId)
              const dayName = new Date(s.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
              return (
                <div key={s.id} style={{
                  background: '#1A1A1F', border: `1px solid ${s.completed ? '#C8FF0030' : '#2E2E3A'}`,
                  borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <div
                    onClick={() => toggleComplete(s.id)}
                    style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0, cursor: 'pointer',
                      border: `2px solid ${s.completed ? '#C8FF00' : '#3A3A45'}`,
                      background: s.completed ? '#C8FF00' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                    {s.completed && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-6" stroke="#0D0D0F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: s.completed ? '#9090A8' : '#E8E8F0', fontWeight: 500, textDecoration: s.completed ? 'line-through' : 'none', textDecorationColor: '#3A3A45' }}>
                      {topic?.title ?? s.topicId}
                    </div>
                    <div style={{ fontSize: 11, color: '#6060A8', marginTop: 2 }}>{dayName}</div>
                  </div>
                  <div style={{ fontSize: 13, color: '#9090A8', fontFamily: 'JetBrains Mono, monospace' }}>
                    {s.hoursPlanned}h
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {sessions.length === 0 && (
        <div style={{ background: '#1A1A1F', border: '1px dashed #2E2E3A', borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 15, color: '#E8E8F0', marginBottom: 6 }}>No sessions this week</div>
          <div style={{ fontSize: 13, color: '#9090A8', marginBottom: 20 }}>Add study sessions to plan your week and track your hours</div>
          <button onClick={() => setShowAdd(true)} style={{ padding: '10px 20px', background: '#C8FF00', color: '#0D0D0F', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            + Add first session
          </button>
        </div>
      )}

      {/* Add session modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div style={{ background: '#1A1A1F', border: '1px solid #2E2E3A', borderRadius: 16, padding: 28, width: '90%', maxWidth: 440, animation: 'slideUp 0.2s ease' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 16, color: '#E8E8F0' }}>Add study session</h3>

            <label style={{ display: 'block', fontSize: 11, color: '#9090A8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Date</label>
            <input type="date" value={newSession.date} onChange={e => setNewSession(p => ({ ...p, date: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', background: '#0D0D0F', border: '1px solid #2E2E3A', borderRadius: 8, color: '#E8E8F0', fontSize: 13, marginBottom: 16, outline: 'none' }} />

            <label style={{ display: 'block', fontSize: 11, color: '#9090A8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Topic</label>
            <select value={newSession.topicId} onChange={e => setNewSession(p => ({ ...p, topicId: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', background: '#0D0D0F', border: '1px solid #2E2E3A', borderRadius: 8, color: '#E8E8F0', fontSize: 13, marginBottom: 16, outline: 'none', cursor: 'pointer' }}>
              <option value="">— select topic —</option>
              {[0,1,2].map(phase => (
                <optgroup key={phase} label={`Phase ${phase}`}>
                  {CURRICULUM.filter(t => t.phase === phase).map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </optgroup>
              ))}
            </select>

            <label style={{ display: 'block', fontSize: 11, color: '#9090A8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Planned hours</label>
            <input type="number" min="0.5" max="8" step="0.5" value={newSession.hoursPlanned}
              onChange={e => setNewSession(p => ({ ...p, hoursPlanned: parseFloat(e.target.value) }))}
              style={{ width: '100%', padding: '10px 14px', background: '#0D0D0F', border: '1px solid #2E2E3A', borderRadius: 8, color: '#E8E8F0', fontSize: 13, marginBottom: 20, outline: 'none', fontFamily: 'JetBrains Mono, monospace' }} />

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={addSession} disabled={!newSession.topicId} style={{
                flex: 1, padding: '11px', background: newSession.topicId ? '#C8FF00' : '#2A2A32',
                color: newSession.topicId ? '#0D0D0F' : '#6060A8', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: newSession.topicId ? 'pointer' : 'not-allowed',
              }}>Add session</button>
              <button onClick={() => setShowAdd(false)} style={{ padding: '11px 16px', background: 'transparent', color: '#9090A8', border: '1px solid #2E2E3A', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
