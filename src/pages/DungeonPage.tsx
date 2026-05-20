import { useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { VocabHub } from '@/features/vocabulary/VocabHub'
import { useSessionStore } from '@/store/session.store'
import { DUNGEONS } from '@/lib/dungeons'

export function DungeonPage() {
  const { area } = useParams<{ area: string }>()
  const dungeon = DUNGEONS.find((d) => d.key === area)
  const { vocab, weekMeta, loading, error, loadWeek, week } = useSessionStore()

  useEffect(() => {
    if (!vocab) void loadWeek()
  }, [vocab, loadWeek])

  if (!dungeon) return <Navigate to="/" replace />
  if (!dungeon.enabled) {
    return (
      <div className="space-y-4">
        <header>
          <div className={`text-xs font-semibold uppercase tracking-wider ${dungeon.accent}`}>
            {dungeon.title}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">아직 잠겨있어요</h1>
        </header>
        <Card className="p-6 text-center bg-slate-50">
          <div className="text-5xl mb-2">{dungeon.emoji}</div>
          <p className="text-sm text-slate-600">곧 열릴 던전이에요. 조금만 기다려줘요!</p>
        </Card>
      </div>
    )
  }

  if (loading) {
    return <p className="text-center text-sm text-slate-500 py-8">던전 입장 중...</p>
  }
  if (error) {
    return (
      <Card className="p-4 border-rose-200 bg-rose-50">
        <p className="text-sm text-rose-700">{error}</p>
      </Card>
    )
  }
  if (!vocab) {
    return <p className="text-center text-sm text-slate-500 py-8">콘텐츠 준비 중...</p>
  }

  // V1: vocabulary dungeon만 실 동작
  if (area === 'vocabulary') {
    const xpWeight = weekMeta?.xp_weights[area] ?? 10
    return <VocabHub items={vocab.items} theme={vocab.theme} xpWeight={xpWeight} />
  }

  return <Navigate to="/" replace />
}
