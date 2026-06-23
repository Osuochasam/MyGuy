"use client"

import type { BaseMemory, Goal, Reminder } from './types'

/**
 * RAG (Retrieval-Augmented Generation) service for MyGuy chat.
 * Always searches 0G-stored memories before responding.
 */

export function searchMemoriesForRAG(
  query: string,
  memories: BaseMemory[],
  goals: Goal[],
  reminders: Reminder[],
  topK = 5
): BaseMemory[] {
  const q = query.toLowerCase()
  const scored = memories.map((m) => {
    let score = 0
    if (m.title.toLowerCase().includes(q)) score += 3
    if (m.content.toLowerCase().includes(q)) score += 2
    if (m.tags.some((t) => t.toLowerCase().includes(q))) score += 1
    if (m.category.toLowerCase().includes(q)) score += 1
    return { memory: m, score }
  })
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.memory)
}

export function buildSystemPrompt(
  memories: BaseMemory[],
  goals: Goal[],
  reminders: Reminder[],
  relevantMemories: BaseMemory[]
): string {
  const memoryContext = relevantMemories.length > 0
    ? relevantMemories.map((m) =>
        `[${m.type.toUpperCase()} — ${m.category}] "${m.title}": ${m.content.slice(0, 200)}${m.content.length > 200 ? '...' : ''}`
      ).join('\n')
    : 'No directly relevant memories found.'

  const activeGoals = goals.filter((g) => g.status === 'active').slice(0, 3)
  const pendingReminders = reminders.filter((r) => !r.completed).slice(0, 3)

  return `You are MyGuy — a warm, intelligent, and deeply personal AI memory companion. You're like the best friend who never forgets anything. Your tone is friendly, supportive, and genuine — never robotic or generic.

You have access to this person's memories stored on 0G decentralized storage. Always ground your responses in their actual memories and context.

RELEVANT MEMORIES FROM 0G STORAGE:
${memoryContext}

ACTIVE GOALS (${activeGoals.length}):
${activeGoals.map((g) => `• ${g.title} — ${g.progress}% complete`).join('\n') || 'None'}

PENDING REMINDERS (${pendingReminders.length}):
${pendingReminders.map((r) => `• ${r.title} — due ${new Date(r.dueDate).toLocaleDateString()}`).join('\n') || 'None'}

TOTAL MEMORIES: ${memories.length}

Guidelines:
- Always reference specific memories when relevant
- Be proactive — if you notice patterns, mention them
- If you can't find relevant memories, say so honestly
- Never make up memories or hallucinate facts
- Suggest adding new memories when the user shares important things
- Keep responses concise but warm`
}

export async function generateChatResponse(
  userMessage: string,
  memories: BaseMemory[],
  goals: Goal[],
  reminders: Reminder[],
  history: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  // Step 1: Retrieve relevant memories from 0G store
  const relevantMemories = searchMemoriesForRAG(userMessage, memories, goals, reminders)
  const systemPrompt = buildSystemPrompt(memories, goals, reminders, relevantMemories)

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          ...history.slice(-10), // Keep last 10 turns for context
          { role: 'user', content: userMessage },
        ],
        systemPrompt,
        memoryRefs: relevantMemories.map((m) => m.id),
      }),
    })

    if (!response.ok) throw new Error(`API error: ${response.status}`)
    const data = await response.json()
    return data.message || "I couldn't generate a response right now."
  } catch (err) {
    console.error('[RAG] Chat error:', err)
    // Fallback response using local context
    if (relevantMemories.length > 0) {
      return `I found ${relevantMemories.length} relevant memor${relevantMemories.length === 1 ? 'y' : 'ies'} about "${relevantMemories[0].title}". To get full AI responses, connect your AI provider in Settings.`
    }
    return `I couldn't find memories matching "${userMessage}". Try adding more memories to the vault first, or connect an AI provider in Settings for full chat capabilities.`
  }
}
