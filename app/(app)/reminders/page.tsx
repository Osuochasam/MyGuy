"use client"

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, Plus, Check, Trash2, Calendar, X, AlertCircle,
  Clock, CheckCircle2, Timer,
} from 'lucide-react'
import { format, formatDistanceToNow, isToday, isTomorrow, isThisWeek } from 'date-fns'
import { useStore } from '@/lib/store'
import { PageHeader } from '@/components/ui/page-header'
import { cn } from '@/lib/utils'
import type { Reminder, MemoryCategory } from '@/lib/types'

type ReminderGroup = 'overdue' | 'today' | 'week' | 'upcoming' | 'completed'

const priorityConfig = {
  low: { label: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  medium: { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  high: { label: 'High', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
}

interface AddReminderForm {
  title: string
  description: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
  category: MemoryCategory
}

export default function RemindersPage() {
  const { reminders, addReminder, toggleReminder, deleteReminder } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [activeGroup, setActiveGroup] = useState<ReminderGroup | 'all'>('all')
  const [form, setForm] = useState<AddReminderForm>({
    title: '',
    description: '',
    dueDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    priority: 'medium',
    category: 'personal',
  })

  const now = new Date()

  const grouped = useMemo(() => {
    const overdue: Reminder[] = []
    const today: Reminder[] = []
    const week: Reminder[] = []
    const upcoming: Reminder[] = []
    const completed: Reminder[] = []

    reminders.forEach((r) => {
      if (r.completed) { completed.push(r); return }
      const d = new Date(r.dueDate)
      if (d < now) overdue.push(r)
      else if (isToday(d)) today.push(r)
      else if (isThisWeek(d)) week.push(r)
      else upcoming.push(r)
    })

    return { overdue, today, week, upcoming, completed }
  }, [reminders])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    addReminder({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      dueDate: new Date(form.dueDate).toISOString(),
      priority: form.priority,
      category: form.category,
      completed: false,
    })
    setForm({ title: '', description: '', dueDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"), priority: 'medium', category: 'personal' })
    setShowForm(false)
  }

  const groupDefs: { key: ReminderGroup; label: string; icon: React.ElementType; color: string }[] = [
    { key: 'overdue', label: 'Overdue', icon: AlertCircle, color: 'text-red-400' },
    { key: 'today', label: 'Today', icon: Bell, color: 'text-violet-400' },
    { key: 'week', label: 'This Week', icon: Timer, color: 'text-blue-400' },
    { key: 'upcoming', label: 'Upcoming', icon: Calendar, color: 'text-emerald-400' },
    { key: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-muted-foreground' },
  ]

  const visibleGroups = activeGroup === 'all' ? groupDefs : groupDefs.filter((g) => g.key === activeGroup)

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <PageHeader title="Reminders" description="Stay on top of what matters.">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Reminder
        </button>
      </PageHeader>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleSubmit}
            className="mb-6 overflow-hidden"
          >
            <div className="rounded-xl border border-primary/20 bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">New Reminder</h3>
                <button type="button" onClick={() => setShowForm(false)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="What do you need to remember?"
                className="w-full px-3 py-2.5 rounded-lg bg-muted/40 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Additional details... (optional)"
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg bg-muted/40 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Due Date</label>
                  <input
                    type="datetime-local"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-muted/40 border border-border text-xs text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Priority</label>
                  <div className="flex gap-1.5">
                    {(['low', 'medium', 'high'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setForm({ ...form, priority: p })}
                        className={cn(
                          'flex-1 py-2 rounded-lg text-xs font-medium border transition-colors capitalize',
                          form.priority === p
                            ? `${priorityConfig[p].bg} ${priorityConfig[p].border} ${priorityConfig[p].color}`
                            : 'border-border text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!form.title.trim()}
                  className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  Save Reminder
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Group tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveGroup('all')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
            activeGroup === 'all'
              ? 'bg-primary/15 border-primary/30 text-primary'
              : 'border-border text-muted-foreground hover:text-foreground'
          )}
        >
          All <span className="ml-1 text-[10px]">{reminders.length}</span>
        </button>
        {groupDefs.map((g) => {
          const count = grouped[g.key].length
          if (count === 0 && g.key !== 'today') return null
          return (
            <button
              key={g.key}
              onClick={() => setActiveGroup(g.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                activeGroup === g.key
                  ? 'bg-primary/15 border-primary/30 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground',
                g.key === 'overdue' && count > 0 && activeGroup !== 'overdue' && 'border-red-400/30 text-red-400/70'
              )}
            >
              <g.icon className={cn('w-3 h-3', activeGroup === g.key ? 'text-primary' : g.color)} />
              {g.label}
              <span className="text-[10px]">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Reminder groups */}
      {reminders.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-10 h-10 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-sm font-medium text-muted-foreground">No reminders yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Create a reminder to stay on track.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 px-4 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors border border-primary/20"
          >
            Add Reminder
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {visibleGroups.map(({ key, label, icon: Icon, color }) => {
            const items = grouped[key]
            if (items.length === 0) return null
            return (
              <div key={key}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={cn('w-4 h-4', color)} />
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</h2>
                  <span className="text-xs text-muted-foreground">({items.length})</span>
                </div>
                <div className="space-y-2">
                  <AnimatePresence>
                    {items.map((reminder) => (
                      <ReminderRow
                        key={reminder.id}
                        reminder={reminder}
                        onToggle={() => toggleReminder(reminder.id)}
                        onDelete={() => deleteReminder(reminder.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ReminderRow({
  reminder,
  onToggle,
  onDelete,
}: {
  reminder: Reminder
  onToggle: () => void
  onDelete: () => void
}) {
  const priority = priorityConfig[reminder.priority]
  const isOverdue = !reminder.completed && new Date(reminder.dueDate) < new Date()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group flex items-center gap-3 p-3.5 rounded-xl border bg-card transition-colors',
        reminder.completed
          ? 'opacity-50 border-border'
          : isOverdue
            ? 'border-red-400/20 hover:border-red-400/30'
            : 'border-border hover:border-primary/20'
      )}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
          reminder.completed
            ? 'bg-primary/20 border-primary text-primary'
            : isOverdue
              ? 'border-red-400/60 hover:border-red-400'
              : 'border-border hover:border-primary'
        )}
      >
        {reminder.completed && <Check className="w-3 h-3" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium',
          reminder.completed ? 'line-through text-muted-foreground' : isOverdue ? 'text-red-400' : 'text-foreground'
        )}>
          {reminder.title}
        </p>
        {reminder.description && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{reminder.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <Clock className="w-3 h-3 text-muted-foreground/50" />
          <span className={cn('text-[10px]', isOverdue && !reminder.completed ? 'text-red-400/80' : 'text-muted-foreground')}>
            {reminder.completed
              ? `Completed ${reminder.completedAt ? formatDistanceToNow(new Date(reminder.completedAt), { addSuffix: true }) : ''}`
              : isOverdue
                ? `Overdue — was due ${formatDistanceToNow(new Date(reminder.dueDate), { addSuffix: true })}`
                : isToday(new Date(reminder.dueDate))
                  ? `Today at ${format(new Date(reminder.dueDate), 'h:mm a')}`
                  : isTomorrow(new Date(reminder.dueDate))
                    ? `Tomorrow at ${format(new Date(reminder.dueDate), 'h:mm a')}`
                    : format(new Date(reminder.dueDate), 'MMM d, h:mm a')}
          </span>
        </div>
      </div>

      {/* Priority badge */}
      <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-md border flex-shrink-0 capitalize', priority.bg, priority.border, priority.color)}>
        {priority.label}
      </span>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}
