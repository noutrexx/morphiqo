import path from 'node:path'
import { getJob, updateJob } from '../jobs/jobStore.js'
import { getFormatCategory, isSharpImageConversion } from '../config/formats.js'
import { convertArchive } from './archiveService.js'
import { EngineMissingError } from './commandRunner.js'
import { convertDocument } from './documentService.js'
import { convertImage, convertImageWithImageMagick } from './imageService.js'
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
    message: 'Conversion started.',
  })

  runConversion(options).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Conversion failed.'
    const requiresServer = error instanceof EngineMissingError

    updateJob(options.jobId, {
      status: requiresServer ? 'requires_server' : 'failed',
      progress: 100,
      message,
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

  if (isSharpImageConversion(sourceFormat, targetFormat)) {
    updateJob(jobId, {
      progress: 35,
      message: 'Image is converting with Sharp.',
    })
    await convertImage({ inputPath, outputPath, targetFormat })
  } else if (category === 'Image') {
    updateJob(jobId, {
      progress: 35,
      message: 'Image is converting with ImageMagick.',
    })
    await convertImageWithImageMagick({ inputPath, outputPath })
  } else if (category === 'Video' || category === 'Audio') {
    updateJob(jobId, {
      progress: 25,
      message: 'Checking the FFmpeg engine.',
    })
    await convertVideoOrAudio({ inputPath, outputPath })
  } else if (category === 'Document' || category === 'Spreadsheet' || category === 'Presentation') {
    updateJob(jobId, {
      progress: 25,
      message: 'Checking the LibreOffice engine.',
    })
    await convertDocument({ inputPath, outputPath, sourceFormat, targetFormat })
  } else if (category === 'Archive') {
    updateJob(jobId, {
      progress: 25,
      message: 'Checking the 7zip engine.',
    })
    await convertArchive({ inputPath, outputPath, targetFormat })
  } else {
    updateJob(jobId, {
      status: 'failed',
      progress: 100,
      message: 'This conversion category is not supported.',
    })
    return
  }

  updateJob(jobId, {
    status: 'completed',
    progress: 100,
    outputPath,
    outputName: path.basename(outputPath),
    message: 'Conversion complete.',
  })
}
