"use client"

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, Trash2, Sparkles, Brain, Loader2, Database } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useStore } from '@/lib/store'
import { generateChatResponse, searchMemoriesForRAG } from '@/lib/rag'
import { cn } from '@/lib/utils'

const SUGGESTED_PROMPTS = [
  'What are my active goals right now?',
  'What have I been working on this week?',
  'Show me my recent career memories',
  'What relationships have I noted?',
  'What milestones have I reached?',
]

export default function ChatPage() {
  const { memories, goals, reminders, chatMessages, addChatMessage, clearChat } = useStore()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, loading])

  const handleSend = async (message: string = input) => {
    const trimmed = message.trim()
    if (!trimmed || loading) return

    setInput('')
    addChatMessage({ role: 'user', content: trimmed })
    setLoading(true)

    try {
      const history = chatMessages.map((m) => ({ role: m.role, content: m.content }))
      const response = await generateChatResponse(trimmed, memories, goals, reminders, history)
      addChatMessage({ role: 'assistant', content: response })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const memoryCount = memories.length

  return (
    <div className="flex flex-col h-full max-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            MyGuy Chat
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Searches your {memoryCount} memor{memoryCount !== 1 ? 'ies' : 'y'} from 0G storage before every response
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs text-muted-foreground">
            <Database className="w-3 h-3 text-primary" />
            RAG-powered
          </div>
          {chatMessages.length > 0 && (
            <button
              onClick={clearChat}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-1">{"Hey, it's MyGuy"}</h2>
            <p className="text-sm text-muted-foreground text-center max-w-xs mb-6">
              Ask me anything about your memories, goals, or life. I always search your 0G vault first.
            </p>
            <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="px-4 py-3 rounded-xl border border-border bg-card text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-card/80 transition-all text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <AnimatePresence initial={false}>
              {chatMessages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
            </AnimatePresence>
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border px-4 py-4 flex-shrink-0 bg-background">
        {/* Memory context indicator */}
        {input.trim() && (
          <MemoryContextBar query={input} memories={memories} />
        )}
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask MyGuy anything..."
            rows={1}
            className="flex-1 px-4 py-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors resize-none min-h-[44px] max-h-32"
            style={{ resize: 'none' }}
            onInput={(e) => {
              const el = e.currentTarget
              el.style.height = 'auto'
              el.style.height = `${Math.min(el.scrollHeight, 128)}px`
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground/50 mt-2 text-center">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}

function ChatBubble({ message }: { message: import('@/lib/types').ChatMessage }) {
  const isUser = message.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-1">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
        </div>
      )}
      <div className={cn('max-w-[75%] space-y-1', isUser && 'items-end flex flex-col')}>
        <div
          className={cn(
            'px-4 py-3 rounded-2xl text-sm leading-relaxed',
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-card border border-border text-foreground rounded-bl-sm'
          )}
        >
          {message.content}
        </div>
        <span className="text-[10px] text-muted-foreground px-1">
          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
        </span>
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-muted/60 border border-border flex items-center justify-center flex-shrink-0 mt-1">
          <span className="text-[10px] font-semibold text-muted-foreground">You</span>
        </div>
      )}
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start">
      <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-card border border-border">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function MemoryContextBar({ query, memories }: { query: string; memories: import('@/lib/types').BaseMemory[] }) {
  const relevant = useMemo(() => searchMemoriesForRAG(query, memories, [], [], 3), [query, memories])
  if (relevant.length === 0) return null
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mb-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/15 text-[10px] text-muted-foreground flex items-center gap-2"
    >
      <Brain className="w-3 h-3 text-primary flex-shrink-0" />
      <span>Will reference {relevant.length} memor{relevant.length !== 1 ? 'ies' : 'y'}: {relevant.map((m) => `"${m.title}"`).join(', ')}</span>
    </motion.div>
  )
}
