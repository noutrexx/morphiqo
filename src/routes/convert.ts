import path from 'node:path'
import { randomUUID } from 'node:crypto'
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

convertRouter.post('/convert', upload.single('file'), (req, res) => {
  const file = req.file
  const targetFormat = normalizeFormat(String(req.body.targetFormat ?? ''))

  if (!file) {
    res.status(400).json({ message: 'Dosya gönderilmedi.' })
    return
  }

  const sourceFormat = getFormatFromFileName(file.originalname)

  if (!isSupportedFormat(sourceFormat) || !isSupportedFormat(targetFormat)) {
    res.status(400).json({ message: 'Desteklenmeyen format.' })
    return
  }

  if (!isAllowedConversion(sourceFormat, targetFormat)) {
    res.status(400).json({ message: 'Kaynak ve hedef format uyumsuz.' })
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
    message: 'İş kuyruğa alındı.',
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
