"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Database, Key, CheckCircle, AlertCircle, Loader2, Eye, EyeOff,
  ExternalLink, Trash2, Download, Upload, Shield, Zap, Brain,
  RefreshCw, Globe, Lock,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { PageHeader } from '@/components/ui/page-header'
import { ZG_CONFIG, uploadMemory } from '@/lib/0g/client'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const { memories, goals, reminders, setZGCredentials, zgConnected, zgPrivateKey } = useStore()
  const [keyInput, setKeyInput] = useState(zgPrivateKey || '')
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  const [testMessage, setTestMessage] = useState('')

  const handleSaveCredentials = () => {
    setZGCredentials(keyInput)
  }

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const result = await uploadMemory(
        'MyGuy connection test',
        { title: 'Test', tags: [], category: 'personal', type: 'memory' },
        keyInput || undefined
      )
      if (result.success) {
        setTestResult('success')
        setTestMessage(`Connection verified. Root hash: ${result.rootHash?.slice(0, 20)}…`)
      } else {
        setTestResult('error')
        setTestMessage(result.error || 'Upload failed')
      }
    } catch (err) {
      setTestResult('error')
      setTestMessage(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setTesting(false)
    }
  }

  const handleExport = () => {
    const data = { memories, goals, reminders, exportedAt: new Date().toISOString(), version: '1.0' }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `myguy-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <PageHeader title="Settings" description="Configure your 0G storage, AI, and preferences." />

      <div className="space-y-6">
        {/* 0G Storage */}
        <SettingsSection
          icon={Database}
          iconColor="text-violet-400"
          title="0G Decentralized Storage"
          badge={zgConnected ? 'Connected' : 'Demo Mode'}
          badgeColor={zgConnected ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-amber-400 bg-amber-400/10 border-amber-400/20'}
          description="All memories, goals, reminders, and images are stored permanently on 0G — the decentralized storage layer. Without 0G, persistent memory is impossible."
        >
          {/* Network info */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <InfoRow label="Network" value="0G Testnet" icon={Globe} />
            <InfoRow label="Chain ID" value={String(ZG_CONFIG.networkId)} icon={Zap} />
            <InfoRow label="RPC Endpoint" value={ZG_CONFIG.rpc.replace('https://', '')} icon={Globe} truncate />
            <InfoRow label="Indexer" value={ZG_CONFIG.indexerRpc.replace('https://', '')} icon={Database} truncate />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Memories', value: memories.length },
              { label: 'Goals', value: goals.length },
              { label: 'Reminders', value: reminders.length },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 rounded-lg bg-muted/30 border border-border text-center">
                <p className="text-lg font-semibold text-foreground">{value}</p>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          {/* Private key */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              Wallet Private Key
              <span className="text-[10px] text-muted-foreground/60">(for signing transactions)</span>
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2.5 rounded-lg bg-muted/40 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground/70 mt-1">
              Stored locally only. Used to sign 0G storage transactions.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSaveCredentials}
              className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Save Credentials
            </button>
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Test
            </button>
          </div>

          {/* Test result */}
          {testResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={cn(
                'mt-3 p-3 rounded-lg border text-xs flex items-start gap-2',
                testResult === 'success'
                  ? 'bg-emerald-400/5 border-emerald-400/20 text-emerald-400'
                  : 'bg-red-400/5 border-red-400/20 text-red-400'
              )}
            >
              {testResult === 'success'
                ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              }
              <span>{testMessage}</span>
            </motion.div>
          )}

          {/* 0G docs link */}
          <a
            href="https://docs.0g.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-1.5 text-xs text-primary/80 hover:text-primary transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            View 0G Storage documentation
          </a>
        </SettingsSection>

        {/* AI Provider */}
        <SettingsSection
          icon={Brain}
          iconColor="text-blue-400"
          title="AI Chat Provider"
          description="Configure an AI model for the Chat feature. Without this, memory search still works but responses are limited."
        >
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">OpenAI API Key</label>
            <input
              type="password"
              placeholder="sk-..."
              disabled
              className="w-full px-3 py-2.5 rounded-lg bg-muted/20 border border-border text-sm text-muted-foreground placeholder:text-muted-foreground/50 cursor-not-allowed font-mono"
            />
            <p className="text-[10px] text-muted-foreground/70 mt-1">
              Add <code className="text-primary font-mono">OPENAI_API_KEY</code> to your environment variables for full AI chat.
            </p>
          </div>
        </SettingsSection>

        {/* Data Management */}
        <SettingsSection
          icon={Shield}
          iconColor="text-emerald-400"
          title="Data Management"
          description="Export or manage your local memory index."
        >
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export All Data
            </button>
            <button
              disabled
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground/50 cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-2">
            Export includes all memories, goals, and reminders as JSON. Raw files remain on 0G storage permanently.
          </p>
        </SettingsSection>

        {/* About */}
        <div className="p-4 rounded-xl border border-border bg-muted/10 text-center">
          <p className="text-xs font-semibold text-foreground">MyGuy v1.0</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Built for the 0G Zero Cup · Powered by 0G decentralized storage</p>
          <a
            href="https://0g.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary transition-colors mt-2"
          >
            0g.ai <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  )
}

function SettingsSection({
  icon: Icon,
  iconColor,
  title,
  badge,
  badgeColor,
  description,
  children,
}: {
  icon: React.ElementType
  iconColor: string
  title: string
  badge?: string
  badgeColor?: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-muted/40 flex items-center justify-center flex-shrink-0">
            <Icon className={cn('w-4 h-4', iconColor)} />
          </div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        </div>
        {badge && (
          <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0', badgeColor)}>
            {badge}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-4 ml-11">{description}</p>
      <div className="ml-0">{children}</div>
    </div>
  )
}

function InfoRow({
  label,
  value,
  icon: Icon,
  truncate,
}: {
  label: string
  value: string
  icon: React.ElementType
  truncate?: boolean
}) {
  return (
    <div className="p-2.5 rounded-lg bg-muted/20 border border-border">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3 h-3 text-muted-foreground/60" />
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
      <p className={cn('text-xs font-mono text-foreground', truncate && 'truncate')}>{value}</p>
    </div>
  )
}
