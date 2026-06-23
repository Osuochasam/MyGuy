"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BaseMemory, ImageMemory, Goal, Reminder, ChatMessage } from './types'
import { uploadMemory, uploadImageMemory } from './0g/client'

interface MemoryState {
  memories: BaseMemory[]
  goals: Goal[]
  reminders: Reminder[]
  chatMessages: ChatMessage[]
  sidebarCollapsed: boolean
  zgConnected: boolean
  zgPrivateKey: string

  // Actions
  addMemory: (memory: Omit<BaseMemory, 'id' | 'createdAt' | 'updatedAt'>) => Promise<BaseMemory>
  updateMemory: (id: string, updates: Partial<BaseMemory>) => void
  deleteMemory: (id: string) => void
  pinMemory: (id: string) => void

  addImageMemory: (memory: Omit<ImageMemory, 'id' | 'createdAt' | 'updatedAt'>, file: File) => Promise<ImageMemory>

  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateGoal: (id: string, updates: Partial<Goal>) => void
  deleteGoal: (id: string) => void

  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateReminder: (id: string, updates: Partial<Reminder>) => void
  deleteReminder: (id: string) => void
  toggleReminder: (id: string) => void

  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  clearChat: () => void

  setSidebarCollapsed: (v: boolean) => void
  setZGCredentials: (key: string) => void
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const now = () => new Date().toISOString()

export const useStore = create<MemoryState>()(
  persist(
    (set, get) => ({
      memories: [],
      goals: [],
      reminders: [],
      chatMessages: [],
      sidebarCollapsed: false,
      zgConnected: false,
      zgPrivateKey: '',

      addMemory: async (memoryData) => {
        const memory: BaseMemory = {
          ...memoryData,
          id: generateId(),
          createdAt: now(),
          updatedAt: now(),
        }

        // Upload to 0G storage
        const result = await uploadMemory(memory.content, {
          title: memory.title,
          tags: memory.tags,
          category: memory.category,
          type: memory.type,
        }, get().zgPrivateKey || undefined)

        if (result.success) {
          memory.rootHash = result.rootHash
        }

        set((state) => ({ memories: [memory, ...state.memories] }))
        return memory
      },

      updateMemory: (id, updates) => {
        set((state) => ({
          memories: state.memories.map((m) =>
            m.id === id ? { ...m, ...updates, updatedAt: now() } : m
          ),
        }))
      },

      deleteMemory: (id) => {
        set((state) => ({ memories: state.memories.filter((m) => m.id !== id) }))
      },

      pinMemory: (id) => {
        set((state) => ({
          memories: state.memories.map((m) =>
            m.id === id ? { ...m, pinned: !m.pinned, updatedAt: now() } : m
          ),
        }))
      },

      addImageMemory: async (memoryData, file) => {
        const memory: ImageMemory = {
          ...memoryData,
          id: generateId(),
          createdAt: now(),
          updatedAt: now(),
        }

        const result = await uploadImageMemory(file, {
          title: memory.title,
          tags: memory.tags,
          category: memory.category,
          type: 'image',
          mimeType: memory.mimeType,
          fileSize: memory.fileSize || file.size,
          fileName: file.name,
        }, get().zgPrivateKey || undefined)

        if (result.success) {
          memory.rootHash = result.rootHash
        }

        set((state) => ({ memories: [memory as unknown as BaseMemory, ...state.memories] }))
        return memory
      },

      addGoal: (goalData) => {
        const goal: Goal = { ...goalData, id: generateId(), createdAt: now(), updatedAt: now() }
        set((state) => ({ goals: [goal, ...state.goals] }))
      },

      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map((g) => g.id === id ? { ...g, ...updates, updatedAt: now() } : g),
        }))
      },

      deleteGoal: (id) => {
        set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }))
      },

      addReminder: (reminderData) => {
        const reminder: Reminder = { ...reminderData, id: generateId(), createdAt: now(), updatedAt: now() }
        set((state) => ({ reminders: [reminder, ...state.reminders] }))
      },

      updateReminder: (id, updates) => {
        set((state) => ({
          reminders: state.reminders.map((r) => r.id === id ? { ...r, ...updates, updatedAt: now() } : r),
        }))
      },

      deleteReminder: (id) => {
        set((state) => ({ reminders: state.reminders.filter((r) => r.id !== id) }))
      },

      toggleReminder: (id) => {
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id
              ? { ...r, completed: !r.completed, completedAt: !r.completed ? now() : undefined, updatedAt: now() }
              : r
          ),
        }))
      },

      addChatMessage: (msgData) => {
        const message: ChatMessage = { ...msgData, id: generateId(), timestamp: now() }
        set((state) => ({ chatMessages: [...state.chatMessages, message] }))
      },

      clearChat: () => set({ chatMessages: [] }),

      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

      setZGCredentials: (key) => set({ zgPrivateKey: key, zgConnected: !!key }),
    }),
    {
      name: 'myguy-storage',
      partialize: (state) => ({
        memories: state.memories,
        goals: state.goals,
        reminders: state.reminders,
        chatMessages: state.chatMessages,
        sidebarCollapsed: state.sidebarCollapsed,
        zgPrivateKey: state.zgPrivateKey,
        zgConnected: state.zgConnected,
      }),
    }
  )
)
