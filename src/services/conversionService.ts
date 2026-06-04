import { getConversionMode, normalizeFormat } from '../data/formats'
import type { BrowserConversionResult } from '../types/converter'
import { createOutputFileName, escapeHtml } from '../utils/file'

interface ConvertFileOptions {
  file: File
  sourceFormat: string
  targetFormat: string
  onProgress: (progress: number) => void
}

type ConversionServiceResult =
  | {
      kind: 'download'
      result: BrowserConversionResult
    }
  | {
      kind: 'server-required'
      message: string
    }

const imageMimeTypes: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

export async function convertFile({
  file,
  sourceFormat,
  targetFormat,
  onProgress,
}: ConvertFileOptions): Promise<ConversionServiceResult> {
  const source = normalizeFormat(sourceFormat)
  const target = normalizeFormat(targetFormat)
  const mode = getConversionMode(source, target)

  if (mode === 'invalid') {
    throw new Error('Hatalı format eşleşmesi.')
  }

  onProgress(18)
  await wait(260)

  if (mode === 'server-required') {
    onProgress(100)
    return {
      kind: 'server-required',
      message: 'server conversion required',
    }
  }

  if (mode === 'browser' && isBrowserImagePair(source, target)) {
    const result = await convertImage(file, target, onProgress)
    return { kind: 'download', result }
  }

  if (mode === 'browser') {
    const result = await convertTextLikeFile(file, source, target, onProgress)
    return { kind: 'download', result }
  }

  const result = await simulateDelimitedConversion(file, source, target, onProgress)
  return { kind: 'download', result }
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
      throw new Error('Canvas context oluşturulamadı.')
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

async function simulateDelimitedConversion(
  file: File,
  sourceFormat: string,
  targetFormat: string,
  onProgress: (progress: number) => void,
): Promise<BrowserConversionResult> {
  const sourceText = await file.text()
  onProgress(64)

  const sourceDelimiter = sourceFormat === 'tsv' ? '\t' : ','
  const targetDelimiter = targetFormat === 'tsv' ? '\t' : ','
  const convertedText = sourceText
    .split(/\r?\n/)
    .map((row) => row.split(sourceDelimiter).join(targetDelimiter))
    .join('\n')

  await wait(180)
  onProgress(100)

  return {
    blob: new Blob([convertedText], { type: 'text/plain;charset=utf-8' }),
    outputName: createOutputFileName(file.name, targetFormat),
    message: 'Mock conversion complete',
  }
}

function transformText(sourceText: string, sourceFormat: string, targetFormat: string): string {
  if (targetFormat === 'html') {
    const title = sourceFormat === 'md' ? 'Markdown export' : 'Text export'
    return `<!doctype html>
<html lang="tr">
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
    image.onerror = () => reject(new Error('Görsel dosyası okunamadı.'))
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

        reject(new Error('Canvas çıktısı üretilemedi.'))
      },
      mimeType,
      quality,
    )
  })
}

function wait(duration: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, duration))
}
