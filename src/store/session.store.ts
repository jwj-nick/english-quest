import { create } from 'zustand'
import { content, CURRENT_WEEK } from '@/lib/content'
import type { WeekMeta, VocabularyFile } from '@/types/content'

interface SessionState {
  week: string
  weekMeta: WeekMeta | null
  vocab: VocabularyFile | null
  loading: boolean
  error: string | null
  loadWeek: (week?: string) => Promise<void>
}

export const useSessionStore = create<SessionState>((set) => ({
  week: CURRENT_WEEK,
  weekMeta: null,
  vocab: null,
  loading: false,
  error: null,
  loadWeek: async (week = CURRENT_WEEK) => {
    set({ loading: true, error: null })
    try {
      const [meta, vocab] = await Promise.all([content.weekMeta(week), content.vocabulary(week)])
      set({ week, weekMeta: meta, vocab, loading: false })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to load week', loading: false })
    }
  },
}))
