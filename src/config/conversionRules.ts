import type { ConversionMode, FormatCategory, FormatGroup, SupportedFormat } from '../types/converter'

export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024

export const FORMAT_GROUPS = [
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
  {
    category: 'Spreadsheet',
    formats: ['xls', 'xlsx', 'xlsm', 'xlsb', 'csv', 'ods', 'ots', 'tsv', 'dif', 'slk', 'dbf'],
  },
  {
    category: 'Presentation',
    formats: ['ppt', 'pptx', 'pps', 'ppsx', 'odp', 'otp'],
  },
  {
    category: 'Audio',
    formats: ['mp3', 'wav', 'aac', 'm4a', 'flac', 'ogg', 'opus', 'wma', 'aiff', 'alac', 'amr'],
  },
  {
    category: 'Video',
    formats: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v', 'flv', 'wmv', 'mpeg', 'mpg', '3gp', 'ogv', 'ts'],
  },
  {
    category: 'Archive',
    formats: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'wim', 'cab', 'iso'],
  },
] as const satisfies readonly FormatGroup[]

export const ALL_FORMATS = FORMAT_GROUPS.flatMap((group) => group.formats)

export const CONVERSION_ENGINES: Record<FormatCategory, string> = {
  Image: 'Sharp + ImageMagick',
  Video: 'FFmpeg',
  Audio: 'FFmpeg',
  Document: 'LibreOffice or Pandoc',
  Spreadsheet: 'LibreOffice headless',
  Presentation: 'LibreOffice headless',
  Archive: '7zip',
}

const formatCategoryMap = new Map<SupportedFormat, FormatCategory>(
  FORMAT_GROUPS.flatMap((group) => group.formats.map((format) => [format, group.category] as const)),
)

const BROWSER_IMAGE_FORMATS = new Set(['jpg', 'png', 'webp'])
const SIMPLE_TEXT_FORMATS = new Set(['txt', 'md', 'html'])
const CONVERTIBLE_TARGETS_BY_SOURCE: Record<string, readonly SupportedFormat[]> = {
  jpg: ['png', 'webp'],
  png: ['jpg', 'webp'],
  webp: ['jpg', 'png'],
  gif: ['jpg', 'png', 'webp'],
  bmp: ['jpg', 'png', 'webp'],
  tiff: ['jpg', 'png', 'webp'],
  svg: ['png', 'jpg', 'webp'],
  ico: ['png', 'jpg'],
  heic: ['jpg', 'png', 'webp'],
  avif: ['jpg', 'png', 'webp'],
  jp2: ['jpg', 'png', 'webp'],
  j2k: ['jpg', 'png', 'webp'],
  ppm: ['jpg', 'png', 'webp'],
  pgm: ['jpg', 'png', 'webp'],
  pbm: ['jpg', 'png', 'webp'],
  pnm: ['jpg', 'png', 'webp'],
  psd: ['jpg', 'png', 'webp'],
  eps: ['png', 'jpg', 'pdf'],
  pdf: ['docx', 'txt', 'html', 'md', 'doc', 'rtf', 'odt', 'epub'],
  doc: ['docx', 'pdf', 'rtf', 'odt', 'txt', 'html'],
  docx: ['pdf', 'doc', 'rtf', 'odt', 'txt', 'html', 'md', 'epub'],
  txt: ['md', 'html', 'docx', 'pdf'],
  md: ['html', 'txt', 'docx', 'pdf'],
  html: ['txt', 'md', 'docx', 'pdf'],
  rtf: ['docx', 'pdf', 'txt', 'odt'],
  odt: ['docx', 'pdf', 'rtf', 'txt'],
  ott: ['odt', 'docx', 'pdf'],
  epub: ['pdf', 'docx', 'html', 'txt'],
  tex: ['pdf', 'docx', 'html', 'txt'],
  rst: ['html', 'docx', 'pdf', 'txt'],
  adoc: ['html', 'docx', 'pdf', 'txt'],
  org: ['html', 'docx', 'pdf', 'txt'],
  xml: ['html', 'txt', 'docx'],
  xls: ['xlsx', 'csv', 'ods', 'tsv'],
  xlsx: ['csv', 'xls', 'ods', 'tsv'],
  xlsm: ['xlsx', 'csv', 'ods'],
  xlsb: ['xlsx', 'csv'],
  csv: ['xlsx', 'ods', 'tsv', 'xls'],
  ods: ['xlsx', 'csv', 'xls', 'tsv'],
  ots: ['ods', 'xlsx', 'csv'],
  tsv: ['csv', 'xlsx', 'ods'],
  dif: ['csv', 'xlsx', 'ods'],
  slk: ['csv', 'xlsx'],
  dbf: ['csv', 'xlsx'],
  ppt: ['pptx', 'odp', 'ppsx'],
  pptx: ['ppt', 'odp', 'ppsx'],
  pps: ['pptx', 'odp'],
  ppsx: ['pptx', 'ppt', 'odp'],
  odp: ['pptx', 'ppt', 'ppsx'],
  otp: ['odp', 'pptx'],
  mp3: ['wav', 'aac', 'm4a', 'flac', 'ogg', 'opus'],
  wav: ['mp3', 'aac', 'm4a', 'flac', 'ogg', 'opus'],
  aac: ['mp3', 'wav', 'm4a', 'flac', 'ogg'],
  m4a: ['mp3', 'wav', 'aac', 'flac', 'ogg'],
  flac: ['mp3', 'wav', 'aac', 'm4a', 'ogg'],
  ogg: ['mp3', 'wav', 'flac', 'opus'],
  opus: ['mp3', 'wav', 'ogg'],
  wma: ['mp3', 'wav', 'aac'],
  aiff: ['mp3', 'wav', 'flac'],
  alac: ['mp3', 'wav', 'flac'],
  amr: ['mp3', 'wav', 'aac'],
  mp4: ['webm', 'mov', 'mkv', 'avi'],
  mov: ['mp4', 'webm', 'mkv'],
  avi: ['mp4', 'webm', 'mkv'],
  mkv: ['mp4', 'webm', 'mov'],
  webm: ['mp4', 'mov', 'mkv'],
  m4v: ['mp4', 'webm', 'mov'],
  flv: ['mp4', 'webm'],
  wmv: ['mp4', 'webm'],
  mpeg: ['mp4', 'webm'],
  mpg: ['mp4', 'webm'],
  '3gp': ['mp4', 'webm'],
  ogv: ['mp4', 'webm'],
  ts: ['mp4', 'mkv'],
  zip: ['7z', 'tar'],
  rar: ['zip', '7z'],
  '7z': ['zip', 'tar'],
  tar: ['zip', '7z'],
  gz: ['zip', 'tar'],
  bz2: ['zip', 'tar'],
  xz: ['zip', 'tar'],
  wim: ['zip', '7z'],
  cab: ['zip', '7z'],
  iso: ['zip', '7z'],
}

export function normalizeFormat(format: string): SupportedFormat {
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

export function getFormatFromFileName(fileName: string): SupportedFormat {
  const extension = fileName.split('.').pop()
  return extension ? normalizeFormat(extension) : ''
}

export function getCategoryForFormat(format: string): FormatCategory | undefined {
  return formatCategoryMap.get(normalizeFormat(format))
}

export function getFormatsForCategory(category: FormatCategory): readonly SupportedFormat[] {
  return FORMAT_GROUPS.find((group) => group.category === category)?.formats ?? []
}

export function getConvertibleTargetFormats(sourceFormat: string): readonly SupportedFormat[] {
  const source = normalizeFormat(sourceFormat)
  const sourceCategory = getCategoryForFormat(source)
  const configuredTargets = CONVERTIBLE_TARGETS_BY_SOURCE[source]

  if (configuredTargets) {
    return configuredTargets.filter((target) => getConversionMode(source, target) !== 'invalid')
  }

  if (!sourceCategory) {
    return []
  }

  return getFormatsForCategory(sourceCategory).filter((target) => getConversionMode(source, target) !== 'invalid')
}

export function isSupportedFormat(format: string): boolean {
  return formatCategoryMap.has(normalizeFormat(format))
}

export function getDefaultTargetFormat(sourceFormat: string): SupportedFormat {
  return getConvertibleTargetFormats(sourceFormat)[0] ?? ''
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

  if (sourceCategory === 'Document' && SIMPLE_TEXT_FORMATS.has(source) && SIMPLE_TEXT_FORMATS.has(target)) {
    return 'browser'
  }

  return 'server'
}

export function getPairMessage(sourceFormat: string, targetFormat: string): string {
  const mode = getConversionMode(sourceFormat, targetFormat)
  const sourceCategory = getCategoryForFormat(sourceFormat)
  const targetCategory = getCategoryForFormat(targetFormat)

  if (!sourceFormat || !targetFormat) {
    return 'Choose a target format.'
  }

  if (!sourceCategory || !targetCategory) {
    return 'Unsupported format.'
  }

  if (sourceFormat === targetFormat) {
    return 'Source and target cannot match.'
  }

  if (sourceCategory !== targetCategory) {
    return 'Choose a target from the same category.'
  }

  if (mode === 'browser') {
    return sourceCategory === 'Image'
      ? 'Ready: JPG, PNG, and WEBP can convert in the browser.'
      : 'Ready: this can convert in the browser.'
  }

  if (sourceCategory === 'Image') {
    return 'ImageMagick is required for this engine-backed conversion.'
  }

  if (sourceCategory === 'Video' || sourceCategory === 'Audio') {
    return 'FFmpeg is required for this engine-backed conversion.'
  }

  if (sourceCategory === 'Document' || sourceCategory === 'Spreadsheet' || sourceCategory === 'Presentation') {
    return 'LibreOffice or Pandoc is required for this engine-backed conversion.'
  }

  return '7zip is required for this engine-backed conversion.'
}
