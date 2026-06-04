import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

export class EngineMissingError extends Error {}

interface RunCommandOptions {
  missingMessage: string
  failureMessage: string
}

export async function runCommand(
  command: string,
  args: string[],
  { missingMessage, failureMessage }: RunCommandOptions,
): Promise<void> {
  const resolvedCommand = resolveCommand(command)

  if (!resolvedCommand) {
    throw new EngineMissingError(missingMessage)
  }

  return new Promise((resolve, reject) => {
    const child = spawn(resolvedCommand, args, { shell: false })

    let errorText = ''
    child.stderr.on('data', (chunk: Buffer) => {
      errorText += chunk.toString()
    })

    child.on('error', () => reject(new EngineMissingError(missingMessage)))
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(errorText.trim() || failureMessage))
    })
  })
}

export async function commandExists(command: string, args: string[]): Promise<boolean> {
  const resolvedCommand = resolveCommand(command)

  if (!resolvedCommand) {
    return false
  }

  if (resolvedCommand !== command && fs.existsSync(resolvedCommand)) {
    return true
  }

  return new Promise((resolve) => {
    const child = spawn(resolvedCommand, args, { shell: false })
    const timeout = setTimeout(() => {
      child.kill()
      resolve(false)
    }, 2000)

    child.on('error', () => {
      clearTimeout(timeout)
      resolve(false)
    })
    child.on('close', (code) => {
      clearTimeout(timeout)
      resolve(code === 0)
    })
  })
}

export async function firstAvailableCommand(candidates: Array<{ command: string; args: string[] }>): Promise<string | undefined> {
  for (const candidate of candidates) {
    const command = resolveCommand(candidate.command)

    if (command && command !== candidate.command && fs.existsSync(command)) {
      return command
    }

    if (command && (await commandExists(command, candidate.args))) {
      return command
    }
  }

  return undefined
}

function resolveCommand(command: string): string | undefined {
  if (command.includes(path.sep) || command.includes('/')) {
    return fs.existsSync(command) ? command : undefined
  }

  for (const candidate of getCommandCandidates(command)) {
    if (candidate !== command && fs.existsSync(candidate)) {
      return candidate
    }
  }

  return command
}

function getCommandCandidates(command: string): string[] {
  const localAppData = process.env.LOCALAPPDATA
  const candidates = [command]

  if (command === 'magick') {
    candidates.push(...findExecutables('C:\\Program Files', 'magick.exe', 'ImageMagick-'))
  }

  if (command === 'ffmpeg' && localAppData) {
    candidates.push(
      ...findExecutables(
        path.join(localAppData, 'Microsoft', 'WinGet', 'Packages'),
        'ffmpeg.exe',
        'Gyan.FFmpeg',
      ),
    )
  }

  if (command === 'soffice' || command === 'libreoffice') {
    candidates.push('C:\\Program Files\\LibreOffice\\program\\soffice.exe')
  }

  if (command === 'pandoc') {
    candidates.push('C:\\Program Files\\Pandoc\\pandoc.exe')
    if (localAppData) {
      candidates.push(
        ...findExecutables(
          path.join(localAppData, 'Microsoft', 'WinGet', 'Packages'),
          'pandoc.exe',
          'JohnMacFarlane.Pandoc',
        ),
      )
    }
  }

  if (command === '7z') {
    candidates.push('C:\\Program Files\\7-Zip\\7z.exe')
  }

  return candidates
}

function findExecutables(root: string, executableName: string, packagePrefix: string): string[] {
  if (!fs.existsSync(root)) {
    return []
  }

  const results: string[] = []
  const roots = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith(packagePrefix))
    .map((entry) => path.join(root, entry.name))

  for (const packageRoot of roots) {
    collectExecutable(packageRoot, executableName, results, 4)
  }

  return results
}

function collectExecutable(dir: string, executableName: string, results: string[], depth: number): void {
  if (depth < 0 || results.length >= 3) {
    return
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name)

    if (entry.isFile() && entry.name.toLowerCase() === executableName.toLowerCase()) {
      results.push(entryPath)
      continue
    }

    if (entry.isDirectory()) {
      collectExecutable(entryPath, executableName, results, depth - 1)
    }
  }
}
