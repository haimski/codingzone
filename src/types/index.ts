// ─── Curriculum ──────────────────────────────────────────────────────────────

export type Phase = 0 | 1 | 2

export interface Topic {
  id: string
  title: string
  phase: Phase
  section: string
  interviewWeight: 'very-high' | 'high' | 'medium' | 'low'
  estimatedHours: number
}

export interface TopicProgress {
  topicId: string
  completed: boolean
  hoursSpent: number
  lastTouched: string // ISO date
  examScores: number[] // 0-100, history of scores
  notes: string
}

// ─── Exams ───────────────────────────────────────────────────────────────────

export type QuestionType = 'conceptual' | 'code-challenge' | 'system-design'
export type RoleLevel = 'junior' | 'mid' | 'senior'

export interface ExamQuestion {
  id: string
  type: QuestionType
  question: string
  codeStarter?: string       // for code challenges
  gradingCriteria: string[]  // what the AI checks for
  difficulty: 1 | 2 | 3     // 1=easy 2=medium 3=hard
  roleLevel: RoleLevel
}

export interface ExamSession {
  id: string
  topicId: string
  startedAt: string
  completedAt?: string
  questions: ExamQuestion[]
  answers: ExamAnswer[]
  overallScore: number  // 0-100
  feedback: string
}

export interface ExamAnswer {
  questionId: string
  answer: string
  score: number       // 0-100
  feedback: string
  strengths: string[]
  improvements: string[]
}

// ─── Readiness ───────────────────────────────────────────────────────────────

export interface ReadinessScore {
  overall: number           // 0-100
  byPhase: Record<Phase, number>
  bySection: Record<string, number>
  verdict: RoleLevel | 'not-yet'
  verdictLabel: string
  topWeaknesses: string[]
  topStrengths: string[]
  computedAt: string
}

// ─── Schedule ────────────────────────────────────────────────────────────────

export interface StudySession {
  id: string
  date: string        // YYYY-MM-DD
  topicId: string
  hoursPlanned: number
  hoursActual: number
  completed: boolean
  notes: string
}

export interface WeekPlan {
  weekStart: string   // YYYY-MM-DD monday
  sessions: StudySession[]
  targetHours: number
}

// ─── App State ───────────────────────────────────────────────────────────────

export interface AppState {
  topicProgress: Record<string, TopicProgress>
  examSessions: ExamSession[]
  weekPlans: WeekPlan[]
  readiness: ReadinessScore | null
  currentPhase: Phase
  streakDays: number
  totalHoursStudied: number
  lastActive: string
}
