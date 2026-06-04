import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

interface ConvertDocumentOptions {
  inputPath: string
  outputPath: string
  targetFormat: string
}

export async function convertDocument({
  inputPath,
  outputPath,
  targetFormat,
}: ConvertDocumentOptions): Promise<void> {
  const outputDir = path.dirname(outputPath)
  await runCommand('libreoffice', [
    '--headless',
    '--convert-to',
    targetFormat,
    '--outdir',
    outputDir,
    inputPath,
  ])

  const generatedPath = path.join(outputDir, `${path.parse(inputPath).name}.${targetFormat}`)
  await fs.rename(generatedPath, outputPath)
}

function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { shell: false })

    let errorText = ''
    child.stderr.on('data', (chunk: Buffer) => {
      errorText += chunk.toString()
    })

    child.on('error', () => reject(new Error('LibreOffice yüklü değil veya çalıştırılamadı.')))
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(errorText || 'LibreOffice dönüşümü başarısız.'))
    })
  })
}
