import type { FormatCategory } from '../types/converter.js'

export type ServerJobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'requires_server'

export interface ServerJob {
  id: string
  originalName: string
  safeName: string
  sourceFormat: string
  targetFormat: string
  category?: FormatCategory
  status: ServerJobStatus
  progress: number
  inputPath: string
  outputPath?: string
  outputName?: string
  message?: string
  createdAt: string
  updatedAt: string
}

const jobs = new Map<string, ServerJob>()

export function createJob(data: Omit<ServerJob, 'createdAt' | 'updatedAt'>): ServerJob {
  const now = new Date().toISOString()
  const job: ServerJob = {
    ...data,
    createdAt: now,
    updatedAt: now,
  }

  jobs.set(job.id, job)
  return job
}

export function getJob(jobId: string): ServerJob | undefined {
  return jobs.get(jobId)
}

export function updateJob(jobId: string, patch: Partial<ServerJob>): ServerJob | undefined {
  const job = jobs.get(jobId)
  if (!job) {
    return undefined
  }

  const nextJob: ServerJob = {
    ...job,
    ...patch,
    updatedAt: new Date().toISOString(),
  }

  jobs.set(jobId, nextJob)
  return nextJob
}

export function toPublicJob(job: ServerJob) {
  return {
    jobId: job.id,
    status: job.status,
    progress: job.progress,
    fileName: job.outputName,
    outputName: job.outputName,
    message: job.message,
    sourceFormat: job.sourceFormat,
    targetFormat: job.targetFormat,
    category: job.category,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  }
}
