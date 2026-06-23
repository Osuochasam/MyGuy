export type MemoryCategory = 'personal' | 'career' | 'projects' | 'relationships' | 'goals' | 'custom'

export type MemoryType = 'memory' | 'goal' | 'milestone' | 'reminder' | 'image'

export interface BaseMemory {
  id: string
  rootHash?: string // From 0G storage
  title: string
  content: string
  tags: string[]
  category: MemoryCategory
  type: MemoryType
  createdAt: string
  updatedAt: string
  pinned?: boolean
}

export interface ImageMemory extends BaseMemory {
  type: 'image'
  imageUrl: string
  thumbnailUrl?: string
  mimeType: string
  fileSize?: number
}

export interface Goal {
  id: string
  rootHash?: string
  title: string
  description?: string
  status: 'active' | 'completed' | 'archived'
  targetDate?: string
  progress: number
  category: MemoryCategory
  createdAt: string
  updatedAt: string
}

export interface Reminder {
  id: string
  rootHash?: string
  title: string
  description?: string
  dueDate: string
  completed: boolean
  completedAt?: string
  priority: 'low' | 'medium' | 'high'
  category: MemoryCategory
  createdAt: string
  updatedAt: string
}

export type TimelineItem = 
  | (BaseMemory & { itemType: 'memory' })
  | (ImageMemory & { itemType: 'image' })
  | (Goal & { itemType: 'goal' })
  | (Reminder & { itemType: 'reminder' })

export interface MemoryMetadata {
  title: string
  tags: string[]
  category: MemoryCategory
  type: MemoryType
}

export interface ImageMetadata extends MemoryMetadata {
  mimeType: string
  fileSize: number
  fileName: string
}

export interface ZGUploadResult {
  rootHash: string
  txHash?: string
  success: boolean
  error?: string
}

export interface ZGDownloadResult {
  content: string | ArrayBuffer
  metadata?: Record<string, unknown>
  success: boolean
  error?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  memoryRefs?: string[] // IDs of referenced memories
}

export interface NavItem {
  label: string
  href: string
  icon: string
}

export interface MemoryInsight {
  label: string
  value: number | string
  change?: number
  trend?: 'up' | 'down' | 'stable'
}
