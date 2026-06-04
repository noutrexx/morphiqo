import fs from 'node:fs/promises'
import path from 'node:path'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
} from 'docx'
import pdfParse from 'pdf-parse/lib/pdf-parse.js'
import { normalizeFormat } from '../config/formats.js'
import { EngineMissingError, firstAvailableCommand, runCommand } from './commandRunner.js'

interface ConvertPdfOptions {
  inputPath: string
  outputPath: string
  targetFormat: string
}

export async function convertPdfDocument({
  inputPath,
  outputPath,
  targetFormat,
}: ConvertPdfOptions): Promise<void> {
  const target = normalizeFormat(targetFormat)

  if (target === 'txt') {
    await fs.writeFile(outputPath, await extractPdfText(inputPath), 'utf8')
    return
  }

  if (target === 'html') {
    const text = await extractPdfText(inputPath)
    await fs.writeFile(outputPath, toHtml(text), 'utf8')
    return
  }

  if (target === 'md') {
    await fs.writeFile(outputPath, toMarkdown(await extractPdfText(inputPath)), 'utf8')
    return
  }

  if (target === 'docx') {
    await writePdfTextAsDocx(inputPath, outputPath)
    return
  }

  if (target === 'doc' || target === 'epub' || target === 'odt' || target === 'ott' || target === 'rtf') {
    const docxPath = `${outputPath}.docx`
    await writePdfTextAsDocx(inputPath, docxPath)
    await convertDocxWithLibreOffice({ inputPath: docxPath, outputPath, targetFormat: target })
    await fs.rm(docxPath, { force: true })
    return
  }

  throw new Error('PDF cannot be converted to this target format.')
}

function toMarkdown(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .join('\n\n')
}

async function writePdfTextAsDocx(inputPath: string, outputPath: string): Promise<void> {
  const text = await extractPdfText(inputPath)
  const doc = new Document({
    sections: [
      {
        children: toParagraphs(text),
      },
    ],
  })
  const buffer = await Packer.toBuffer(doc)

  await fs.writeFile(outputPath, buffer)
}

async function extractPdfText(inputPath: string): Promise<string> {
  const buffer = await fs.readFile(inputPath)
  const result = await pdfParse(buffer)
  const text = result.text.trim()

  if (!text) {
    throw new Error('No extractable text was found in this PDF. Scanned PDFs require an OCR engine.')
  }

  return text
}

function toParagraphs(text: string): Paragraph[] {
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map(
      (block) =>
        new Paragraph({
          children: [new TextRun(block.replace(/\s*\n\s*/g, ' '))],
          spacing: { after: 180 },
        }),
    )
}

function toHtml(text: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>PDF export</title>
  </head>
  <body>
    <pre>${escapeHtml(text)}</pre>
  </body>
</html>`
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

async function convertDocxWithLibreOffice({
  inputPath,
  outputPath,
  targetFormat,
}: ConvertPdfOptions): Promise<void> {
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
