import type { ReactNode } from 'react'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'

interface Props {
  children: ReactNode
}

export function AppShell({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-5 pb-24 md:pb-8">{children}</main>
      <BottomNav />
    </div>
  )
}
