import { commandExists, firstAvailableCommand } from './commandRunner.js'

export interface EngineHealth {
  sharp: boolean
  imageMagick: boolean
  ffmpeg: boolean
  libreOffice: boolean
  pandoc: boolean
  sevenZip: boolean
}

export async function getEngineHealth(): Promise<EngineHealth> {
  const [imageMagick, ffmpeg, libreOfficeCommand, pandoc, sevenZip] = await Promise.all([
    commandExists('magick', ['-version']),
    commandExists('ffmpeg', ['-version']),
    firstAvailableCommand([
      { command: 'soffice', args: ['--version'] },
      { command: 'libreoffice', args: ['--version'] },
    ]),
    commandExists('pandoc', ['--version']),
    commandExists('7z', ['i']),
  ])

  return {
    sharp: true,
    imageMagick,
    ffmpeg,
    libreOffice: Boolean(libreOfficeCommand),
    pandoc,
    sevenZip,
  }
}
