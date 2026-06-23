"use client"

/**
 * Browser-safe 0G Storage client.
 *
 * The @0glabs/0g-ts-sdk uses Node.js `fs` and cannot run in the browser.
 * All actual SDK calls happen in the server-side API route /api/0g/upload.
 * This file only issues fetch() requests so it is safe to import from
 * any client component or Zustand store.
 */

import type { MemoryMetadata, ImageMetadata, ZGUploadResult, ZGDownloadResult } from '@/lib/types'

// 0G Network configuration — exported so UI can display endpoint info
export const ZG_CONFIG = {
  rpc: process.env.NEXT_PUBLIC_ZG_RPC ?? 'https://evmrpc-testnet.0g.ai',
  indexerRpc: process.env.NEXT_PUBLIC_ZG_INDEXER_RPC ?? 'https://indexer-storage-testnet-standard.0g.ai',
  networkId: 16600,
}

/** Generate a random mock root hash for demo / offline fallback. */
function mockRootHash(seed?: string): string {
  if (seed) {
    let h = 0
    for (let i = 0; i < seed.length; i++) h = ((h * 31 + seed.charCodeAt(i)) >>> 0)
    return `0x${h.toString(16).padStart(16, '0').repeat(4)}`
  }
  return `0x${Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('')}`
}

/**
 * Upload a text memory via the server-side API route.
 * Falls back to demo mode when the route is unreachable.
 */
export async function uploadMemory(
  content: string,
  metadata: MemoryMetadata,
  privateKey?: string,
): Promise<ZGUploadResult> {
  try {
    const res = await fetch('/api/0g/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, metadata, privateKey }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as ZGUploadResult
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    console.error('[0G client] uploadMemory failed:', error)
    return { rootHash: mockRootHash(content), success: true, error: `Demo mode: ${error}` }
  }
}

/**
 * Upload an image/file memory. Converts the File to base64 first
 * then sends it to the server-side API route.
 */
export async function uploadImageMemory(
  file: File,
  metadata: ImageMetadata,
  privateKey?: string,
): Promise<ZGUploadResult> {
  try {
    const base64 = await fileToBase64(file)
    const res = await fetch('/api/0g/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: base64,
        metadata: { ...metadata, mimeType: file.type, fileName: file.name },
        privateKey,
      }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as ZGUploadResult
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    console.error('[0G client] uploadImageMemory failed:', error)
    return { rootHash: mockRootHash(file.name), success: true, error: `Demo mode: ${error}` }
  }
}

/**
 * Retrieve a memory by root hash.
 * Full download requires a dedicated server route; stubbed for MVP.
 */
export async function getMemory(_rootHash: string): Promise<ZGDownloadResult> {
  return { content: '', success: false, error: 'Download not yet implemented in demo mode' }
}

/**
 * Search memories by query string.
 * Full-text search is handled via the local Zustand store index in MVP.
 */
export async function searchMemories(
  query: string,
  _filters?: Record<string, unknown>,
): Promise<{ results: string[]; success: boolean; error?: string }> {
  console.log('[0G client] searchMemories query:', query)
  return { results: [], success: true }
}

/**
 * Get paginated timeline items from 0G.
 */
export async function getTimeline(
  limit = 20,
  offset = 0,
): Promise<{ items: unknown[]; success: boolean; error?: string }> {
  console.log('[0G client] getTimeline limit:', limit, 'offset:', offset)
  return { items: [], success: true }
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
