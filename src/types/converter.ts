export type FormatCategory =
  | 'Image'
  | 'Document'
  | 'Spreadsheet'
  | 'Presentation'
  | 'Audio'
  | 'Video'
  | 'Archive'

export type SupportedFormat = string

export type ConversionMode = 'browser' | 'mock' | 'server' | 'invalid'

export type UploadStatus = 'ready' | 'invalid'

export type ConversionStatus =
  | 'queued'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'requires_server'

export interface FormatGroup {
  category: FormatCategory
  formats: readonly SupportedFormat[]
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

export interface ConversionRequest {
  file: File
  sourceFormat: SupportedFormat
  targetFormat: SupportedFormat
}

export interface ConversionResult {
  jobId?: string
  status: ConversionStatus
  progress: number
  outputName?: string
  downloadUrl?: string
  message?: string
}

export interface ConversionJob {
  id: string
  fileId: string
  fileName: string
  size: number
  sourceFormat: SupportedFormat
  targetFormat: SupportedFormat
  category?: FormatCategory
  status: ConversionStatus
  progress: number
  createdAt: number
  updatedAt: number
  apiJobId?: string
  outputName?: string
  downloadUrl?: string
  message?: string
}

export interface ConversionRecord {
  id: string
  fileId?: string
  fileName: string
  size: number
  sourceFormat: string
  targetFormat: string
  category?: FormatCategory
  status: ConversionStatus
  progress: number
  createdAt: number
  updatedAt?: number
  apiJobId?: string
  outputName?: string
  downloadUrl?: string
  message?: string
}

export interface BrowserConversionResult {
  blob: Blob
  outputName: string
  message?: string
}
