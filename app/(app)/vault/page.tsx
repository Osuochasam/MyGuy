"use client"

import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Archive, Search, Plus, SlidersHorizontal, X, Upload,
  Image as ImageIcon, Loader2, Grid3X3, List, Tag,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { PageHeader } from '@/components/ui/page-header'
import { MemoryCard } from '@/components/ui/memory-card'
import { AddMemoryDialog } from '@/components/ui/add-memory-dialog'
import { cn } from '@/lib/utils'
import type { MemoryCategory } from '@/lib/types'

const categories: { value: MemoryCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'personal', label: 'Personal' },
  { value: 'career', label: 'Career' },
  { value: 'projects', label: 'Projects' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'goals', label: 'Goals' },
  { value: 'custom', label: 'Custom' },
]

type SortOption = 'newest' | 'oldest' | 'alpha'

export default function VaultPage() {
  const { memories, addImageMemory } = useStore()
  const [addOpen, setAddOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<MemoryCategory | 'all'>('all')
  const [sort, setSort] = useState<SortOption>('newest')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    let result = [...memories]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.content.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    if (category !== 'all') {
      result = result.filter((m) => m.category === category)
    }

    if (sort === 'newest') result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    else if (sort === 'oldest') result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    else if (sort === 'alpha') result.sort((a, b) => a.title.localeCompare(b.title))

    return result
  }, [memories, search, category, sort])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const imageUrl = URL.createObjectURL(file)
      await addImageMemory(
        {
          title: file.name.replace(/\.[^.]+$/, ''),
          content: `Image uploaded: ${file.name}`,
          category: 'personal',
          type: 'image',
          tags: ['photo'],
          imageUrl,
          mimeType: file.type,
          fileSize: file.size,
        },
        file
      )
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    memories.forEach((m) => m.tags.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).slice(0, 12)
  }, [memories])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader title="Memory Vault" description="Your searchable, permanent memory repository.">
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Memory
          </button>
        </div>
      </PageHeader>

      <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleImageUpload} />

      {/* Search & Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search memories, tags, content..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="px-3 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="alpha">A-Z</option>
          </select>

          {/* View toggle */}
          <div className="flex rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={cn('p-2.5 transition-colors', view === 'grid' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground bg-card')}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn('p-2.5 transition-colors', view === 'list' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground bg-card')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              category === cat.value
                ? 'bg-primary/15 border-primary/30 text-primary'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            {cat.label}
            {cat.value !== 'all' && (
              <span className="ml-1.5 text-[10px] text-muted-foreground">
                {memories.filter((m) => m.category === cat.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tag cloud */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6 p-3 rounded-xl border border-border bg-muted/10">
          <span className="text-[10px] font-medium text-muted-foreground self-center mr-1">Quick tags:</span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSearch(tag)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-muted/60 text-muted-foreground border border-border hover:text-foreground hover:border-primary/30 transition-colors"
            >
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-muted-foreground mb-4">
        {filtered.length} {filtered.length === 1 ? 'memory' : 'memories'}{search && ` matching "${search}"`}
      </p>

      {/* Grid/List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Archive className="w-10 h-10 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-sm font-medium text-muted-foreground">
            {search ? `No memories matching "${search}"` : 'The vault is empty'}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            {search ? 'Try a different search term.' : 'Start capturing your first memory.'}
          </p>
          {!search && (
            <button
              onClick={() => setAddOpen(true)}
              className="mt-4 px-4 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors border border-primary/20"
            >
              Add First Memory
            </button>
          )}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`${view}-${category}-${sort}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              view === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'
                : 'flex flex-col gap-2'
            )}
          >
            {filtered.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} compact={view === 'list'} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      <AddMemoryDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
