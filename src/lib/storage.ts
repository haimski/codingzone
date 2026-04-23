import type { AppState, TopicProgress, ExamSession, WeekPlan, ReadinessScore } from '@/types'
import { CURRICULUM } from './curriculum'

const KEY = 'devtracker_state'

export function getDefaultState(): AppState {
  const topicProgress: Record<string, TopicProgress> = {}
  CURRICULUM.forEach(t => {
    topicProgress[t.id] = {
      topicId: t.id,
      completed: false,
      hoursSpent: 0,
      lastTouched: '',
      examScores: [],
      notes: '',
    }
  })
  return {
    topicProgress,
    examSessions: [],
    weekPlans: [],
    readiness: null,
    currentPhase: 0,
    streakDays: 0,
    totalHoursStudied: 0,
    lastActive: new Date().toISOString(),
  }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return getDefaultState()
    const stored = JSON.parse(raw) as Partial<AppState>
    const defaults = getDefaultState()
    // merge so new topics added to curriculum always appear
    return {
      ...defaults,
      ...stored,
      topicProgress: { ...defaults.topicProgress, ...stored.topicProgress },
    }
  } catch {
    return getDefaultState()
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save state', e)
  }
}

// ─── Readiness Score Calculator ──────────────────────────────────────────────

export function computeReadiness(state: AppState): ReadinessScore {
  const { topicProgress } = state
  const topics = CURRICULUM

  const phaseScores: Record<number, number[]> = { 0: [], 1: [], 2: [] }
  const sectionScores: Record<string, number[]> = {}
  const weaknesses: { section: string; score: number }[] = []
  const strengths: { section: string; score: number }[] = []

  topics.forEach(topic => {
    const prog = topicProgress[topic.id]
    if (!prog) return

    // score = weighted average of exam scores, or 0 if none
    // completed with no exams = 50 (assumed baseline)
    let score = 0
    if (prog.examScores.length > 0) {
      // recency-weighted: more recent scores count more
      const weighted = prog.examScores.reduce((acc, s, i) => {
        const weight = i + 1
        return { sum: acc.sum + s * weight, total: acc.total + weight }
      }, { sum: 0, total: 0 })
      score = weighted.sum / weighted.total
    } else if (prog.completed) {
      score = 50
    }

    // interview weight multiplier
    const mult = { 'very-high': 2, 'high': 1.5, 'medium': 1, 'low': 0.5 }[topic.interviewWeight]
    const weighted = score * mult

    phaseScores[topic.phase].push(weighted)
    if (!sectionScores[topic.section]) sectionScores[topic.section] = []
    sectionScores[topic.section].push(score)
  })

  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0

  const byPhase = {
    0: avg(phaseScores[0]),
    1: avg(phaseScores[1]),
    2: avg(phaseScores[2]),
  }

  const bySection: Record<string, number> = {}
  Object.entries(sectionScores).forEach(([s, scores]) => {
    bySection[s] = avg(scores)
  })

  // Overall: phase 0 = 15%, phase 1 = 55%, phase 2 = 30%
  const overall = byPhase[0] * 0.15 + byPhase[1] * 0.55 + byPhase[2] * 0.30

  // Verdict thresholds
  let verdict: 'not-yet' | 'junior' | 'mid' | 'senior' = 'not-yet'
  let verdictLabel = 'Keep studying — not ready yet'
  if (overall >= 85) { verdict = 'senior';  verdictLabel = 'Senior-ready — apply confidently' }
  else if (overall >= 70) { verdict = 'mid'; verdictLabel = 'Mid-level ready — strong candidate' }
  else if (overall >= 50) { verdict = 'junior'; verdictLabel = 'Junior-ready — start applying' }

  // Find top weaknesses and strengths
  const sectionList = Object.entries(bySection).sort((a, b) => a[1] - b[1])
  const topWeaknesses = sectionList.slice(0, 3).map(([s]) => s)
  const topStrengths = sectionList.slice(-3).reverse().map(([s]) => s)

  return { overall, byPhase, bySection, verdict, verdictLabel, topWeaknesses, topStrengths, computedAt: new Date().toISOString() }
}
