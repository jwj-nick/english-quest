import type { DungeonInfo } from '@/types/game'

/**
 * 5개 영역 = 5개 던전. 모두 V1 동작. 각 던전 시각·문구를 한곳에 모음.
 */
export const DUNGEONS: readonly DungeonInfo[] = [
  {
    key: 'vocabulary',
    title: '어휘의 숲',
    subtitle: '카드 매칭 · 빈칸',
    emoji: '🌳',
    accent: 'text-emerald-700',
    bg: 'from-emerald-100 to-emerald-50',
    ring: 'ring-emerald-200',
    enabled: true,
  },
  {
    key: 'listening',
    title: '메아리 동굴',
    subtitle: '받아쓰기 · 듣기',
    emoji: '🎧',
    accent: 'text-sky-700',
    bg: 'from-sky-100 to-sky-50',
    ring: 'ring-sky-200',
    enabled: true,
  },
  {
    key: 'reading',
    title: '책의 도서관',
    subtitle: '지문 · 빈칸 · 추론',
    emoji: '📖',
    accent: 'text-amber-700',
    bg: 'from-amber-100 to-amber-50',
    ring: 'ring-amber-200',
    enabled: true,
  },
  {
    key: 'speaking_qa',
    title: '말의 무대',
    subtitle: '따라 읽기 · Q&A · 상황극',
    emoji: '🎤',
    accent: 'text-rose-700',
    bg: 'from-rose-100 to-rose-50',
    ring: 'ring-rose-200',
    enabled: true,
  },
  {
    key: 'writing',
    title: '글의 탑',
    subtitle: '영작 · 모범답안 비교',
    emoji: '✍️',
    accent: 'text-violet-700',
    bg: 'from-violet-100 to-violet-50',
    ring: 'ring-violet-200',
    enabled: true,
  },
] as const
