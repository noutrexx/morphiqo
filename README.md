# Morphiqo

A local-first file conversion workspace with a polished React interface, job-based Express backend, real Sharp image conversions, and engine-ready services for documents, media, and archives.

Designed and vibe-coded by **noutrexx**.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111827)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-111827?logo=express&logoColor=white)
![Sharp](https://img.shields.io/badge/Sharp-image%20engine-99CC00)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38BDF8?logo=tailwindcss&logoColor=white)

## Preview

<p align="center">
  <img src="./docs/screenshots/05-converter-first-desktop.png" alt="Morphiqo converter-first desktop workspace" width="900" />
</p>

The preview shows the converter-first desktop workspace: upload, compatible target formats, queue actions, and local job state before the product story sections.

<br />

### Additional views

<p align="center">
  <img src="./docs/screenshots/06-converter-first-mobile.png" alt="Morphiqo converter-first mobile workspace" width="260" />
</p>

<p align="center">
  Mobile view of the converter-first flow.
</p>

<br />

<p align="center">
  <img src="./docs/screenshots/02-systems.png" alt="Morphiqo engine systems section" width="720" />
</p>

<p align="center">
  Engine systems section with conversion engines, GitHub profile, and ownership cards.
</p>

## Highlights

- Dark, premium converter workspace focused on the upload-to-download flow
- Automatic source format detection from the uploaded file
- Target formats filtered to only show valid options for the active file
- Job tracking with progress, status messages, retry, history, and downloads
- Real local image conversion with Sharp for `jpg`, `png`, and `webp`
- Extractable PDF conversion paths for `txt`, `html`, `md`, and `docx`
- Backend routing prepared for FFmpeg, LibreOffice, Pandoc, ImageMagick, and 7zip
- Safer file handling with size limits, sanitized names, and isolated output files

## Tech Stack

- Frontend: React, TypeScript, Vite
- Styling: Tailwind CSS, custom CSS, shadcn-style local UI components
- Backend: Express, TypeScript, Multer
- Conversion: Sharp, pdf-parse, docx, external engine runner
- Optional engines: FFmpeg, LibreOffice, Pandoc, ImageMagick, 7zip

## Requirements

Required:

- Node.js 20 or newer
- npm 10 or newer

Optional conversion engines:

- FFmpeg: video and audio conversions
- LibreOffice: document, spreadsheet, and presentation conversions
- Pandoc: document format conversions
- ImageMagick: extended image conversions
- 7zip: archive conversions

Windows install examples:

```powershell
winget install OpenJS.NodeJS.LTS
winget install Gyan.FFmpeg
winget install TheDocumentFoundation.LibreOffice
winget install 7zip.7zip
winget install ImageMagick.ImageMagick
```

macOS install examples:

```bash
brew install node ffmpeg libreoffice pandoc imagemagick p7zip
```

Linux install examples:

```bash
sudo apt install nodejs npm ffmpeg libreoffice pandoc imagemagick p7zip-full
```

Sharp image conversions work after `npm install`. The optional engines are only needed for the conversion families that depend on them.

## Getting Started

```bash
git clone https://github.com/noutrexx/morphiqo.git
cd morphiqo
npm install
cp .env.example .env
```

Run the frontend:

```bash
npm run dev
```

Run the backend in another terminal:

```bash
npm run dev:api
```

Open `http://localhost:5173`.

## Environment

```env
VITE_API_BASE_URL=http://localhost:3000
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
UPLOAD_DIR=uploads
OUTPUT_DIR=outputs
```

## API

- `POST /api/convert` creates a conversion job from an uploaded file.
- `GET /api/jobs/:jobId` returns job status, progress, output metadata, and messages.
- `GET /api/jobs/:jobId/download` downloads the completed output file.
- `GET /api/formats` returns supported format groups and engine mapping.

## Job States

- `queued`
- `processing`
- `completed`
- `failed`
- `requires_server`

## Current Conversion Coverage

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

Other conversion pairs are routed to optional local engines when they are installed.

## Validation

```bash
npm run lint
npm run build
npm run build:api
```

## Project Scope

Morphiqo was built as a full-stack product engineering project. The focus is the boundary between a clean converter UI and a backend conversion pipeline that can grow into worker queues, persistent job storage, and wider engine support.
