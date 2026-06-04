declare module 'pdf-parse/lib/pdf-parse.js' {
  interface PdfParseResult {
    text: string
    numpages: number
    info?: unknown
    metadata?: unknown
    version?: string
  }

  export default function pdfParse(dataBuffer: Buffer): Promise<PdfParseResult>
}
