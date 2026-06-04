import type { ConversionMode, FormatCategory, FormatGroup } from '../types/converter'

export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024

export const FORMAT_GROUPS = [
  {
    category: 'Image',
    formats: ['jpg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'svg', 'ico', 'heic', 'avif'],
  },
  {
    category: 'Document',
    formats: ['doc', 'docx', 'pdf', 'txt', 'rtf', 'odt', 'md', 'html'],
  },
  {
    category: 'Spreadsheet',
    formats: ['xls', 'xlsx', 'csv', 'ods', 'tsv'],
  },
  {
    category: 'Presentation',
    formats: ['ppt', 'pptx', 'odp'],
  },
  {
    category: 'Audio',
    formats: ['mp3', 'wav', 'aac', 'm4a', 'flac', 'ogg'],
  },
  {
    category: 'Video',
    formats: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v'],
  },
  {
    category: 'Archive',
    formats: ['zip', 'rar', '7z', 'tar', 'gz'],
  },
] as const satisfies readonly FormatGroup[]

export const ALL_FORMATS = FORMAT_GROUPS.flatMap((group) => group.formats)

const formatCategoryMap = new Map<string, FormatCategory>(
  FORMAT_GROUPS.flatMap((group) =>
    group.formats.map((format) => [format, group.category] as const),
  ),
)

const BROWSER_IMAGE_FORMATS = new Set(['jpg', 'png', 'webp'])
const BROWSER_TEXT_FORMATS = new Set(['txt', 'md', 'html'])
const BROWSER_TABLE_FORMATS = new Set(['csv', 'tsv'])

export function normalizeFormat(format: string): string {
  const normalized = format.trim().replace(/^\./, '').toLowerCase()
  return normalized === 'jpeg' ? 'jpg' : normalized
}

export function getFormatFromFileName(fileName: string): string {
  const extension = fileName.split('.').pop()
  return extension ? normalizeFormat(extension) : ''
}

export function getCategoryForFormat(format: string): FormatCategory | undefined {
  return formatCategoryMap.get(normalizeFormat(format))
}

export function getFormatsForCategory(category: FormatCategory): readonly string[] {
  return FORMAT_GROUPS.find((group) => group.category === category)?.formats ?? []
}

export function isSupportedFormat(format: string): boolean {
  return formatCategoryMap.has(normalizeFormat(format))
}

export function getDefaultTargetFormat(sourceFormat: string): string {
  const category = getCategoryForFormat(sourceFormat)
  if (!category) {
    return ''
  }

  return getFormatsForCategory(category).find((format) => format !== sourceFormat) ?? ''
}

export function getConversionMode(sourceFormat: string, targetFormat: string): ConversionMode {
  const source = normalizeFormat(sourceFormat)
  const target = normalizeFormat(targetFormat)
  const sourceCategory = getCategoryForFormat(source)
  const targetCategory = getCategoryForFormat(target)

  if (!sourceCategory || !targetCategory || sourceCategory !== targetCategory || source === target) {
    return 'invalid'
  }

  if (sourceCategory === 'Image' && BROWSER_IMAGE_FORMATS.has(source) && BROWSER_IMAGE_FORMATS.has(target)) {
    return 'browser'
  }

  if (sourceCategory === 'Document' && BROWSER_TEXT_FORMATS.has(source) && BROWSER_TEXT_FORMATS.has(target)) {
    return 'browser'
  }

  if (
    sourceCategory === 'Spreadsheet' &&
    BROWSER_TABLE_FORMATS.has(source) &&
    BROWSER_TABLE_FORMATS.has(target)
  ) {
    return 'simulated'
  }

  return 'server-required'
}

export function getPairMessage(sourceFormat: string, targetFormat: string): string {
  const mode = getConversionMode(sourceFormat, targetFormat)
  const sourceCategory = getCategoryForFormat(sourceFormat)
  const targetCategory = getCategoryForFormat(targetFormat)

  if (!sourceFormat || !targetFormat) {
    return 'Format seçimi bekleniyor.'
  }

  if (!sourceCategory || !targetCategory) {
    return 'Desteklenmeyen format.'
  }

  if (sourceFormat === targetFormat) {
    return 'Kaynak ve hedef format aynı olamaz.'
  }

  if (sourceCategory !== targetCategory) {
    return 'Hedef format aynı kategoride olmalı.'
  }

  if (mode === 'browser') {
    return sourceCategory === 'Image'
      ? 'Tarayıcı canvas API ile dönüştürülebilir.'
      : 'Tarayıcıda metin dönüşümü hazır.'
  }

  if (mode === 'simulated') {
    return 'Mock dönüşüm çıktısı üretilecek.'
  }

  return 'server conversion required'
}
