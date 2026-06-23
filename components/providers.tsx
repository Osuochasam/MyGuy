"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import { SEED_MEMORIES, SEED_GOALS, SEED_REMINDERS } from '@/lib/seed'

function SeedProvider({ children }: { children: React.ReactNode }) {
  const { memories, goals, reminders } = useStore()

  useEffect(() => {
    // Seed with sample data on first load
    if (memories.length === 0 && goals.length === 0 && reminders.length === 0) {
      useStore.setState({
        memories: SEED_MEMORIES,
        goals: SEED_GOALS,
        reminders: SEED_REMINDERS,
      })
    }
  }, [])

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000, retry: 1 },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <SeedProvider>
        {children}
      </SeedProvider>
    </QueryClientProvider>
  )
}
