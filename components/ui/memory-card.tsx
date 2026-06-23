"use client"

import { motion } from 'framer-motion'
import { Pin, Trash2, Tag, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { BaseMemory } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useStore } from '@/lib/store'

const categoryColors: Record<string, string> = {
  personal: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  career: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  projects: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  relationships: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
  goals: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
  custom: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
}

interface MemoryCardProps {
  memory: BaseMemory
  compact?: boolean
}

export function MemoryCard({ memory, compact = false }: MemoryCardProps) {
  const { deleteMemory, pinMemory } = useStore()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors',
        memory.pinned && 'border-primary/20 bg-primary/5'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border flex-shrink-0',
            categoryColors[memory.category]
          )}>
            {memory.category}
          </span>
          {memory.pinned && <Pin className="w-3 h-3 text-primary flex-shrink-0" />}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => pinMemory(memory.id)}
            className="p-1 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => deleteMemory(memory.id)}
            className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-foreground mb-1 line-clamp-1">{memory.title}</h3>

      {/* Content preview */}
      {!compact && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
          {memory.content}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 flex-wrap">
          {memory.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] bg-muted/60 text-muted-foreground border border-border"
            >
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
          {formatDistanceToNow(new Date(memory.createdAt), { addSuffix: true })}
        </span>
      </div>

      {/* 0G Hash badge */}
      {memory.rootHash && (
        <div className="mt-2 flex items-center gap-1">
          <span className="text-[9px] text-muted-foreground/60 font-mono truncate">
            0G: {memory.rootHash.slice(0, 10)}…
          </span>
          <ExternalLink className="w-2.5 h-2.5 text-muted-foreground/40 flex-shrink-0" />
        </div>
      )}
    </motion.div>
  )
}
