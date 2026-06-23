"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Clock,
  Archive,
  Bell,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Database,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Timeline', href: '/timeline', icon: Clock },
  { label: 'Memory Vault', href: '/vault', icon: Archive },
  { label: 'Reminders', href: '/reminders', icon: Bell },
  { label: 'Chat', href: '/chat', icon: MessageSquare },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, setSidebarCollapsed, zgConnected } = useStore()

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 220 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-screen bg-surface border-r border-border flex-shrink-0 overflow-hidden z-20"
      style={{ backgroundColor: '#111113' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border min-h-[65px]">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 flex-shrink-0">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <span className="text-sm font-semibold text-foreground tracking-tight whitespace-nowrap">
                MyGuy
              </span>
              <p className="text-[10px] text-muted-foreground whitespace-nowrap">Memory Companion</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-2 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: sidebarCollapsed ? 0 : 2 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors group',
                  active
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                )}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                  />
                )}
                <Icon className={cn('w-4 h-4 flex-shrink-0 relative z-10', active && 'text-primary')} />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm font-medium relative z-10 whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* 0G Status */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-3 pb-3"
          >
            <div className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs',
              zgConnected
                ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                : 'border-border bg-muted/30 text-muted-foreground'
            )}>
              <Database className="w-3 h-3 flex-shrink-0" />
              <span className="whitespace-nowrap">{zgConnected ? '0G Connected' : '0G Demo Mode'}</span>
              <div className={cn(
                'w-1.5 h-1.5 rounded-full ml-auto flex-shrink-0',
                zgConnected ? 'bg-emerald-400' : 'bg-muted-foreground/40'
              )} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse toggle */}
      <div className="px-2 pb-4">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex items-center justify-center w-full h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </motion.aside>
  )
}
