import type { FormatCategory } from '../types/converter.js'

export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024

export const FORMAT_GROUPS: Array<{ category: FormatCategory; formats: string[] }> = [
  { category: 'Image', formats: ['jpg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'svg', 'ico', 'heic', 'avif'] },
  { category: 'Document', formats: ['doc', 'docx', 'pdf', 'txt', 'rtf', 'odt', 'md', 'html'] },
  { category: 'Spreadsheet', formats: ['xls', 'xlsx', 'csv', 'ods', 'tsv'] },
  { category: 'Presentation', formats: ['ppt', 'pptx', 'odp'] },
  { category: 'Audio', formats: ['mp3', 'wav', 'aac', 'm4a', 'flac', 'ogg'] },
  { category: 'Video', formats: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v'] },
  { category: 'Archive', formats: ['zip', 'rar', '7z', 'tar', 'gz'] },
]

export const CONVERSION_ENGINES: Record<FormatCategory, string> = {
  Image: 'Sharp veya ImageMagick',
  Document: 'LibreOffice headless veya Pandoc',
  Spreadsheet: 'LibreOffice headless',
  Presentation: 'LibreOffice headless',
  Audio: 'FFmpeg',
  Video: 'FFmpeg',
  Archive: '7zip',
}

const formatMap = new Map<string, FormatCategory>(
  FORMAT_GROUPS.flatMap((group) => group.formats.map((format) => [format, group.category])),
)

const sharpFormats = new Set(['jpg', 'png', 'webp'])

export function normalizeFormat(format: string): string {
  const normalized = format.trim().replace(/^\./, '').toLowerCase()
  return normalized === 'jpeg' ? 'jpg' : normalized
}

export function isSupportedFormat(format: string): boolean {
  return formatMap.has(normalizeFormat(format))
}

export function getFormatCategory(format: string): FormatCategory | undefined {
  return formatMap.get(normalizeFormat(format))
}

export function isAllowedConversion(sourceFormat: string, targetFormat: string): boolean {
  const sourceCategory = getFormatCategory(sourceFormat)
  const targetCategory = getFormatCategory(targetFormat)
  return Boolean(sourceCategory && targetCategory && sourceCategory === targetCategory && sourceFormat !== targetFormat)
}

export function isBrowserImageConversion(sourceFormat: string, targetFormat: string): boolean {
  return sharpFormats.has(normalizeFormat(sourceFormat)) && sharpFormats.has(normalizeFormat(targetFormat))
}
