import fs from 'node:fs/promises'
import path from 'node:path'
import { normalizeFormat } from '../config/formats.js'
import { runCommand } from './commandRunner.js'

interface ConvertArchiveOptions {
  inputPath: string
  outputPath: string
  targetFormat: string
}

export async function convertArchive({
  inputPath,
  outputPath,
  targetFormat,
}: ConvertArchiveOptions): Promise<void> {
  const tempDir = await fs.mkdtemp(path.join(path.dirname(outputPath), 'archive-work-'))

  try {
    await runCommand('7z', ['x', inputPath, `-o${tempDir}`, '-y'], {
      missingMessage: '7zip must be installed for this conversion.',
      failureMessage: 'The archive file could not be opened.',
    })

    await runCommand('7z', ['a', `-t${toSevenZipType(targetFormat)}`, outputPath, path.join(tempDir, '*')], {
      missingMessage: '7zip must be installed for this conversion.',
      failureMessage: 'Archive conversion failed.',
    })
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true })
  }
}

function toSevenZipType(format: string): string {
  const target = normalizeFormat(format)

  if (target === 'gz') {
    return 'gzip'
  }

  return target
}
