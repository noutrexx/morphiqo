# Morphiqo

Morphiqo is a premium local file conversion workspace built with React, TypeScript, Vite, Express, and a job-based conversion backend.

The project was designed and vibe-coded by **noutrexx** as a sharp, practical SaaS-style converter interface with real local engine support instead of a static mock screen.

## Highlights

- Dark, professional converter command center UI
- Drag-and-drop upload flow with automatic source format detection
- Target formats filtered by the selected file type
- Job-based backend flow with progress, status, history, retry, and download states
- Real image conversion through Sharp
- Engine-ready services for FFmpeg, LibreOffice, Pandoc/ImageMagick-style document and media workflows, and 7zip archives
- Safe upload handling with extension checks, size limits, sanitized filenames, and isolated output files
- shadcn-style UI primitives with a focused React component structure

## Screenshots

Screenshots are stored in `docs/screenshots` after running the local app.

![Morphiqo full page](docs/screenshots/00-full-page.png)

- `docs/screenshots/00-full-page.png`
- `docs/screenshots/01-convert-workspace.png`
- `docs/screenshots/02-systems.png`
- `docs/screenshots/03-workspace-detail.png`

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- shadcn-style local UI primitives
- Lucide React icons

### Backend

- Express 5
- TypeScript
- Multer upload handling
- Sharp for real `jpg`, `png`, and `webp` image conversions
- `docx` and `pdf-parse` for extractable PDF text conversion paths
- Spawn-based command runner for external engines

### Optional System Engines

Install these locally to unlock more conversion families:

- FFmpeg for video and audio conversions
- LibreOffice headless for office document, spreadsheet, and presentation conversions
- 7zip for archive conversions
- ImageMagick for extended image conversions

The backend does not crash when an optional engine is missing. Jobs return clear `requires_server` or `failed` states with a readable message.

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- Optional: FFmpeg, LibreOffice, 7zip, ImageMagick depending on the conversion category

## Environment

Create `.env` from `.env.example`:

```bash
VITE_API_BASE_URL=http://localhost:3000
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
UPLOAD_DIR=uploads
OUTPUT_DIR=outputs
```

## Installation

```bash
npm install
```

## Development

Run the frontend:

```bash
npm run dev
```

Run the backend in a second terminal:

```bash
npm run dev:api
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## Validation

```bash
npm run lint
npm run build
npm run build:api
```

## API

### `POST /api/convert`

Uploads a file with `multipart/form-data` and creates a conversion job.

Fields:

- `file`: uploaded file
- `targetFormat`: desired output format

### `GET /api/jobs/:jobId`

Returns job status, progress, message, output metadata, and download information.

### `GET /api/jobs/:jobId/download`

Downloads the completed output file.

### `GET /api/formats`

Returns supported format groups and engine mapping.

## Job States

- `queued`
- `processing`
- `completed`
- `failed`
- `requires_server`

## Real Conversion Coverage

Sharp-backed image conversions:

- `jpg -> png`
- `jpg -> webp`
- `png -> jpg`
- `png -> webp`
- `webp -> jpg`
- `webp -> png`

PDF text extraction paths:

- `pdf -> txt`
- `pdf -> html`
- `pdf -> md`
- `pdf -> docx`

Additional conversion pairs are routed through external engines when installed.

## Important Source Files

- `src/App.tsx`: main page structure and navigation
- `src/App.css`: product UI styling
- `src/components/ConversionPanel.tsx`: upload, target selection, and primary conversion flow
- `src/components/SupportedFormatsPanel.tsx`: compatible format display
- `src/components/ConversionHistory.tsx`: active uploads, quick output, and local history
- `src/hooks/useConversionManager.ts`: frontend queue, active file, history, and polling state
- `src/config/conversionRules.ts`: frontend conversion rules
- `src/config/formats.ts`: backend format groups and engine mapping
- `src/services/conversionService.ts`: backend conversion router
- `src/services/imageService.ts`: Sharp and ImageMagick image conversion service
- `src/services/documentService.ts`: document conversion service
- `src/services/pdfService.ts`: extractable PDF conversion paths
- `src/services/videoService.ts`: FFmpeg media conversion service
- `src/services/archiveService.ts`: 7zip archive conversion service
- `src/jobs/jobStore.ts`: in-memory job store
- `src/routes/convert.ts`: upload and job creation endpoint
- `src/routes/jobs.ts`: job status and download endpoints

## Notes

Morphiqo is intentionally local-first. Uploaded files are stored in the configured `uploads` directory and converted files are written to `outputs`. These folders are ignored by Git.
