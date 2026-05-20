import { useEffect, useState } from 'react'
import { Play, Pause, RotateCcw, Eye, EyeOff, ArrowRight, Check, X, Languages } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { cancel, speak, isTTSAvailable } from '@/lib/speech'
import { cn } from '@/lib/utils'
import type { ListeningItem, ListeningQuestion } from '@/types/content'

interface Props {
  item: ListeningItem
  onComplete: (r: { correct: number; total: number; timeSec: number }) => void
}

export function ListeningPlayer({ item, onComplete }: Props) {
  const [playing, setPlaying] = useState(false)
  const [rate, setRate] = useState(0.95)
  const [phase, setPhase] = useState<'listening' | 'quiz'>('listening')
  const [showTranscript, setShowTranscript] = useState(false)
  const [showKo, setShowKo] = useState(false)
  const [qIdx, setQIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [fillInput, setFillInput] = useState('')
  const [startedAt] = useState(() => Date.now())

  useEffect(() => () => cancel(), [])

  const handlePlay = () => {
    if (playing) {
      cancel()
      setPlaying(false)
      return
    }
    setPlaying(true)
    void speak(item.transcript_en, {
      rate,
      onEnd: () => setPlaying(false),
      onError: () => setPlaying(false),
    })
  }

  const q = item.questions[qIdx]

  const checkAnswer = (i: number | null, input: string): boolean => {
    if (q.type === 'multiple_choice' || q.type === 'true_false') {
      return i === q.correct_index
    }
    if (q.type === 'fill_blank') {
      const ans = (q.answer ?? '').trim().toLowerCase()
      const alts = (q.alternatives ?? []).map((a) => a.toLowerCase())
      const user = input.trim().toLowerCase()
      return user === ans || alts.includes(user)
    }
    return false
  }

  const onPick = (i: number) => {
    if (revealed) return
    setSelected(i)
    setRevealed(true)
    if (checkAnswer(i, '')) setCorrect((c) => c + 1)
  }

  const onSubmitFill = () => {
    if (revealed) return
    setRevealed(true)
    if (checkAnswer(null, fillInput)) setCorrect((c) => c + 1)
  }

  const onNext = () => {
    if (qIdx + 1 >= item.questions.length) {
      const timeSec = Math.round((Date.now() - startedAt) / 1000)
      cancel()
      onComplete({ correct, total: item.questions.length, timeSec })
      return
    }
    setQIdx((i) => i + 1)
    setSelected(null)
    setRevealed(false)
    setFillInput('')
  }

  if (phase === 'listening') {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">{item.title}</h2>

        {/* Player */}
        <Card className="p-5 bg-gradient-to-br from-sky-50 to-white">
          {!isTTSAvailable() && (
            <p className="text-xs text-rose-600 mb-2">
              이 브라우저는 음성 합성을 지원하지 않아요. 대본을 직접 읽어주세요.
            </p>
          )}
          <div className="flex items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={handlePlay}
              className={cn(
                'w-20 h-20 rounded-full',
                playing ? 'bg-rose-500 hover:bg-rose-400' : 'bg-sky-500 hover:bg-sky-400'
              )}
            >
              {playing ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
            </Button>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-600">
            <span>속도</span>
            {([0.7, 0.85, 1.0] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRate(r)}
                className={cn(
                  'px-2.5 py-1 rounded-full font-semibold',
                  rate === r ? 'bg-sky-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                )}
              >
                {r === 1.0 ? '1.0x' : `${r}x`}
              </button>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={showTranscript ? 'primary' : 'secondary'}
            onClick={() => setShowTranscript((v) => !v)}
            size="sm"
          >
            {showTranscript ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            대본
          </Button>
          <Button
            variant={showKo ? 'primary' : 'secondary'}
            onClick={() => setShowKo((v) => !v)}
            size="sm"
            disabled={!showTranscript}
          >
            <Languages className="h-3.5 w-3.5" />
            번역
          </Button>
        </div>

        {showTranscript && (
          <Card className="p-4 bg-white">
            <p className="text-sm text-slate-800 leading-[1.85] whitespace-pre-wrap">
              {item.transcript_en}
            </p>
            {showKo && (
              <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100 leading-relaxed whitespace-pre-wrap">
                {item.transcript_ko}
              </p>
            )}
          </Card>
        )}

        <Button onClick={() => setPhase('quiz')} className="w-full" size="lg">
          문제 풀기 ({item.questions.length}문항)
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  // Quiz phase
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between text-sm text-slate-600 mb-1.5">
          <span className="flex items-center gap-1.5">
            <Badge tone="sky" className="text-[10px]">
              {q.type}
            </Badge>
          </span>
          <span className="tabular-nums">
            {qIdx + 1} / {item.questions.length}
          </span>
        </div>
        <ProgressBar value={qIdx + (revealed ? 1 : 0)} max={item.questions.length} color="sky" />
      </div>

      <div className="flex justify-end">
        <Button size="sm" variant="secondary" onClick={handlePlay}>
          <RotateCcw className="h-3.5 w-3.5" />
          다시 듣기
        </Button>
      </div>

      <Card className="p-5 bg-white">
        <p className="text-[15px] text-slate-800 leading-relaxed whitespace-pre-wrap">
          {q.question_ko}
        </p>
      </Card>

      <QuizBody
        q={q}
        revealed={revealed}
        selected={selected}
        onPick={onPick}
        fillInput={fillInput}
        setFillInput={setFillInput}
        onSubmitFill={onSubmitFill}
      />

      {revealed && (
        <div className="animate-pop space-y-3">
          <Card className="p-4 bg-sky-50/60 border-sky-200">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-sky-700 mb-1">
              해설
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{q.explanation_ko}</p>
          </Card>
          <Button onClick={onNext} className="w-full" size="lg">
            {qIdx + 1 >= item.questions.length ? '결과 보기' : '다음 문제'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

function QuizBody({
  q,
  revealed,
  selected,
  onPick,
  fillInput,
  setFillInput,
  onSubmitFill,
}: {
  q: ListeningQuestion
  revealed: boolean
  selected: number | null
  onPick: (i: number) => void
  fillInput: string
  setFillInput: (v: string) => void
  onSubmitFill: () => void
}) {
  if (q.type === 'fill_blank') {
    const isCorrect = revealed && fillInput.trim().toLowerCase() === (q.answer ?? '').toLowerCase()
    return (
      <div className="space-y-2">
        <input
          type="text"
          value={fillInput}
          onChange={(e) => setFillInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !revealed && onSubmitFill()}
          disabled={revealed}
          placeholder="답을 영어로 입력"
          className={cn(
            'w-full h-12 rounded-2xl border px-4 text-base font-medium focus:outline-none focus:ring-2',
            revealed && isCorrect && 'border-emerald-300 bg-emerald-50 text-emerald-700',
            revealed && !isCorrect && 'border-rose-300 bg-rose-50 text-rose-700 animate-shake',
            !revealed && 'border-slate-200 focus:ring-sky-300'
          )}
        />
        {!revealed && (
          <Button onClick={onSubmitFill} className="w-full" disabled={!fillInput.trim()}>
            확인
          </Button>
        )}
        {revealed && (
          <Card className="p-3 bg-emerald-50/40 border-emerald-200">
            <div className="text-xs text-slate-500">정답</div>
            <div className="text-base font-bold text-emerald-700">{q.answer}</div>
          </Card>
        )}
      </div>
    )
  }

  if (q.options && q.options.length > 0) {
    return (
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          const isSelected = selected === i
          const isCorrect = i === q.correct_index
          return (
            <button
              key={i}
              onClick={() => onPick(i)}
              disabled={revealed}
              className={cn(
                'w-full text-left rounded-2xl border p-3.5 text-sm font-medium transition-all',
                'flex items-start gap-3',
                !revealed && 'bg-white border-slate-200 hover:bg-slate-50 active:scale-[0.99]',
                revealed && isCorrect && 'bg-emerald-50 border-emerald-300 text-emerald-700',
                revealed && isSelected && !isCorrect && 'bg-rose-50 border-rose-300 text-rose-700 animate-shake',
                revealed && !isSelected && !isCorrect && 'bg-white border-slate-200 text-slate-400'
              )}
            >
              <span
                className={cn(
                  'flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0',
                  revealed && isCorrect && 'bg-emerald-200 text-emerald-700',
                  revealed && isSelected && !isCorrect && 'bg-rose-200 text-rose-700',
                  !revealed && 'bg-slate-100 text-slate-600'
                )}
              >
                {revealed && isCorrect ? (
                  <Check className="h-3.5 w-3.5" />
                ) : revealed && isSelected ? (
                  <X className="h-3.5 w-3.5" />
                ) : (
                  String.fromCharCode(65 + i)
                )}
              </span>
              <span className="flex-1">{opt}</span>
            </button>
          )
        })}
      </div>
    )
  }

  return <p className="text-sm text-slate-500">지원하지 않는 문제 유형이에요.</p>
}
