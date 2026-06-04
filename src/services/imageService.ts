import sharp from 'sharp'
import { normalizeFormat } from '../config/formats.js'

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

  throw new Error('Sharp şimdilik sadece jpg, png ve webp destekler.')
}
