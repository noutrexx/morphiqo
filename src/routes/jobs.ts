import fs from 'node:fs'
import express from 'express'
import { getJob, toPublicJob } from '../jobs/jobStore.js'

export const jobsRouter = express.Router()

jobsRouter.get('/jobs/:jobId', (req, res) => {
  const job = getJob(req.params.jobId)

  if (!job) {
    res.status(404).json({ message: 'Job bulunamadı.' })
    return
  }

  res.json(toPublicJob(job))
})

jobsRouter.get('/jobs/:jobId/download', (req, res) => {
  const job = getJob(req.params.jobId)

  if (!job) {
    res.status(404).json({ message: 'Job bulunamadı.' })
    return
  }

  if (job.status !== 'completed' || !job.outputPath || !fs.existsSync(job.outputPath)) {
    res.status(404).json({ message: 'Çıktı dosyası hazır değil.' })
    return
  }

  res.download(job.outputPath, job.outputName ?? 'morphiqo-output')
})
