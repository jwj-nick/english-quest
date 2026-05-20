import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-white rounded-3xl border border-slate-200/70 shadow-sm shadow-slate-900/[0.02]',
        className
      )}
      {...rest}
    />
  )
}
