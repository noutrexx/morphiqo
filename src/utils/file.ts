import { normalizeFormat } from '../data/formats'

export function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB']
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** unitIndex
  return `${value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`
}

export function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

export function createOutputFileName(fileName: string, targetFormat: string): string {
  const normalizedTarget = normalizeFormat(targetFormat)
  const baseName = fileName.includes('.') ? fileName.slice(0, fileName.lastIndexOf('.')) : fileName
  return `${baseName}.${normalizedTarget}`
}

export function downloadBlobUrl(url: string, fileName: string): void {
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
