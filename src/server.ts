import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { CONVERSION_ENGINES, FORMAT_GROUPS, MAX_FILE_SIZE_BYTES } from './config/formats.js'
import { convertRouter } from './routes/convert.js'
import { jobsRouter } from './routes/jobs.js'
import { getEngineHealth } from './services/engineHealthService.js'
import { ensureStorageDirs, removeOldFiles } from './utils/files.js'

const app = express()
const port = Number(process.env.PORT ?? 3000)
const frontendOrigins = (process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({ origin: frontendOrigins }))
app.use(express.json())

app.get('/api/health', async (_req, res) => {
  res.json({
    ok: true,
    name: 'Morphiqo API',
    engines: await getEngineHealth(),
  })
})

app.get('/api/formats', (_req, res) => {
  res.json({
    maxFileSize: MAX_FILE_SIZE_BYTES,
    groups: FORMAT_GROUPS,
    engines: CONVERSION_ENGINES,
  })
})

app.use('/api', convertRouter)
app.use('/api', jobsRouter)

app.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  void next

  if (error instanceof Error && error.message.includes('File too large')) {
    res.status(413).json({ message: 'File size exceeds the 100 MB limit.' })
    return
  }

  res.status(500).json({ message: error instanceof Error ? error.message : 'Server error.' })
})

await ensureStorageDirs()
void removeOldFiles()
setInterval(() => {
  void removeOldFiles()
}, 60 * 60 * 1000)

app.listen(port, () => {
  console.log(`Morphiqo API running on http://localhost:${port}`)
})
