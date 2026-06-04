import type { ConversionRecord } from '../types/converter'

const HISTORY_KEY = 'morphiqo:conversion-history'
const HISTORY_LIMIT = 12

type StoredConversionRecord = Omit<ConversionRecord, 'downloadUrl'>

export function loadStoredHistory(): ConversionRecord[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const rawHistory = window.localStorage.getItem(HISTORY_KEY)
    if (!rawHistory) {
      return []
    }

    return (JSON.parse(rawHistory) as StoredConversionRecord[]).map((record) => ({
      ...record,
      downloadUrl: undefined,
    }))
  } catch {
    return []
  }
}

export function saveStoredHistory(records: ConversionRecord[]): void {
  const stableRecords = records.slice(0, HISTORY_LIMIT).map(toStoredRecord)
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(stableRecords))
}

export function clearStoredHistory(): void {
  window.localStorage.removeItem(HISTORY_KEY)
}

export function limitHistory(records: ConversionRecord[]): ConversionRecord[] {
  return records.slice(0, HISTORY_LIMIT)
}

function toStoredRecord(record: ConversionRecord): StoredConversionRecord {
  return {
    id: record.id,
    fileName: record.fileName,
    size: record.size,
    sourceFormat: record.sourceFormat,
    targetFormat: record.targetFormat,
    category: record.category,
    status: record.status,
    progress: record.progress,
    createdAt: record.createdAt,
    outputName: record.outputName,
    message: record.message,
  }
}
