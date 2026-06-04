import sharp from 'sharp'
import { normalizeFormat } from '../config/formats.js'
import { runCommand } from './commandRunner.js'

interface ConvertImageOptions {
  inputPath: string
  outputPath: string
  targetFormat: string
}

export async function convertImage({ inputPath, outputPath, targetFormat }: ConvertImageOptions): Promise<void> {
  const format = normalizeFormat(targetFormat)
  const image = sharp(inputPath)

  if (format === 'jpg') {
    await image.jpeg({ quality: 90 }).toFile(outputPath)
    return
  }

  if (format === 'png') {
    await image.png().toFile(outputPath)
    return
  }

  if (format === 'webp') {
    await image.webp({ quality: 90 }).toFile(outputPath)
    return
  }

  throw new Error('Sharp currently supports only jpg, png, and webp.')
}

export async function convertImageWithImageMagick({
  inputPath,
  outputPath,
}: Omit<ConvertImageOptions, 'targetFormat'>): Promise<void> {
  await runCommand('magick', [inputPath, outputPath], {
    missingMessage: 'ImageMagick must be installed for this image conversion.',
    failureMessage: 'ImageMagick conversion failed.',
  })
}
