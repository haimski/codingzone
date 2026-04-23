import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import type { AppState, TopicProgress, ExamSession, StudySession } from '@/types'
import { loadState, saveState, computeReadiness } from '@/lib/storage'

type Action =
  | { type: 'TOGGLE_TOPIC'; topicId: string }
  | { type: 'LOG_HOURS'; topicId: string; hours: number }
  | { type: 'ADD_EXAM'; session: ExamSession }
  | { type: 'ADD_STUDY_SESSION'; session: StudySession; weekStart: string }
  | { type: 'UPDATE_NOTES'; topicId: string; notes: string }
  | { type: 'RECOMPUTE_READINESS' }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'TOGGLE_TOPIC': {
      const prev = state.topicProgress[action.topicId]
      const updated: TopicProgress = {
        ...prev,
        completed: !prev.completed,
        lastTouched: new Date().toISOString(),
      }
      const next = { ...state, topicProgress: { ...state.topicProgress, [action.topicId]: updated } }
      return { ...next, readiness: computeReadiness(next) }
    }
    case 'LOG_HOURS': {
      const prev = state.topicProgress[action.topicId]
      const updated: TopicProgress = {
        ...prev,
        hoursSpent: prev.hoursSpent + action.hours,
        lastTouched: new Date().toISOString(),
      }
      const totalHoursStudied = state.totalHoursStudied + action.hours
      return { ...state, topicProgress: { ...state.topicProgress, [action.topicId]: updated }, totalHoursStudied }
    }
    case 'ADD_EXAM': {
      const { session } = action
      const prev = state.topicProgress[session.topicId]
      const updated: TopicProgress = {
        ...prev,
        examScores: [...prev.examScores, session.overallScore],
        lastTouched: new Date().toISOString(),
      }
      const next = {
        ...state,
        examSessions: [...state.examSessions, session],
        topicProgress: { ...state.topicProgress, [session.topicId]: updated },
      }
      return { ...next, readiness: computeReadiness(next) }
    }
    case 'ADD_STUDY_SESSION': {
      const { session, weekStart } = action
      const existingWeek = state.weekPlans.find(w => w.weekStart === weekStart)
      let weekPlans
      if (existingWeek) {
        weekPlans = state.weekPlans.map(w =>
          w.weekStart === weekStart
            ? { ...w, sessions: [...w.sessions, session] }
            : w
        )
      } else {
        weekPlans = [...state.weekPlans, { weekStart, sessions: [session], targetHours: 30 }]
      }
      return { ...state, weekPlans }
    }
    case 'UPDATE_NOTES': {
      const prev = state.topicProgress[action.topicId]
      return {
        ...state,
        topicProgress: {
          ...state.topicProgress,
          [action.topicId]: { ...prev, notes: action.notes }
        }
      }
    }
    case 'RECOMPUTE_READINESS':
      return { ...state, readiness: computeReadiness(state) }
    default:
      return state
  }
}

interface ContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const Ctx = createContext<ContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => { saveState(state) }, [state])

  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>
}

export function useApp() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
