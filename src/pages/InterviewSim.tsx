import { useState } from 'react'
import { useApp } from '@/lib/context'
import type { RoleLevel } from '@/types'

interface Message { role: 'user' | 'assistant'; content: string }

type SimState = 'setup' | 'loading' | 'active' | 'complete'

const ROLE_OPTIONS = ['Frontend Developer', 'Fullstack Developer', 'React Developer', 'Node.js Developer']

export default function InterviewSim() {
  const { state } = useApp()
  const [simState, setSimState] = useState<SimState>('setup')
  const [targetRole, setTargetRole] = useState('Frontend Developer')
  const [targetLevel, setTargetLevel] = useState<RoleLevel>('mid')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [finalScore, setFinalScore] = useState<number | null>(null)
  const [finalFeedback, setFinalFeedback] = useState('')
  const [error, setError] = useState('')

  const completedTopics = Object.values(state.topicProgress).filter(p => p.completed).length
  const overallScore = Math.round(state.readiness?.overall ?? 0)
  const phase = state.currentPhase

  async function startInterview() {
    setSimState('loading')
    setError('')
    setMessages([])
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          targetRole,
          targetLevel,
          phase,
          completedTopics,
          overallScore,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setMessages([{ role: 'assistant', content: data.message }])
      setSimState('active')
    } catch {
      setError('Failed to start interview. Check your API key.')
      setSimState('setup')
    }
  }

  async function sendMessage() {
    if (!input.trim() || sending) return
    const userMsg: Message = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setSending(true)
    setError('')

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'answer',
          targetRole,
          targetLevel,
          phase,
          completedTopics,
          overallScore,
          conversation: newMessages,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])

      if (data.isComplete) {
        setFinalScore(data.score)
        setFinalFeedback(data.feedback)
        setSimState('complete')
      }
    } catch {
      setError('Failed to get response — try again')
    } finally {
      setSending(false)
    }
  }

  const LEVEL_COLORS: Record<string, string> = { junior: '#A78BFA', mid: '#60CFFF', senior: '#C8FF00' }

  // ── Setup ────────────────────────────────────────────────────────────────────
  if (simState === 'setup') {
    return (
      <div style={{ padding: '32px 36px', maxWidth: 700, margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>
        <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 32, color: '#E8E8F0', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          Interview simulator
        </h1>
        <p style={{ color: '#9090A8', fontSize: 14, marginBottom: 32 }}>
          A real-time mock interview with an AI senior engineer. Answer freely — it adapts to what you say.
        </p>

        {error && <div style={{ marginBottom: 20, padding: '12px 16px', background: '#FF6B6B18', border: '1px solid #FF6B6B40', borderRadius: 10, color: '#FF6B6B', fontSize: 13 }}>{error}</div>}

        <label style={{ display: 'block', fontSize: 12, color: '#9090A8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
          Role
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
          {ROLE_OPTIONS.map(r => (
            <button key={r} onClick={() => setTargetRole(r)} style={{
              padding: '11px 16px', borderRadius: 10, border: '1px solid',
              borderColor: targetRole === r ? '#C8FF00' : '#2E2E3A',
              background: targetRole === r ? '#C8FF0018' : '#1A1A1F',
              color: targetRole === r ? '#C8FF00' : '#9090A8',
              fontSize: 13, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
            }}>{r}</button>
          ))}
        </div>

        <label style={{ display: 'block', fontSize: 12, color: '#9090A8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
          Seniority level
        </label>
        <div style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
          {(['junior', 'mid', 'senior'] as RoleLevel[]).map(level => (
            <button key={level} onClick={() => setTargetLevel(level)} style={{
              flex: 1, padding: '12px', borderRadius: 10, border: '1px solid',
              borderColor: targetLevel === level ? LEVEL_COLORS[level] : '#2E2E3A',
              background: targetLevel === level ? `${LEVEL_COLORS[level]}18` : '#1A1A1F',
              color: targetLevel === level ? LEVEL_COLORS[level] : '#9090A8',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s',
            }}>
              {level}
            </button>
          ))}
        </div>

        {/* Readiness snapshot */}
        <div style={{ background: '#1A1A1F', border: '1px solid #2E2E3A', borderRadius: 12, padding: '16px 20px', marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: '#9090A8', marginBottom: 10 }}>Your current readiness snapshot</div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#C8FF00', fontFamily: 'JetBrains Mono, monospace' }}>{overallScore}%</div>
              <div style={{ fontSize: 11, color: '#9090A8' }}>overall score</div>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#60CFFF', fontFamily: 'JetBrains Mono, monospace' }}>{completedTopics}</div>
              <div style={{ fontSize: 11, color: '#9090A8' }}>topics done</div>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#A78BFA', fontFamily: 'JetBrains Mono, monospace' }}>{state.examSessions.length}</div>
              <div style={{ fontSize: 11, color: '#9090A8' }}>exams taken</div>
            </div>
          </div>
        </div>

        <button onClick={startInterview} style={{
          width: '100%', padding: '14px', background: '#C8FF00', color: '#0D0D0F',
          border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer',
        }}>
          Start interview →
        </button>
      </div>
    )
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (simState === 'loading') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
        <div style={{ width: 40, height: 40, border: '2px solid #2E2E3A', borderTopColor: '#C8FF00', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ color: '#9090A8' }}>Connecting to your interviewer...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  // ── Complete ─────────────────────────────────────────────────────────────────
  if (simState === 'complete') {
    const scoreColor = (finalScore ?? 0) >= 80 ? '#C8FF00' : (finalScore ?? 0) >= 60 ? '#60CFFF' : (finalScore ?? 0) >= 40 ? '#A78BFA' : '#FF6B6B'
    return (
      <div style={{ padding: '32px 36px', maxWidth: 700, margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>
        <div style={{ background: '#1A1A1F', border: `1px solid ${scoreColor}40`, borderRadius: 16, padding: '32px', textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: '#9090A8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Interview complete</div>
          <div style={{ fontSize: 64, fontWeight: 800, color: scoreColor, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>{finalScore}</div>
          <div style={{ fontSize: 14, color: '#9090A8', marginTop: 8, lineHeight: 1.6 }}>{finalFeedback}</div>
        </div>

        {/* Full transcript */}
        <h2 style={{ fontSize: 13, color: '#9090A8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Transcript</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {messages.map((m, i) => <ChatBubble key={i} message={m} />)}
        </div>

        <button onClick={() => setSimState('setup')} style={{ width: '100%', padding: '13px', background: '#C8FF00', color: '#0D0D0F', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          Start another interview
        </button>
      </div>
    )
  }

  // ── Active interview ─────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header bar */}
      <div style={{ padding: '14px 28px', borderBottom: '1px solid #2E2E3A', display: 'flex', alignItems: 'center', gap: 12, background: '#1A1A1F', flexShrink: 0 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#C8FF00', animation: 'pulse-acid 2s infinite' }} />
        <span style={{ fontSize: 13, color: '#E8E8F0', fontWeight: 500 }}>Live interview</span>
        <span style={{ fontSize: 12, color: '#9090A8' }}>·</span>
        <span style={{ fontSize: 12, color: '#9090A8' }}>{targetLevel} {targetRole}</span>
        <button onClick={() => setSimState('setup')} style={{ marginLeft: 'auto', fontSize: 12, color: '#9090A8', background: 'none', border: '1px solid #2E2E3A', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
          End
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((m, i) => <ChatBubble key={i} message={m} />)}
        {sending && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#9090A8', fontSize: 13 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#3A3A45', animation: `bounce 0.8s ${i * 0.15}s ease-in-out infinite` }} />
              ))}
            </div>
            Interviewer is thinking...
          </div>
        )}
        {error && <div style={{ color: '#FF6B6B', fontSize: 13 }}>{error}</div>}
        <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} } @keyframes pulse-acid { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>

      {/* Input */}
      <div style={{ padding: '16px 28px', borderTop: '1px solid #2E2E3A', background: '#1A1A1F', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
            style={{
              flex: 1, padding: '12px 14px', background: '#0D0D0F', border: '1px solid #2E2E3A',
              borderRadius: 10, color: '#E8E8F0', fontSize: 14, outline: 'none', resize: 'none',
              fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5, minHeight: 52, maxHeight: 160,
            }}
            onFocus={e => (e.target.style.borderColor = '#C8FF00')}
            onBlur={e => (e.target.style.borderColor = '#2E2E3A')}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            style={{
              padding: '12px 18px', background: input.trim() && !sending ? '#C8FF00' : '#2A2A32',
              color: input.trim() && !sending ? '#0D0D0F' : '#6060A8',
              border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700,
              cursor: input.trim() && !sending ? 'pointer' : 'not-allowed', alignSelf: 'flex-end',
            }}>
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', animation: 'slideUp 0.25s ease' }}>
      <div style={{
        maxWidth: '80%', padding: '14px 16px', borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        background: isUser ? '#C8FF0015' : '#1A1A1F',
        border: `1px solid ${isUser ? '#C8FF0030' : '#2E2E3A'}`,
        fontSize: 14, color: '#E8E8F0', lineHeight: 1.6,
      }}>
        {!isUser && <div style={{ fontSize: 10, color: '#9090A8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Interviewer</div>}
        <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
      </div>
    </div>
  )
}
