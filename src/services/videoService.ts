import { runCommand } from './commandRunner.js'

interface ConvertVideoOptions {
  inputPath: string
  outputPath: string
}

export async function convertVideoOrAudio({ inputPath, outputPath }: ConvertVideoOptions): Promise<void> {
  await runCommand('ffmpeg', ['-y', '-i', inputPath, outputPath], {
    missingMessage: 'FFmpeg must be installed for this conversion.',
    failureMessage: 'FFmpeg conversion failed.',
  })
}
