import path from 'node:path'
import { getJob, updateJob } from '../jobs/jobStore.js'
import { getFormatCategory, isBrowserImageConversion } from '../config/formats.js'
import { convertDocument } from './documentService.js'
import { convertImage } from './imageService.js'
import { convertVideoOrAudio } from './videoService.js'
import { buildOutputPath } from '../utils/files.js'

interface StartConversionOptions {
  jobId: string
  inputPath: string
  originalName: string
  sourceFormat: string
  targetFormat: string
}

export async function startConversion(options: StartConversionOptions): Promise<void> {
  updateJob(options.jobId, {
    status: 'processing',
    progress: 10,
    message: 'Dönüşüm başladı.',
  })

  runConversion(options).catch((error: unknown) => {
    updateJob(options.jobId, {
      status: 'failed',
      progress: 100,
      message: error instanceof Error ? error.message : 'Dönüşüm başarısız.',
    })
  })
}

async function runConversion({
  jobId,
  inputPath,
  originalName,
  sourceFormat,
  targetFormat,
}: StartConversionOptions): Promise<void> {
  const job = getJob(jobId)
  if (!job) {
    return
  }

  const outputPath = buildOutputPath(jobId, originalName, targetFormat)
  const category = getFormatCategory(sourceFormat)

  if (isBrowserImageConversion(sourceFormat, targetFormat)) {
    await convertImage({ inputPath, outputPath, targetFormat })
  } else if (category === 'Video' || category === 'Audio') {
    await convertVideoOrAudio({ inputPath, outputPath })
  } else if (category === 'Document' || category === 'Spreadsheet' || category === 'Presentation') {
    await convertDocument({ inputPath, outputDir: path.dirname(outputPath), targetFormat })
  } else {
    throw new Error('Bu dönüşüm motoru henüz hazır değil.')
  }

  updateJob(jobId, {
    status: 'completed',
    progress: 100,
    outputPath,
    outputName: path.basename(outputPath),
    message: 'Dönüşüm tamamlandı.',
  })
}
