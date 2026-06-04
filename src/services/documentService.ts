import { spawn } from 'node:child_process'

interface ConvertDocumentOptions {
  inputPath: string
  outputDir: string
  targetFormat: string
}

export async function convertDocument({
  inputPath,
  outputDir,
  targetFormat,
}: ConvertDocumentOptions): Promise<void> {
  await runCommand('libreoffice', [
    '--headless',
    '--convert-to',
    targetFormat,
    '--outdir',
    outputDir,
    inputPath,
  ])
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
