"use client"

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Clock, Plus, Brain, Target, Bell, Image as ImageIcon,
  Star, ChevronDown, Tag, ExternalLink, Filter,
} from 'lucide-react'
import { format, formatDistanceToNow, isToday, isThisWeek, isThisMonth } from 'date-fns'
import { useStore } from '@/lib/store'
import { PageHeader } from '@/components/ui/page-header'
import { AddMemoryDialog } from '@/components/ui/add-memory-dialog'
import { cn } from '@/lib/utils'
import type { BaseMemory, Goal, Reminder } from '@/lib/types'

type FilterPeriod = 'all' | 'today' | 'week' | 'month'

const typeConfig = {
  memory: { icon: Brain, color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/20', label: 'Memory' },
  goal: { icon: Target, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', label: 'Goal' },
  milestone: { icon: Star, color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/20', label: 'Milestone' },
  reminder: { icon: Bell, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', label: 'Reminder' },
  image: { icon: ImageIcon, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', label: 'Image' },
}

interface TimelineEvent {
  id: string
  title: string
  content?: string
  type: keyof typeof typeConfig
  tags: string[]
  category: string
  createdAt: string
  rootHash?: string
  extra?: Record<string, unknown>
}

export default function TimelinePage() {
  const { memories, goals, reminders } = useStore()
  const [addOpen, setAddOpen] = useState(false)
  const [period, setPeriod] = useState<FilterPeriod>('all')
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set())

  const events: TimelineEvent[] = useMemo(() => {
    const memoryEvents: TimelineEvent[] = memories.map((m) => ({
      id: m.id,
      title: m.title,
      content: m.content,
      type: m.type as keyof typeof typeConfig,
      tags: m.tags,
      category: m.category,
      createdAt: m.createdAt,
      rootHash: m.rootHash,
    }))

    const goalEvents: TimelineEvent[] = goals.map((g) => ({
      id: g.id,
      title: g.title,
      content: g.description,
      type: 'goal' as const,
      tags: [],
      category: g.category,
      createdAt: g.createdAt,
      rootHash: g.rootHash,
      extra: { progress: g.progress, status: g.status },
    }))

    const reminderEvents: TimelineEvent[] = reminders.map((r) => ({
      id: r.id,
      title: r.title,
      content: r.description,
      type: 'reminder' as const,
      tags: [],
      category: r.category,
      createdAt: r.createdAt,
      rootHash: r.rootHash,
      extra: { completed: r.completed, dueDate: r.dueDate, priority: r.priority },
    }))

    return [...memoryEvents, ...goalEvents, ...reminderEvents].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [memories, goals, reminders])

  const filtered = useMemo(() => {
    let result = events
    if (period === 'today') result = result.filter((e) => isToday(new Date(e.createdAt)))
    else if (period === 'week') result = result.filter((e) => isThisWeek(new Date(e.createdAt)))
    else if (period === 'month') result = result.filter((e) => isThisMonth(new Date(e.createdAt)))

    if (selectedTypes.size > 0) {
      result = result.filter((e) => selectedTypes.has(e.type))
    }
    return result
  }, [events, period, selectedTypes])

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {}
    filtered.forEach((e) => {
      const key = format(new Date(e.createdAt), 'yyyy-MM-dd')
      if (!groups[key]) groups[key] = []
      groups[key].push(e)
    })
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
  }, [filtered])

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title="Timeline"
        description="Your life story, chronologically."
      >
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {(['all', 'today', 'week', 'month'] as FilterPeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize',
              period === p
                ? 'bg-primary/15 border-primary/30 text-primary'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-border/80'
            )}
          >
            {p === 'all' ? 'All Time' : p === 'today' ? 'Today' : p === 'week' ? 'This Week' : 'This Month'}
          </button>
        ))}
        <div className="w-px h-4 bg-border mx-1" />
        {Object.entries(typeConfig).map(([type, config]) => (
          <button
            key={type}
            onClick={() => toggleType(type)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              selectedTypes.has(type)
                ? `${config.bg} ${config.border} ${config.color}`
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            <config.icon className="w-3 h-3" />
            {config.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {grouped.length === 0 ? (
        <div className="text-center py-20">
          <Clock className="w-10 h-10 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-sm font-medium text-muted-foreground">No events yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Start adding memories to build your timeline.</p>
          <button
            onClick={() => setAddOpen(true)}
            className="mt-4 px-4 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors border border-primary/20"
          >
            Add First Memory
          </button>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />

          <div className="space-y-8">
            {grouped.map(([date, events], groupIdx) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: groupIdx * 0.05, duration: 0.35 }}
              >
                {/* Date label */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center flex-shrink-0 z-10 relative">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {isToday(new Date(date)) ? 'Today' : isThisWeek(new Date(date)) ? format(new Date(date), 'EEEE') : format(new Date(date), 'MMMM d, yyyy')}
                    </p>
                    <p className="text-xs text-muted-foreground">{events.length} event{events.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                {/* Events */}
                <div className="ml-14 space-y-3">
                  {events.map((event, idx) => (
                    <TimelineEventCard key={event.id} event={event} index={idx} />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <AddMemoryDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}

function TimelineEventCard({ event, index }: { event: TimelineEvent; index: number }) {
  const config = typeConfig[event.type] || typeConfig.memory
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="group rounded-xl border border-border bg-card p-4 hover:border-primary/20 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', config.bg, config.border, 'border')}>
          <config.icon className={cn('w-3.5 h-3.5', config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-md border', config.bg, config.border, config.color)}>
                  {config.label}
                </span>
                <span className="text-[10px] text-muted-foreground capitalize">{event.category}</span>
              </div>
              <h3 className="text-sm font-semibold text-foreground">{event.title}</h3>
            </div>
            <span className="text-[10px] text-muted-foreground flex-shrink-0 whitespace-nowrap">
              {format(new Date(event.createdAt), 'h:mm a')}
            </span>
          </div>

          {event.content && (
            <div>
              <p className={cn('text-xs text-muted-foreground leading-relaxed mt-1.5', !expanded && 'line-clamp-2')}>
                {event.content}
              </p>
              {event.content.length > 120 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-0.5 text-[10px] text-primary/80 hover:text-primary mt-1 transition-colors"
                >
                  {expanded ? 'Show less' : 'Show more'}
                  <ChevronDown className={cn('w-3 h-3 transition-transform', expanded && 'rotate-180')} />
                </button>
              )}
            </div>
          )}

          {/* Goal progress */}
          {event.extra?.progress !== undefined && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{String(event.extra.progress)}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted/60">
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{ width: `${event.extra.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Tags */}
          {event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {event.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] bg-muted/60 text-muted-foreground border border-border">
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 0G hash */}
          {event.rootHash && (
            <div className="mt-2 flex items-center gap-1">
              <span className="text-[9px] text-muted-foreground/50 font-mono">
                0G: {event.rootHash.slice(0, 12)}…
              </span>
              <ExternalLink className="w-2.5 h-2.5 text-muted-foreground/30" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
