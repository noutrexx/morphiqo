import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { CONVERSION_ENGINES, FORMAT_GROUPS, MAX_FILE_SIZE_BYTES } from './config/formats.js'
import { convertRouter } from './routes/convert.js'
import { jobsRouter } from './routes/jobs.js'
import { ensureStorageDirs, removeOldFiles } from './utils/files.js'

const app = express()
const port = Number(process.env.PORT ?? 3000)
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173'

app.use(cors({ origin: frontendOrigin }))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, name: 'Morphiqo API' })
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
    res.status(413).json({ message: 'Dosya boyutu 100 MB sınırını aşıyor.' })
    return
  }

  res.status(500).json({ message: error instanceof Error ? error.message : 'Sunucu hatası.' })
})

await ensureStorageDirs()
void removeOldFiles()
setInterval(() => {
  void removeOldFiles()
}, 60 * 60 * 1000)

app.listen(port, () => {
  console.log(`Morphiqo API running on http://localhost:${port}`)
})
