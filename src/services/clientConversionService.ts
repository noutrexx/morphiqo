import { getConversionMode, normalizeFormat } from '../config/conversionRules'
import type { BrowserConversionResult, ConversionRequest, ConversionResult } from '../types/converter'
import { createOutputFileName, escapeHtml } from '../utils/file'

interface RunConversionOptions {
  request: ConversionRequest
  onProgress: (progress: number) => void
  onStatus: (status: ConversionResult['status'], message?: string) => void
}

interface ApiJobResponse {
  jobId: string
  status?: ConversionResult['status']
  progress?: number
  fileName?: string
  message?: string
}

interface ApiStatusResponse {
  jobId: string
  status: ConversionResult['status']
  progress?: number
  fileName?: string
  message?: string
}

interface ApiErrorResponse {
  message?: string
}

const imageMimeTypes: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? ''

export async function runConversion({
  request,
  onProgress,
  onStatus,
}: RunConversionOptions): Promise<ConversionResult> {
  if (apiBaseUrl) {
    try {
      return await runApiConversion(request, onProgress, onStatus)
    } catch (error) {
      if (error instanceof ApiRequestError) {
        throw error
      }

      if (!import.meta.env.DEV) {
        throw error
      }

      onStatus('processing', 'API is unavailable; using local mock mode.')
      return runMockConversion(request, onProgress, onStatus)
    }
  }

  return runMockConversion(request, onProgress, onStatus)
}

async function runApiConversion(
  request: ConversionRequest,
  onProgress: (progress: number) => void,
  onStatus: (status: ConversionResult['status'], message?: string) => void,
): Promise<ConversionResult> {
  const formData = new FormData()
  formData.append('file', request.file)
  formData.append('sourceFormat', request.sourceFormat)
  formData.append('targetFormat', request.targetFormat)

  onStatus('uploading')
  onProgress(12)

  const createResponse = await fetch(`${apiBaseUrl}/api/convert`, {
    method: 'POST',
    body: formData,
  })

  if (!createResponse.ok) {
    throw new ApiRequestError(await readApiError(createResponse, 'The file could not be uploaded to the backend service.'))
  }

  const createdJob = (await createResponse.json()) as ApiJobResponse
  onStatus('processing', createdJob.message)
  onProgress(createdJob.progress ?? 25)

  const completedJob = await pollJob(createdJob.jobId, onProgress, onStatus)

  if (completedJob.status === 'failed') {
    throw new Error(completedJob.message ?? 'Conversion failed.')
  }

  if (completedJob.status === 'requires_server') {
    return {
      jobId: completedJob.jobId,
      status: 'requires_server',
      progress: completedJob.progress ?? 100,
      message: completedJob.message ?? 'This conversion requires a backend engine.',
    }
  }

  return {
    jobId: completedJob.jobId,
    status: 'completed',
    progress: 100,
    outputName: completedJob.fileName ?? createOutputFileName(request.file.name, request.targetFormat),
    downloadUrl: `${apiBaseUrl}/api/jobs/${completedJob.jobId}/download`,
    message: completedJob.message ?? 'Conversion complete.',
  }
}

async function pollJob(
  jobId: string,
  onProgress: (progress: number) => void,
  onStatus: (status: ConversionResult['status'], message?: string) => void,
): Promise<ApiStatusResponse> {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    await wait(900)

    const statusResponse = await fetch(`${apiBaseUrl}/api/jobs/${jobId}`)
    if (!statusResponse.ok) {
      throw new ApiRequestError(await readApiError(statusResponse, 'Could not read job status.'))
    }

    const job = (await statusResponse.json()) as ApiStatusResponse
    onStatus(job.status, job.message)
    onProgress(job.progress ?? 40)

    if (job.status === 'completed' || job.status === 'failed' || job.status === 'requires_server') {
      return job
    }
  }

  throw new Error('Conversion took too long.')
}

async function readApiError(response: Response, fallbackMessage: string): Promise<string> {
  try {
    const payload = (await response.json()) as ApiErrorResponse
    return payload.message ?? fallbackMessage
  } catch {
    return fallbackMessage
  }
}

class ApiRequestError extends Error {}

async function runMockConversion(
  request: ConversionRequest,
  onProgress: (progress: number) => void,
  onStatus: (status: ConversionResult['status'], message?: string) => void,
): Promise<ConversionResult> {
  const { file, sourceFormat, targetFormat } = request
  const source = normalizeFormat(sourceFormat)
  const target = normalizeFormat(targetFormat)
  const mode = getConversionMode(source, target)

  if (mode === 'invalid') {
    throw new Error('Invalid format pairing.')
  }

  onStatus('queued')
  onProgress(8)
  await wait(260)
  onStatus('processing')

  if (mode === 'server') {
    onProgress(100)
    return {
      status: 'requires_server',
      progress: 100,
      message: 'This conversion requires a backend engine.',
    }
  }

  if (mode === 'browser' && isBrowserImagePair(source, target)) {
    const result = await convertImage(file, target, onProgress)
    return toCompletedResult(result)
  }

  const result = await convertTextLikeFile(file, source, target, onProgress)
  return toCompletedResult(result)
}

async function convertImage(
  file: File,
  targetFormat: string,
  onProgress: (progress: number) => void,
): Promise<BrowserConversionResult> {
  const imageUrl = URL.createObjectURL(file)

  try {
    const image = await loadImage(imageUrl)
    onProgress(56)

    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight

    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Canvas is not available.')
    }

    if (targetFormat === 'jpg') {
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)
    }

    context.drawImage(image, 0, 0)
    onProgress(78)

    const blob = await canvasToBlob(canvas, imageMimeTypes[targetFormat], targetFormat === 'jpg' ? 0.92 : 0.95)
    onProgress(100)

    return {
      blob,
      outputName: createOutputFileName(file.name, targetFormat),
      message: 'Canvas conversion complete',
    }
  } finally {
    URL.revokeObjectURL(imageUrl)
  }
}

async function convertTextLikeFile(
  file: File,
  sourceFormat: string,
  targetFormat: string,
  onProgress: (progress: number) => void,
): Promise<BrowserConversionResult> {
  const sourceText = await file.text()
  onProgress(62)

  const outputText = transformText(sourceText, sourceFormat, targetFormat)
  const mimeType = targetFormat === 'html' ? 'text/html;charset=utf-8' : 'text/plain;charset=utf-8'
  onProgress(100)

  return {
    blob: new Blob([outputText], { type: mimeType }),
    outputName: createOutputFileName(file.name, targetFormat),
    message: 'Browser text conversion complete',
  }
}

function transformText(sourceText: string, sourceFormat: string, targetFormat: string): string {
  if (targetFormat === 'html') {
    const title = sourceFormat === 'md' ? 'Markdown export' : 'Text export'
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
  </head>
  <body>
    <pre>${escapeHtml(sourceText)}</pre>
  </body>
</html>`
  }

  if (sourceFormat === 'html') {
    const parser = new DOMParser()
    return parser.parseFromString(sourceText, 'text/html').body.textContent ?? ''
  }

  return sourceText
}

function isBrowserImagePair(sourceFormat: string, targetFormat: string): boolean {
  return sourceFormat in imageMimeTypes && targetFormat in imageMimeTypes
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Image could not be read.'))
    image.src = url
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
          return
        }

        reject(new Error('Output could not be generated.'))
      },
      mimeType,
      quality,
    )
  })
}

function wait(duration: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, duration))
}

function toCompletedResult(result: BrowserConversionResult): ConversionResult {
  const downloadUrl = URL.createObjectURL(result.blob)

  return {
    status: 'completed',
    progress: 100,
    outputName: result.outputName,
    downloadUrl,
    message: result.message,
  }
}
