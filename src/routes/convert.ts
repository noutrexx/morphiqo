import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { rm } from 'node:fs/promises'
import express from 'express'
import multer from 'multer'
import {
  getFormatCategory,
  isAllowedConversion,
  isSupportedFormat,
  MAX_FILE_SIZE_BYTES,
  normalizeFormat,
} from '../config/formats.js'
import { createJob, toPublicJob } from '../jobs/jobStore.js'
import { startConversion } from '../services/conversionService.js'
import { getFormatFromFileName, sanitizeFileName, uploadDir } from '../utils/files.js'

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDir)
  },
  filename: (_req, file, callback) => {
    const safeName = sanitizeFileName(file.originalname)
    callback(null, `${Date.now()}-${randomUUID()}-${safeName}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
})

export const convertRouter = express.Router()

convertRouter.post('/convert', upload.single('file'), async (req, res) => {
  const file = req.file
  const targetFormat = normalizeFormat(String(req.body.targetFormat ?? ''))

  const failValidation = async (message: string) => {
    if (file?.path) {
      await rm(file.path, { force: true })
    }
    res.status(400).json({ message })
  }

  if (!file) {
    res.status(400).json({ message: 'No file was uploaded.' })
    return
  }

  const sourceFormat = getFormatFromFileName(file.originalname)

  if (!targetFormat) {
    await failValidation('Target format was not selected.')
    return
  }

  if (!isSupportedFormat(sourceFormat)) {
    await failValidation('Source format is not supported.')
    return
  }

  if (!isSupportedFormat(targetFormat)) {
    await failValidation('Target format is not supported.')
    return
  }

  if (sourceFormat === targetFormat) {
    await failValidation('Source and target format cannot match.')
    return
  }

  if (!hasExpectedMimeType(file.mimetype, sourceFormat)) {
    await failValidation('File type does not match the extension.')
    return
  }

  if (!isAllowedConversion(sourceFormat, targetFormat)) {
    await failValidation('Source and target must be in the same category.')
    return
  }

  const jobId = randomUUID()
  const safeName = sanitizeFileName(file.originalname)
  const category = getFormatCategory(sourceFormat)

  const job = createJob({
    id: jobId,
    originalName: file.originalname,
    safeName,
    sourceFormat,
    targetFormat,
    category,
    status: 'queued',
    progress: 0,
    inputPath: path.resolve(file.path),
    message: 'Job queued.',
  })

  void startConversion({
    jobId,
    inputPath: job.inputPath,
    originalName: safeName,
    sourceFormat,
    targetFormat,
  })

  res.status(202).json(toPublicJob(job))
})

function hasExpectedMimeType(mimeType: string, sourceFormat: string): boolean {
  const expectedMimeTypes: Record<string, string[]> = {
    jpg: ['image/jpeg'],
    png: ['image/png'],
    webp: ['image/webp'],
    gif: ['image/gif'],
    bmp: ['image/bmp', 'image/x-ms-bmp'],
    tiff: ['image/tiff'],
    svg: ['image/svg+xml'],
    ico: ['image/x-icon', 'image/vnd.microsoft.icon'],
    pdf: ['application/pdf'],
  }
  const allowedMimeTypes = expectedMimeTypes[sourceFormat]

  // Formats we don't fingerprint pass through on extension alone.
  if (!allowedMimeTypes) {
    return true
  }

  // Browsers occasionally send a generic type; don't reject those false-negatives.
  if (mimeType === '' || mimeType === 'application/octet-stream') {
    return true
  }

  return allowedMimeTypes.includes(mimeType)
}
