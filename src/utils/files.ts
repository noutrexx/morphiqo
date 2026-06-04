import fs from 'node:fs/promises'
import path from 'node:path'
import { normalizeFormat } from '../config/formats.js'

const projectRoot = process.cwd()

export const uploadDir = path.resolve(projectRoot, process.env.UPLOAD_DIR ?? 'uploads')
export const outputDir = path.resolve(projectRoot, process.env.OUTPUT_DIR ?? 'outputs')

export async function ensureStorageDirs(): Promise<void> {
  await fs.mkdir(uploadDir, { recursive: true })
  await fs.mkdir(outputDir, { recursive: true })
}

export function sanitizeFileName(fileName: string): string {
  const parsed = path.parse(fileName)
  const safeBase = parsed.name.replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 80) || 'file'
  const safeExt = normalizeFormat(parsed.ext)
  return safeExt ? `${safeBase}.${safeExt}` : safeBase
}

export function getFormatFromFileName(fileName: string): string {
  return normalizeFormat(path.extname(fileName))
}

export function buildOutputPath(jobId: string, originalName: string, targetFormat: string): string {
  const safeName = sanitizeFileName(originalName)
  const baseName = path.parse(safeName).name
  return path.join(outputDir, `${jobId}-${baseName}.${normalizeFormat(targetFormat)}`)
}

export async function removeOldFiles(maxAgeMs = 24 * 60 * 60 * 1000): Promise<void> {
  const now = Date.now()
  await removeOldFilesFromDir(uploadDir, now, maxAgeMs)
  await removeOldFilesFromDir(outputDir, now, maxAgeMs)
}

async function removeOldFilesFromDir(dir: string, now: number, maxAgeMs: number): Promise<void> {
  await fs.mkdir(dir, { recursive: true })
  const files = await fs.readdir(dir)

  await Promise.all(
    files.map(async (file) => {
      const fullPath = path.join(dir, file)
      const stat = await fs.stat(fullPath)
      if (stat.isFile() && now - stat.mtimeMs > maxAgeMs) {
        await fs.unlink(fullPath)
      }
    }),
  )
}
