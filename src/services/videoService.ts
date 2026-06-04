import { spawn } from 'node:child_process'

interface ConvertVideoOptions {
  inputPath: string
  outputPath: string
}

export async function convertVideoOrAudio({ inputPath, outputPath }: ConvertVideoOptions): Promise<void> {
  await runCommand('ffmpeg', ['-y', '-i', inputPath, outputPath])
}

function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { shell: false })

    let errorText = ''
    child.stderr.on('data', (chunk: Buffer) => {
      errorText += chunk.toString()
    })

    child.on('error', () => reject(new Error('FFmpeg yüklü değil veya çalıştırılamadı.')))
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(errorText || 'FFmpeg dönüşümü başarısız.'))
    })
  })
}
