import type { FormatCategory } from '../types/converter.js'

export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024

export const FORMAT_GROUPS: Array<{ category: FormatCategory; formats: string[] }> = [
  {
    category: 'Image',
    formats: [
      'jpg',
      'png',
      'webp',
      'gif',
      'bmp',
      'tiff',
      'svg',
      'ico',
      'heic',
      'avif',
      'jp2',
      'j2k',
      'ppm',
      'pgm',
      'pbm',
      'pnm',
      'psd',
      'eps',
    ],
  },
  {
    category: 'Document',
    formats: [
      'doc',
      'docx',
      'pdf',
      'txt',
      'rtf',
      'odt',
      'ott',
      'md',
      'html',
      'epub',
      'tex',
      'rst',
      'adoc',
      'org',
      'xml',
    ],
  },
  { category: 'Spreadsheet', formats: ['xls', 'xlsx', 'xlsm', 'xlsb', 'csv', 'ods', 'ots', 'tsv', 'dif', 'slk', 'dbf'] },
  { category: 'Presentation', formats: ['ppt', 'pptx', 'pps', 'ppsx', 'odp', 'otp'] },
  { category: 'Audio', formats: ['mp3', 'wav', 'aac', 'm4a', 'flac', 'ogg', 'opus', 'wma', 'aiff', 'alac', 'amr'] },
  { category: 'Video', formats: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v', 'flv', 'wmv', 'mpeg', 'mpg', '3gp', 'ogv', 'ts'] },
  { category: 'Archive', formats: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'wim', 'cab', 'iso'] },
]

export const CONVERSION_ENGINES: Record<FormatCategory, string> = {
  Image: 'Sharp + ImageMagick',
  Document: 'LibreOffice headless or Pandoc',
  Spreadsheet: 'LibreOffice headless',
  Presentation: 'LibreOffice headless',
  Audio: 'FFmpeg',
  Video: 'FFmpeg',
  Archive: '7zip',
}

const formatMap = new Map<string, FormatCategory>(
  FORMAT_GROUPS.flatMap((group) => group.formats.map((format) => [format, group.category])),
)

const sharpImageFormats = new Set(['jpg', 'png', 'webp'])

export function normalizeFormat(format: string): string {
  const normalized = format.trim().replace(/^\./, '').toLowerCase()
  const aliases: Record<string, string> = {
    asciidoc: 'adoc',
    htm: 'html',
    jpeg: 'jpg',
    markdown: 'md',
    tif: 'tiff',
    aif: 'aiff',
    mpeg4: 'mp4',
  }

  return aliases[normalized] ?? normalized
}

export function isSupportedFormat(format: string): boolean {
  return formatMap.has(normalizeFormat(format))
}

export function getFormatCategory(format: string): FormatCategory | undefined {
  return formatMap.get(normalizeFormat(format))
}

export function isAllowedConversion(sourceFormat: string, targetFormat: string): boolean {
  const source = normalizeFormat(sourceFormat)
  const target = normalizeFormat(targetFormat)
  const sourceCategory = getFormatCategory(source)
  const targetCategory = getFormatCategory(target)
  return Boolean(sourceCategory && targetCategory && sourceCategory === targetCategory && source !== target)
}

export function isSharpImageConversion(sourceFormat: string, targetFormat: string): boolean {
  return sharpImageFormats.has(normalizeFormat(sourceFormat)) && sharpImageFormats.has(normalizeFormat(targetFormat))
}

export function isSharpImageFormat(format: string): boolean {
  return sharpImageFormats.has(normalizeFormat(format))
}
