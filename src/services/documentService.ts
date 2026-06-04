import fs from 'node:fs/promises'
import path from 'node:path'
import { EngineMissingError, firstAvailableCommand, runCommand } from './commandRunner.js'
import { convertPdfDocument } from './pdfService.js'

interface ConvertDocumentOptions {
  inputPath: string
  outputPath: string
  sourceFormat: string
  targetFormat: string
}

const pandocFormats = new Set(['adoc', 'epub', 'html', 'md', 'org', 'rst', 'tex', 'txt', 'xml'])

export async function convertDocument({
  inputPath,
  outputPath,
  sourceFormat,
  targetFormat,
}: ConvertDocumentOptions): Promise<void> {
  if (sourceFormat === 'pdf') {
    await convertPdfDocument({ inputPath, outputPath, targetFormat })
    return
  }

  if (pandocFormats.has(sourceFormat) || pandocFormats.has(targetFormat)) {
    await convertWithPandoc({ inputPath, outputPath, targetFormat })
    return
  }

  await convertWithLibreOffice({ inputPath, outputPath, targetFormat })
}

async function convertWithLibreOffice({
  inputPath,
  outputPath,
  targetFormat,
}: Omit<ConvertDocumentOptions, 'sourceFormat'>): Promise<void> {
  const outputDir = path.dirname(outputPath)
  const command = await firstAvailableCommand([
    { command: 'soffice', args: ['--version'] },
    { command: 'libreoffice', args: ['--version'] },
  ])

  if (!command) {
    throw new EngineMissingError('LibreOffice must be installed for this conversion.')
  }

  await runCommand(
    command,
    ['--headless', '--convert-to', targetFormat, '--outdir', outputDir, inputPath],
    {
      missingMessage: 'LibreOffice must be installed for this conversion.',
      failureMessage: 'LibreOffice conversion failed.',
    },
  )

  const generatedPath = path.join(outputDir, `${path.parse(inputPath).name}.${targetFormat}`)
  await fs.rename(generatedPath, outputPath)
}

async function convertWithPandoc({
  inputPath,
  outputPath,
  targetFormat,
}: Pick<ConvertDocumentOptions, 'inputPath' | 'outputPath' | 'targetFormat'>): Promise<void> {
  if (targetFormat === 'pdf') {
    const docxPath = `${outputPath}.docx`
    await runCommand('pandoc', [inputPath, '-o', docxPath], {
      missingMessage: 'Pandoc must be installed for this conversion.',
      failureMessage: 'Pandoc conversion failed.',
    })
    await convertWithLibreOffice({ inputPath: docxPath, outputPath, targetFormat: 'pdf' })
    await fs.rm(docxPath, { force: true })
    return
  }

  await runCommand('pandoc', [inputPath, '-o', outputPath], {
    missingMessage: 'Pandoc must be installed for this conversion.',
    failureMessage: 'Pandoc conversion failed.',
  })
}
