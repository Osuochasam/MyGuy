"use client"

import { useState, useMemo } from 'react'
import { motion, type Variants } from 'framer-motion'
import {
  Sparkles, Brain, Target, Bell, TrendingUp, Plus, ArrowRight,
  Clock, Star, Zap, Archive,
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import { useStore } from '@/lib/store'
import { PageHeader } from '@/components/ui/page-header'
import { MemoryCard } from '@/components/ui/memory-card'
import { AddMemoryDialog } from '@/components/ui/add-memory-dialog'
import { cn } from '@/lib/utils'

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const { memories, goals, reminders } = useStore()
  const [addOpen, setAddOpen] = useState(false)

  const recentMemories = useMemo(() => memories.slice(0, 4), [memories])
  const pinnedMemories = useMemo(() => memories.filter((m) => m.pinned).slice(0, 3), [memories])
  const todayReminders = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    return reminders.filter((r) => !r.completed && r.dueDate.startsWith(today))
  }, [reminders])
  const overdueReminders = useMemo(() => {
    const now = new Date()
    return reminders.filter((r) => !r.completed && new Date(r.dueDate) < now)
  }, [reminders])
  const activeGoals = useMemo(() => goals.filter((g) => g.status === 'active').slice(0, 3), [goals])

  const stats = [
    { label: 'Total Memories', value: memories.length, icon: Brain, color: 'text-violet-400' },
    { label: 'Active Goals', value: activeGoals.length, icon: Target, color: 'text-amber-400' },
    { label: 'Reminders Due', value: todayReminders.length + overdueReminders.length, icon: Bell, color: 'text-pink-400' },
    { label: 'This Week', value: memories.filter((m) => {
        const d = new Date(m.createdAt)
        const now = new Date()
        const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
        return diff <= 7
      }).length, icon: TrendingUp, color: 'text-emerald-400' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div variants={container} initial="hidden" animate="show">
        {/* Greeting */}
        <motion.div variants={item} className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">{format(new Date(), 'EEEE, MMMM d')}</p>
              <h1 className="text-3xl font-semibold text-foreground tracking-tight">
                {getGreeting()}, friend.
              </h1>
              <p className="text-muted-foreground mt-2 text-sm max-w-lg">
                {memories.length === 0
                  ? "Start capturing your memories, goals, and milestones — MyGuy stores them forever on 0G."
                  : `You have ${memories.length} memor${memories.length === 1 ? 'y' : 'ies'} stored${overdueReminders.length > 0 ? ` and ${overdueReminders.length} overdue reminder${overdueReminders.length === 1 ? '' : 's'} to check` : ''}.`
                }
              </p>
            </div>
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              New Memory
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-4 hover:border-border/80 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={cn('w-4 h-4', stat.color)} />
                <Zap className="w-3 h-3 text-muted-foreground/30" />
              </div>
              <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Memories */}
          <motion.div variants={item} className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Recent Memories
              </h2>
              <Link href="/vault" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {recentMemories.length === 0 ? (
              <EmptyState
                icon={Archive}
                title="No memories yet"
                description="Add your first memory to get started."
                action={{ label: 'Add Memory', onClick: () => setAddOpen(true) }}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recentMemories.map((memory) => (
                  <MemoryCard key={memory.id} memory={memory} />
                ))}
              </div>
            )}
          </motion.div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Today's Focus */}
            <motion.div variants={item}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  {"Today's Focus"}
                </h2>
                <Link href="/reminders" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                  All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {todayReminders.length + overdueReminders.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-4 text-center">
                  <p className="text-xs text-muted-foreground">No reminders due today.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {[...overdueReminders, ...todayReminders].slice(0, 5).map((r) => (
                    <ReminderItem key={r.id} reminder={r} />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Active Goals */}
            <motion.div variants={item}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-400" />
                  Active Goals
                </h2>
              </div>
              {activeGoals.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-4 text-center">
                  <p className="text-xs text-muted-foreground">No active goals yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeGoals.map((goal) => (
                    <GoalItem key={goal.id} goal={goal} />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Pinned Memories */}
            {pinnedMemories.length > 0 && (
              <motion.div variants={item}>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    Pinned
                  </h2>
                </div>
                <div className="space-y-2">
                  {pinnedMemories.map((m) => (
                    <MemoryCard key={m.id} memory={m} compact />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      <AddMemoryDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}

function ReminderItem({ reminder }: { reminder: import('@/lib/types').Reminder }) {
  const { toggleReminder } = useStore()
  const isOverdue = new Date(reminder.dueDate) < new Date()

  const priorityColor = {
    low: 'bg-emerald-400/10 text-emerald-400',
    medium: 'bg-amber-400/10 text-amber-400',
    high: 'bg-red-400/10 text-red-400',
  }[reminder.priority]

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-border/80 transition-colors">
      <button
        onClick={() => toggleReminder(reminder.id)}
        className="w-4 h-4 rounded-full border-2 border-border hover:border-primary flex-shrink-0 transition-colors"
      />
      <div className="flex-1 min-w-0">
        <p className={cn('text-xs font-medium truncate', isOverdue && !reminder.completed ? 'text-red-400' : 'text-foreground')}>
          {reminder.title}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {formatDistanceToNow(new Date(reminder.dueDate), { addSuffix: true })}
        </p>
      </div>
      <span className={cn('text-[10px] px-1.5 py-0.5 rounded-md font-medium flex-shrink-0', priorityColor)}>
        {reminder.priority}
      </span>
    </div>
  )
}

function GoalItem({ goal }: { goal: import('@/lib/types').Goal }) {
  return (
    <div className="p-3 rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-foreground truncate flex-1">{goal.title}</p>
        <span className="text-[10px] text-muted-foreground ml-2">{goal.progress}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-muted/60 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${goal.progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' as const }}
          className="h-full rounded-full bg-primary"
        />
      </div>
    </div>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 p-8 text-center">
      <Icon className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-xs text-muted-foreground/70 mt-1">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors border border-primary/20"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
