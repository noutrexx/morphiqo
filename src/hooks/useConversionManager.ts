import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  getCategoryForFormat,
  getConversionMode,
  getDefaultTargetFormat,
  getFormatFromFileName,
  getPairMessage,
  isSupportedFormat,
  MAX_FILE_SIZE_BYTES,
  normalizeFormat,
} from '../data/formats'
import { runConversion } from '../services/conversionService'
import type { ConversionJob, ConversionRecord, UploadedFileItem } from '../types/converter'
import { createId, downloadBlobUrl, formatBytes } from '../utils/file'
import {
  clearStoredHistory,
  limitHistory,
  loadStoredHistory,
  saveStoredHistory,
} from '../utils/historyStorage'

export function useConversionManager() {
  const [files, setFiles] = useState<UploadedFileItem[]>([])
  const [activeFileId, setActiveFileId] = useState<string | undefined>()
  const [jobs, setJobs] = useState<ConversionJob[]>(() => loadStoredHistory().map(toJob))
  const downloadUrlsRef = useRef(new Set<string>())

  const activeFile = useMemo(
    () => files.find((file) => file.id === activeFileId) ?? files[0],
    [activeFileId, files],
  )

  const pairMessage = activeFile
    ? getPairMessage(activeFile.sourceFormat, activeFile.targetFormat)
    : 'Dosya bekleniyor.'

  const isConverting = jobs.some((job) => job.status === 'uploading' || job.status === 'processing')
  const canConvert =
    Boolean(activeFile) &&
    activeFile?.status === 'ready' &&
    getConversionMode(activeFile.sourceFormat, activeFile.targetFormat) !== 'invalid'

  useEffect(() => {
    saveStoredHistory(jobs.map(toRecord))
  }, [jobs])

  useEffect(() => {
    const downloadUrls = downloadUrlsRef.current
    return () => {
      downloadUrls.forEach((downloadUrl) => URL.revokeObjectURL(downloadUrl))
      downloadUrls.clear()
    }
  }, [])

  const addFiles = useCallback((incomingFiles: File[]) => {
    const nextFiles = incomingFiles.map(createUploadedFileItem)

    setFiles((currentFiles) => [...nextFiles, ...currentFiles])
    setActiveFileId((currentActiveId) => currentActiveId ?? nextFiles.find((file) => file.status === 'ready')?.id)
  }, [])

  const removeFile = useCallback(
    (fileId: string) => {
      setFiles((currentFiles) => currentFiles.filter((file) => file.id !== fileId))
      if (activeFileId === fileId) {
        setActiveFileId(undefined)
      }
    },
    [activeFileId],
  )

  const selectFile = useCallback((fileId: string) => {
    setActiveFileId(fileId)
  }, [])

  const updateActiveSource = useCallback(
    (sourceFormat: string) => {
      if (!activeFile) {
        return
      }

      const normalizedSource = normalizeFormat(sourceFormat)
      setFiles((currentFiles) =>
        currentFiles.map((file) =>
          file.id === activeFile.id
            ? {
                ...file,
                sourceFormat: normalizedSource,
                category: getCategoryForFormat(normalizedSource),
                status: isSupportedFormat(normalizedSource) ? 'ready' : 'invalid',
                message: isSupportedFormat(normalizedSource) ? undefined : 'Desteklenmeyen format.',
              }
            : file,
        ),
      )
    },
    [activeFile],
  )

  const updateActiveTarget = useCallback(
    (targetFormat: string) => {
      if (!activeFile) {
        return
      }

      const normalizedTarget = normalizeFormat(targetFormat)
      setFiles((currentFiles) =>
        currentFiles.map((file) =>
          file.id === activeFile.id
            ? {
                ...file,
                targetFormat: normalizedTarget,
              }
            : file,
        ),
      )
    },
    [activeFile],
  )

  const startJob = useCallback(async (fileItem: UploadedFileItem, existingJobId?: string) => {
    const mode = getConversionMode(fileItem.sourceFormat, fileItem.targetFormat)
    if (mode === 'invalid') {
      const invalidJob = createJob(fileItem, 'failed', getPairMessage(fileItem.sourceFormat, fileItem.targetFormat))
      setJobs((currentJobs) => limitHistory([invalidJob, ...currentJobs]).map(toJob))
      return
    }

    const job = createJob(fileItem, 'queued')
    const jobId = existingJobId ?? job.id

    if (existingJobId) {
      setJobs((currentJobs) =>
        currentJobs.map((currentJob) =>
          currentJob.id === existingJobId
            ? {
                ...job,
                id: existingJobId,
                createdAt: currentJob.createdAt,
              }
            : currentJob,
        ),
      )
    } else {
      setJobs((currentJobs) => limitHistory([job, ...currentJobs]).map(toJob))
    }

    try {
      const result = await runConversion({
        request: {
          file: fileItem.file,
          sourceFormat: fileItem.sourceFormat,
          targetFormat: fileItem.targetFormat,
        },
        onProgress: (progress) => {
          setJobs((currentJobs) =>
            currentJobs.map((currentJob) =>
              currentJob.id === jobId ? { ...currentJob, progress, updatedAt: Date.now() } : currentJob,
            ),
          )
        },
        onStatus: (status, message) => {
          setJobs((currentJobs) =>
            currentJobs.map((currentJob) =>
              currentJob.id === jobId
                ? {
                    ...currentJob,
                    status,
                    message: message ?? currentJob.message,
                    updatedAt: Date.now(),
                  }
                : currentJob,
            ),
          )
        },
      })

      if (result.downloadUrl?.startsWith('blob:')) {
        downloadUrlsRef.current.add(result.downloadUrl)
      }

      setJobs((currentJobs) =>
        currentJobs.map((currentJob) =>
          currentJob.id === jobId
            ? {
                ...currentJob,
                apiJobId: result.jobId,
                status: result.status,
                progress: result.progress,
                outputName: result.outputName,
                downloadUrl: result.downloadUrl,
                message: result.message,
                updatedAt: Date.now(),
              }
            : currentJob,
        ),
      )
    } catch (error) {
      setJobs((currentJobs) =>
        currentJobs.map((currentJob) =>
          currentJob.id === jobId
            ? {
                ...currentJob,
                status: 'failed',
                progress: 100,
                message: error instanceof Error ? error.message : 'Dönüşüm başarısız.',
                updatedAt: Date.now(),
              }
            : currentJob,
        ),
      )
    }
  }, [])

  const convertActiveFile = useCallback(() => {
    if (!activeFile || activeFile.status !== 'ready') {
      return
    }

    void startJob(activeFile)
  }, [activeFile, startJob])

  const convertAllFiles = useCallback(() => {
    files.filter((file) => file.status === 'ready').forEach((file) => {
      void startJob(file)
    })
  }, [files, startJob])

  const retryJob = useCallback(
    (job: ConversionJob) => {
      const file = files.find((item) => item.id === job.fileId)
      if (!file) {
        setJobs((currentJobs) =>
          currentJobs.map((item) =>
            item.id === job.id
              ? {
                  ...item,
                  status: 'failed',
                  message: 'Dosya tekrar yüklenmeli.',
                  updatedAt: Date.now(),
                }
              : item,
          ),
        )
        return
      }

      void startJob(file, job.id)
    },
    [files, startJob],
  )

  const downloadConversion = useCallback((job: ConversionJob | ConversionRecord) => {
    if (!job.downloadUrl || !job.outputName) {
      return
    }

    downloadBlobUrl(job.downloadUrl, job.outputName)
  }, [])

  const clearHistory = useCallback(() => {
    jobs.forEach((job) => {
      if (job.downloadUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(job.downloadUrl)
      }
    })
    downloadUrlsRef.current.clear()
    clearStoredHistory()
    setJobs([])
  }, [jobs])

  return {
    activeFile,
    activeFileId: activeFile?.id,
    addFiles,
    canConvert,
    clearHistory,
    conversions: jobs,
    convertActiveFile,
    convertAllFiles,
    downloadConversion,
    files,
    isConverting,
    jobs,
    pairMessage,
    removeFile,
    retryJob,
    selectFile,
    updateActiveSource,
    updateActiveTarget,
  }
}

function createJob(
  fileItem: UploadedFileItem,
  status: ConversionJob['status'],
  message?: string,
): ConversionJob {
  const now = Date.now()

  return {
    id: createId('job'),
    fileId: fileItem.id,
    fileName: fileItem.name,
    size: fileItem.size,
    sourceFormat: fileItem.sourceFormat,
    targetFormat: fileItem.targetFormat,
    category: getCategoryForFormat(fileItem.sourceFormat),
    status,
    progress: status === 'failed' ? 100 : 0,
    createdAt: now,
    updatedAt: now,
    message,
  }
}

function createUploadedFileItem(file: File): UploadedFileItem {
  const sourceFormat = getFormatFromFileName(file.name)
  const category = getCategoryForFormat(sourceFormat)
  const isOversized = file.size > MAX_FILE_SIZE_BYTES
  const isUnsupported = !sourceFormat || !isSupportedFormat(sourceFormat)
  const isInvalid = isOversized || isUnsupported

  return {
    id: createId('file'),
    file,
    name: file.name,
    size: file.size,
    sourceFormat,
    targetFormat: isInvalid ? '' : getDefaultTargetFormat(sourceFormat),
    category,
    status: isInvalid ? 'invalid' : 'ready',
    message: isOversized
      ? `Dosya limiti ${formatBytes(MAX_FILE_SIZE_BYTES)}.`
      : isUnsupported
        ? 'Desteklenmeyen format.'
        : undefined,
  }
}

function toRecord(job: ConversionJob): ConversionRecord {
  return {
    id: job.id,
    fileId: job.fileId,
    fileName: job.fileName,
    size: job.size,
    sourceFormat: job.sourceFormat,
    targetFormat: job.targetFormat,
    category: job.category,
    status: job.status,
    progress: job.progress,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    apiJobId: job.apiJobId,
    outputName: job.outputName,
    downloadUrl: job.downloadUrl,
    message: job.message,
  }
}

function toJob(record: ConversionRecord): ConversionJob {
  return {
    id: record.id,
    fileId: record.fileId ?? record.id,
    fileName: record.fileName,
    size: record.size,
    sourceFormat: record.sourceFormat,
    targetFormat: record.targetFormat,
    category: record.category,
    status: record.status,
    progress: record.progress,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt ?? record.createdAt,
    apiJobId: record.apiJobId,
    outputName: record.outputName,
    downloadUrl: record.downloadUrl,
    message: record.message,
  }
}
