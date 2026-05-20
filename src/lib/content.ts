import type {
  WeekMeta,
  VocabularyFile,
  ListeningFile,
  ReadingFile,
  BossBattle,
} from '@/types/content'

/**
 * 콘텐츠 로더 — `public/content/{week}/` 의 JSON 파일을 fetch.
 * 빌드 시 base path가 prepend됨 (Vite import.meta.env.BASE_URL).
 */

function contentUrl(week: string, file: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${base}/content/${week}/${file}`
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Content fetch failed: ${url} (${res.status})`)
  return res.json() as Promise<T>
}

export const content = {
  weekMeta: (week: string) => fetchJson<WeekMeta>(contentUrl(week, 'week-meta.json')),
  vocabulary: (week: string) => fetchJson<VocabularyFile>(contentUrl(week, 'vocabulary.json')),
  listening: (week: string) => fetchJson<ListeningFile>(contentUrl(week, 'listening.json')),
  reading: (week: string) => fetchJson<ReadingFile>(contentUrl(week, 'reading.json')),
  bossBattle: (week: string) => fetchJson<BossBattle>(contentUrl(week, 'boss-battle.json')),
}

/** 현재 주차 — V1은 고정. 추후 캘린더 기반 자동 계산 */
export const CURRENT_WEEK = '2026-W30'
