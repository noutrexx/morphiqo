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
import { convertFile } from '../services/conversionService'
import type { ConversionRecord, UploadedFileItem } from '../types/converter'
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
  const [conversions, setConversions] = useState<ConversionRecord[]>(() => loadStoredHistory())
  const downloadUrlsRef = useRef(new Set<string>())

  const activeFile = useMemo(
    () => files.find((file) => file.id === activeFileId) ?? files[0],
    [activeFileId, files],
  )

  const pairMessage = activeFile
    ? getPairMessage(activeFile.sourceFormat, activeFile.targetFormat)
    : 'Dosya bekleniyor.'

  const isConverting = conversions.some((conversion) => conversion.status === 'converting')
  const canConvert =
    Boolean(activeFile) &&
    activeFile?.status === 'ready' &&
    getConversionMode(activeFile.sourceFormat, activeFile.targetFormat) !== 'invalid' &&
    !isConverting

  useEffect(() => {
    saveStoredHistory(conversions)
  }, [conversions])

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

  const convertActiveFile = useCallback(async () => {
    if (!activeFile) {
      return
    }

    const mode = getConversionMode(activeFile.sourceFormat, activeFile.targetFormat)
    const baseRecord: ConversionRecord = {
      id: createId('conversion'),
      fileName: activeFile.name,
      size: activeFile.size,
      sourceFormat: activeFile.sourceFormat,
      targetFormat: activeFile.targetFormat,
      category: getCategoryForFormat(activeFile.sourceFormat),
      status: mode === 'invalid' ? 'invalid' : 'converting',
      progress: mode === 'invalid' ? 0 : 8,
      createdAt: Date.now(),
      message: mode === 'invalid' ? getPairMessage(activeFile.sourceFormat, activeFile.targetFormat) : undefined,
    }

    setConversions((currentConversions) => limitHistory([baseRecord, ...currentConversions]))

    if (mode === 'invalid') {
      return
    }

    try {
      const serviceResult = await convertFile({
        file: activeFile.file,
        sourceFormat: activeFile.sourceFormat,
        targetFormat: activeFile.targetFormat,
        onProgress: (progress) => {
          setConversions((currentConversions) =>
            currentConversions.map((conversion) =>
              conversion.id === baseRecord.id ? { ...conversion, progress } : conversion,
            ),
          )
        },
      })

      if (serviceResult.kind === 'server-required') {
        setConversions((currentConversions) =>
          currentConversions.map((conversion) =>
            conversion.id === baseRecord.id
              ? {
                  ...conversion,
                  status: 'server-required',
                  progress: 100,
                  message: serviceResult.message,
                }
              : conversion,
          ),
        )
        return
      }

      const downloadUrl = URL.createObjectURL(serviceResult.result.blob)
      downloadUrlsRef.current.add(downloadUrl)
      setConversions((currentConversions) =>
        currentConversions.map((conversion) =>
          conversion.id === baseRecord.id
            ? {
                ...conversion,
                status: 'success',
                progress: 100,
                outputName: serviceResult.result.outputName,
                downloadUrl,
                message: serviceResult.result.message,
              }
            : conversion,
        ),
      )
    } catch (error) {
      setConversions((currentConversions) =>
        currentConversions.map((conversion) =>
          conversion.id === baseRecord.id
            ? {
                ...conversion,
                status: 'error',
                progress: 100,
                message: error instanceof Error ? error.message : 'Dönüşüm başarısız.',
              }
            : conversion,
        ),
      )
    }
  }, [activeFile])

  const downloadConversion = useCallback((conversion: ConversionRecord) => {
    if (!conversion.downloadUrl || !conversion.outputName) {
      return
    }

    downloadBlobUrl(conversion.downloadUrl, conversion.outputName)
  }, [])

  const clearHistory = useCallback(() => {
    conversions.forEach((conversion) => {
      if (conversion.downloadUrl) {
        URL.revokeObjectURL(conversion.downloadUrl)
      }
    })
    downloadUrlsRef.current.clear()
    clearStoredHistory()
    setConversions([])
  }, [conversions])

  return {
    activeFile,
    activeFileId: activeFile?.id,
    addFiles,
    canConvert,
    clearHistory,
    conversions,
    convertActiveFile,
    downloadConversion,
    files,
    isConverting,
    pairMessage,
    removeFile,
    selectFile,
    updateActiveSource,
    updateActiveTarget,
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
