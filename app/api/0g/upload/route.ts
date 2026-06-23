/**
 * Server-side 0G Storage upload handler.
 * Uses ZgFile.fromFilePath which requires Node.js `fs` — must only run here.
 */
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { content, metadata, privateKey } = body as {
      content: string
      metadata: Record<string, unknown>
      privateKey?: string
    }

    const key = privateKey || process.env.ZG_PRIVATE_KEY

    if (!key) {
      // Demo mode – return a deterministic mock hash
      const mockHash = `0x${Buffer.from(content.slice(0, 32)).toString('hex').padStart(64, '0')}`
      return NextResponse.json({ rootHash: mockHash, success: true, demo: true })
    }

    const { ZgFile, Indexer } = await import('@0glabs/0g-ts-sdk')
    const { ethers } = await import('ethers')

    const rpc = process.env.ZG_RPC || 'https://evmrpc-testnet.0g.ai'
    const indexerRpc = process.env.ZG_INDEXER_RPC || 'https://indexer-storage-testnet-standard.0g.ai'

    // Write payload to a temp file for ZgFile.fromFilePath
    const payload = JSON.stringify({ content, metadata, timestamp: new Date().toISOString() })
    const tmpPath = join(tmpdir(), `myguy-${Date.now()}.json`)
    await writeFile(tmpPath, payload, 'utf8')

    let rootHash = ''
    try {
      const file = await ZgFile.fromFilePath(tmpPath)
      const [tree, treeErr] = await file.merkleTree()
      if (treeErr) throw new Error(`Merkle tree error: ${treeErr}`)
      rootHash = tree!.rootHash()!

      // The 0G SDK ships CJS ethers while this project uses ESM ethers.
      // The types are structurally identical at runtime — suppress the dual-bundle conflict.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const signer = new ethers.Wallet(key, new ethers.JsonRpcProvider(rpc)) as any
      const indexer = new Indexer(indexerRpc)
      const [result, uploadErr] = await indexer.upload(file, rpc, signer)
      if (uploadErr) throw new Error(`Upload error: ${uploadErr}`)

      await file.close()
      return NextResponse.json({ rootHash, txHash: result?.txHash, success: true })
    } finally {
      await unlink(tmpPath).catch(() => {})
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    console.error('[0G API] upload failed:', error)
    const mockHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
    return NextResponse.json({ rootHash: mockHash, success: true, demo: true, error })
  }
}
