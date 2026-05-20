import { create } from 'zustand'
import { storage } from '@/lib/storage'
import type { SessionLog, UserProfile } from '@/types/game'
import type { AreaKey } from '@/types/content'
import { levelFromXp } from '@/lib/level'
import { isoNow, todayKey } from '@/lib/utils'
import { nanoid } from 'nanoid'

const DEFAULT_PROFILE: UserProfile = {
  name: '모험가',
  avatar: '🧙',
  classChoice: 'mage',
  themeAccent: 'violet',
  createdAt: isoNow(),
}

interface GameState {
  profile: UserProfile
  sessions: SessionLog[]
  loaded: boolean
  // computed
  totalXp: () => number
  level: () => { level: number; intoLevel: number; needForNext: number }
  xpByArea: () => Record<AreaKey, number>
  streakDays: () => number
  // actions
  load: () => Promise<void>
  setProfile: (patch: Partial<UserProfile>) => Promise<void>
  recordSession: (s: Omit<SessionLog, 'id' | 'startedAt'>) => Promise<SessionLog>
  resetAll: () => Promise<void>
}

export const useGameStore = create<GameState>((set, get) => ({
  profile: DEFAULT_PROFILE,
  sessions: [],
  loaded: false,

  totalXp: () => get().sessions.reduce((sum, s) => sum + s.xpEarned, 0),
  level: () => levelFromXp(get().totalXp()),
  xpByArea: () => {
    const out: Record<string, number> = {}
    for (const s of get().sessions) {
      out[s.area] = (out[s.area] ?? 0) + s.xpEarned
    }
    return out as Record<AreaKey, number>
  },
  streakDays: () => {
    const dates = new Set(get().sessions.map((s) => s.startedAt.slice(0, 10)))
    let streak = 0
    let cursor = todayKey()
    while (dates.has(cursor)) {
      streak++
      const d = new Date(cursor)
      d.setDate(d.getDate() - 1)
      cursor = d.toISOString().slice(0, 10)
    }
    return streak
  },

  load: async () => {
    const [profile, sessions] = await Promise.all([
      storage.getKv<UserProfile>('profile'),
      storage.getAllSessions(),
    ])
    set({
      profile: profile ?? DEFAULT_PROFILE,
      sessions: sessions.sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
      loaded: true,
    })
  },

  setProfile: async (patch) => {
    const next = { ...get().profile, ...patch }
    await storage.setKv('profile', next)
    set({ profile: next })
  },

  recordSession: async (s) => {
    const full: SessionLog = {
      ...s,
      id: nanoid(10),
      startedAt: isoNow(),
    }
    await storage.addSession(full)
    set({ sessions: [full, ...get().sessions] })
    return full
  },

  resetAll: async () => {
    await storage.clearAll()
    set({ profile: DEFAULT_PROFILE, sessions: [] })
  },
}))
