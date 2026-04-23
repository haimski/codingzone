import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useApp } from '@/lib/context'
import { CURRICULUM } from '@/lib/curriculum'
import type { ExamQuestion, ExamSession, ExamAnswer, RoleLevel } from '@/types'

type ExamState = 'select' | 'loading' | 'answering' | 'grading' | 'results'

export default function ExamRoom() {
  const { state, dispatch } = useApp()
  const [searchParams] = useSearchParams()
  const preselectedId = searchParams.get('topic')

  const [examState, setExamState] = useState<ExamState>('select')
  const [selectedTopicId, setSelectedTopicId] = useState(preselectedId ?? '')
  const [targetLevel, setTargetLevel] = useState<RoleLevel>('mid')
  const [questions, setQuestions] = useState<ExamQuestion[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [gradedAnswers, setGradedAnswers] = useState<ExamAnswer[]>([])
  const [gradingCurrent, setGradingCurrent] = useState(false)
  const [session, setSession] = useState<ExamSession | null>(null)
  const [error, setError] = useState('')

  const topic = CURRICULUM.find(t => t.id === selectedTopicId)

  // Auto-scroll to top on state change
  useEffect(() => { window.scrollTo(0, 0) }, [examState])

  async function startExam() {
    if (!topic) return
    setExamState('loading')
    setError('')
    try {
      const prog = state.topicProgress[topic.id]
      const res = await fetch('/api/exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicTitle: topic.title,
          topicSection: topic.section,
          phase: topic.phase,
          interviewWeight: topic.interviewWeight,
          pastScores: prog?.examScores ?? [],
          targetLevel,
        }),
      })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setQuestions(data.questions)
      setAnswers(new Array(data.questions.length).fill(''))
      setCurrentQ(0)
      setCurrentAnswer('')
      setGradedAnswers([])
      setExamState('answering')
    } catch {
      setError('Failed to generate questions. Check your API key in Vercel env vars.')
      setExamState('select')
    }
  }

  async function submitAnswer() {
    if (!currentAnswer.trim() || !topic) return
    const q = questions[currentQ]
    const newAnswers = [...answers]
    newAnswers[currentQ] = currentAnswer
    setAnswers(newAnswers)
    setGradingCurrent(true)

    try {
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q.question,
          answer: currentAnswer,
          gradingCriteria: q.gradingCriteria,
          questionType: q.type,
          topicTitle: topic.title,
        }),
      })
      const data = await res.json()
      const graded: ExamAnswer = {
        questionId: q.id,
        answer: currentAnswer,
        score: data.score,
        feedback: data.feedback,
        strengths: data.strengths ?? [],
        improvements: data.improvements ?? [],
      }
      const newGraded = [...gradedAnswers, graded]
      setGradedAnswers(newGraded)
      setGradingCurrent(false)

      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1)
        setCurrentAnswer('')
      } else {
        // All done — build session
        const overallScore = Math.round(newGraded.reduce((a, g) => a + g.score, 0) / newGraded.length)
        const newSession: ExamSession = {
          id: `exam_${Date.now()}`,
          topicId: topic.id,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          questions,
          answers: newGraded,
          overallScore,
          feedback: newGraded.map(g => g.feedback).join(' '),
        }
        setSession(newSession)
        dispatch({ type: 'ADD_EXAM', session: newSession })
        setExamState('results')
      }
    } catch {
      setGradingCurrent(false)
      setError('Failed to grade answer — try again')
    }
  }

  // ── Select screen ────────────────────────────────────────────────────────────
  if (examState === 'select') {
    return (
      <div style={{ padding: '32px 36px', maxWidth: 760, margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>
        <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 32, color: '#E8E8F0', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          Exam room
        </h1>
        <p style={{ color: '#9090A8', fontSize: 14, marginBottom: 32 }}>
          AI generates fresh questions calibrated to your history. Paste your answer back and get graded instantly.
        </p>

        {error && <div style={{ marginBottom: 20, padding: '12px 16px', background: '#FF6B6B18', border: '1px solid #FF6B6B40', borderRadius: 10, color: '#FF6B6B', fontSize: 13 }}>{error}</div>}

        {/* Topic selector */}
        <label style={{ display: 'block', fontSize: 12, color: '#9090A8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
          Select a topic
        </label>
        <select
          value={selectedTopicId}
          onChange={e => setSelectedTopicId(e.target.value)}
          style={{ width: '100%', padding: '12px 16px', background: '#1A1A1F', border: '1px solid #2E2E3A', borderRadius: 10, color: '#E8E8F0', fontSize: 14, marginBottom: 20, outline: 'none', cursor: 'pointer' }}>
          <option value="">— choose a topic —</option>
          {[0,1,2].map(phase => (
            <optgroup key={phase} label={`Phase ${phase}`}>
              {CURRICULUM.filter(t => t.phase === phase).map(t => {
                const prog = state.topicProgress[t.id]
                const avgScore = prog?.examScores.length ? Math.round(prog.examScores.reduce((a,b)=>a+b,0)/prog.examScores.length) : null
                return (
                  <option key={t.id} value={t.id}>
                    {t.title}{avgScore !== null ? ` — last: ${avgScore}%` : ''}
                  </option>
                )
              })}
            </optgroup>
          ))}
        </select>

        {/* Level selector */}
        <label style={{ display: 'block', fontSize: 12, color: '#9090A8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
          Target role level
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

        {/* Topic preview */}
        {topic && (
          <div style={{ background: '#1A1A1F', border: '1px solid #2E2E3A', borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: '#9090A8', marginBottom: 4 }}>{topic.section}</div>
            <div style={{ fontSize: 15, color: '#E8E8F0', fontWeight: 500, marginBottom: 12 }}>{topic.title}</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ fontSize: 12, color: '#9090A8' }}>Interview weight: <span style={{ color: WEIGHT_COLORS[topic.interviewWeight] }}>{topic.interviewWeight}</span></div>
              <div style={{ fontSize: 12, color: '#9090A8' }}>Estimated: <span style={{ color: '#E8E8F0' }}>{topic.estimatedHours}h</span></div>
              {state.topicProgress[topic.id]?.examScores.length ? (
                <div style={{ fontSize: 12, color: '#9090A8' }}>
                  Past scores: {state.topicProgress[topic.id].examScores.map((s, i) => (
                    <span key={i} style={{ color: s >= 70 ? '#C8FF00' : s >= 50 ? '#60CFFF' : '#FF6B6B', fontFamily: 'JetBrains Mono, monospace', marginLeft: 4 }}>{s}</span>
                  ))}
                </div>
              ) : <div style={{ fontSize: 12, color: '#6060A8' }}>No prior exams on this topic</div>}
            </div>
          </div>
        )}

        <button
          disabled={!selectedTopicId}
          onClick={startExam}
          style={{
            width: '100%', padding: '14px', background: selectedTopicId ? '#C8FF00' : '#2A2A32',
            color: selectedTopicId ? '#0D0D0F' : '#6060A8', border: 'none', borderRadius: 10,
            fontSize: 15, fontWeight: 700, cursor: selectedTopicId ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s', letterSpacing: '0.01em',
          }}>
          Generate exam questions →
        </button>
      </div>
    )
  }

  // ── Loading screen ───────────────────────────────────────────────────────────
  if (examState === 'loading') {
    return (
      <div style={{ padding: '32px 36px', maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 20 }}>
        <div style={{ width: 48, height: 48, border: '2px solid #2E2E3A', borderTopColor: '#C8FF00', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ fontSize: 16, color: '#9090A8' }}>Generating your exam questions...</div>
        <div style={{ fontSize: 13, color: '#6060A8', textAlign: 'center' }}>Calibrating difficulty to your history on this topic</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  // ── Answering screen ─────────────────────────────────────────────────────────
  if (examState === 'answering') {
    const q = questions[currentQ]
    const progress = ((currentQ) / questions.length) * 100

    return (
      <div style={{ padding: '32px 36px', maxWidth: 760, margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <div style={{ flex: 1, height: 4, background: '#2A2A32', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#C8FF00', borderRadius: 2, transition: 'width 0.4s ease' }} />
          </div>
          <span style={{ fontSize: 13, color: '#9090A8', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>
            {currentQ + 1} / {questions.length}
          </span>
        </div>

        {/* Question metadata */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: TYPE_COLORS[q.type] + '20', color: TYPE_COLORS[q.type], border: `1px solid ${TYPE_COLORS[q.type]}40` }}>
            {q.type.replace('-', ' ')}
          </span>
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: '#2A2A32', color: '#9090A8' }}>
            {'★'.repeat(q.difficulty)}{'☆'.repeat(3 - q.difficulty)}
          </span>
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: `${LEVEL_COLORS[q.roleLevel]}18`, color: LEVEL_COLORS[q.roleLevel] }}>
            {q.roleLevel}
          </span>
        </div>

        {/* Question */}
        <div style={{ background: '#1A1A1F', border: '1px solid #2E2E3A', borderRadius: 14, padding: '24px', marginBottom: 20 }}>
          <p style={{ fontSize: 16, color: '#E8E8F0', lineHeight: 1.7, margin: 0 }}>{q.question}</p>
          {q.codeStarter && (
            <pre style={{ marginTop: 16, padding: '14px 16px', background: '#0D0D0F', borderRadius: 8, fontSize: 13, color: '#A78BFA', fontFamily: 'JetBrains Mono, monospace', overflow: 'auto', border: '1px solid #2E2E3A' }}>
              {q.codeStarter}
            </pre>
          )}
        </div>

        {/* Grading criteria (hint) */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#6060A8', marginBottom: 8 }}>What a great answer includes:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {q.gradingCriteria.map((c, i) => (
              <div key={i} style={{ fontSize: 12, color: '#9090A8', display: 'flex', gap: 8 }}>
                <span style={{ color: '#3A3A45' }}>›</span> {c}
              </div>
            ))}
          </div>
        </div>

        {/* Answer textarea */}
        <textarea
          value={currentAnswer}
          onChange={e => setCurrentAnswer(e.target.value)}
          placeholder={q.type === 'code-challenge' ? 'Write your code solution here...' : 'Type your answer here...'}
          style={{
            width: '100%', minHeight: q.type === 'code-challenge' ? 240 : 160,
            padding: '14px 16px', background: '#1A1A1F', border: '1px solid #2E2E3A',
            borderRadius: 10, color: '#E8E8F0', fontSize: q.type === 'code-challenge' ? 13 : 14,
            fontFamily: q.type === 'code-challenge' ? 'JetBrains Mono, monospace' : 'DM Sans, sans-serif',
            outline: 'none', resize: 'vertical', lineHeight: 1.6, marginBottom: 16,
          }}
          onFocus={e => (e.target.style.borderColor = '#C8FF00')}
          onBlur={e => (e.target.style.borderColor = '#2E2E3A')}
        />

        {error && <div style={{ marginBottom: 12, color: '#FF6B6B', fontSize: 13 }}>{error}</div>}

        <button
          disabled={!currentAnswer.trim() || gradingCurrent}
          onClick={submitAnswer}
          style={{
            width: '100%', padding: '13px', background: currentAnswer.trim() && !gradingCurrent ? '#C8FF00' : '#2A2A32',
            color: currentAnswer.trim() && !gradingCurrent ? '#0D0D0F' : '#6060A8',
            border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: currentAnswer.trim() && !gradingCurrent ? 'pointer' : 'not-allowed',
          }}>
          {gradingCurrent ? 'Grading your answer...' : currentQ < questions.length - 1 ? 'Submit & next question →' : 'Submit & see results →'}
        </button>
      </div>
    )
  }

  // ── Results screen ───────────────────────────────────────────────────────────
  if (examState === 'results' && session) {
    const scoreColor = session.overallScore >= 80 ? '#C8FF00' : session.overallScore >= 60 ? '#60CFFF' : session.overallScore >= 40 ? '#A78BFA' : '#FF6B6B'
    const verdict = session.overallScore >= 80 ? 'Excellent' : session.overallScore >= 60 ? 'Good' : session.overallScore >= 40 ? 'Needs work' : 'Keep studying'

    return (
      <div style={{ padding: '32px 36px', maxWidth: 760, margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>
        {/* Score banner */}
        <div style={{ background: '#1A1A1F', border: `1px solid ${scoreColor}40`, borderRadius: 16, padding: '32px', textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 64, fontWeight: 800, color: scoreColor, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>
            {session.overallScore}
          </div>
          <div style={{ fontSize: 14, color: scoreColor, marginTop: 6, fontWeight: 600 }}>{verdict}</div>
          <div style={{ fontSize: 13, color: '#9090A8', marginTop: 8 }}>{topic?.title}</div>
        </div>

        {/* Per-question breakdown */}
        <h2 style={{ fontSize: 13, color: '#9090A8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
          Question breakdown
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
          {gradedAnswers.map((ga, i) => {
            const q = questions[i]
            const qColor = ga.score >= 80 ? '#C8FF00' : ga.score >= 60 ? '#60CFFF' : ga.score >= 40 ? '#A78BFA' : '#FF6B6B'
            return (
              <div key={ga.questionId} style={{ background: '#1A1A1F', border: '1px solid #2E2E3A', borderRadius: 12, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: `${qColor}18`, border: `1px solid ${qColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: qColor, fontFamily: 'JetBrains Mono, monospace' }}>{ga.score}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: '#E8E8F0', marginBottom: 4, fontWeight: 500 }}>Q{i + 1}: {q.question.substring(0, 100)}{q.question.length > 100 ? '...' : ''}</div>
                    <div style={{ fontSize: 13, color: '#9090A8', lineHeight: 1.5 }}>{ga.feedback}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {ga.strengths.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, color: '#C8FF00', marginBottom: 4 }}>✓ Strengths</div>
                      {ga.strengths.map((s, j) => <div key={j} style={{ fontSize: 12, color: '#9090A8', marginBottom: 2 }}>· {s}</div>)}
                    </div>
                  )}
                  {ga.improvements.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, color: '#FF6B6B', marginBottom: 4 }}>↑ Improve</div>
                      {ga.improvements.map((s, j) => <div key={j} style={{ fontSize: 12, color: '#9090A8', marginBottom: 2 }}>· {s}</div>)}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => { setExamState('select'); setSession(null) }} style={{ flex: 1, padding: '13px', background: '#C8FF00', color: '#0D0D0F', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Take another exam
          </button>
          <button onClick={startExam} style={{ flex: 1, padding: '13px', background: 'transparent', color: '#9090A8', border: '1px solid #2E2E3A', borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>
            Retry this topic
          </button>
        </div>
      </div>
    )
  }

  return null
}

const LEVEL_COLORS: Record<string, string> = { junior: '#A78BFA', mid: '#60CFFF', senior: '#C8FF00' }
const TYPE_COLORS: Record<string, string> = { conceptual: '#60CFFF', 'code-challenge': '#C8FF00', 'system-design': '#FF6B6B' }
const WEIGHT_COLORS: Record<string, string> = { 'very-high': '#FF6B6B', 'high': '#C8FF00', 'medium': '#60CFFF', 'low': '#9090A8' }
