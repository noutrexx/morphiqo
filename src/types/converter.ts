export type FormatCategory =
  | 'Image'
  | 'Document'
  | 'Spreadsheet'
  | 'Presentation'
  | 'Audio'
  | 'Video'
  | 'Archive'

export type ConversionMode = 'browser' | 'simulated' | 'server-required' | 'invalid'

export type UploadStatus = 'ready' | 'invalid'

export type ConversionStatus =
  | 'queued'
  | 'converting'
  | 'success'
  | 'error'
  | 'server-required'
  | 'invalid'

export interface FormatGroup {
  category: FormatCategory
  formats: readonly string[]
}

export interface UploadedFileItem {
  id: string
  file: File
  name: string
  size: number
  sourceFormat: string
  targetFormat: string
  category?: FormatCategory
  status: UploadStatus
  message?: string
}

export interface ConversionRecord {
  id: string
  fileName: string
  size: number
  sourceFormat: string
  targetFormat: string
  category?: FormatCategory
  status: ConversionStatus
  progress: number
  createdAt: number
  outputName?: string
  downloadUrl?: string
  message?: string
}

export interface BrowserConversionResult {
  blob: Blob
  outputName: string
  message?: string
}
