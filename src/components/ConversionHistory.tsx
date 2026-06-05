import { CheckCircle2, Download, Layers3, Trash2, UploadCloud } from 'lucide-react'
import { JobStatusBadge } from './JobStatusBadge'
import { Button } from './ui/button'
import { Card } from './ui/card'
import type { ConversionJob, UploadedFileItem } from '../types/converter'
import { formatBytes } from '../utils/file'

const quickRecipes = [
  'PNG -> WEBP',
  'PDF -> DOCX',
  'JPG -> PNG',
]

interface ConversionHistoryProps {
  activeFileId?: string
  files: UploadedFileItem[]
  jobs: ConversionJob[]
  onClearHistory: () => void
  onDownload: (job: ConversionJob) => void
  onSelectFile: (fileId: string) => void
}

export function ConversionHistory({
  activeFileId,
  files,
  jobs,
  onClearHistory,
  onDownload,
  onSelectFile,
}: ConversionHistoryProps) {
  const latestCompletedJob = jobs.find((job) => job.status === 'completed' && job.downloadUrl)

  return (
    <Card className="side-panel" aria-label="Uploaded files and conversion history">
      <section className="panel-section">
        <div className="section-heading">
          <span className="eyebrow">Workspace</span>
          <strong>{files.length ? `${files.length} files ready` : 'Start in seconds'}</strong>
        </div>

        {latestCompletedJob ? (
          <article className="quick-output-card">
            <span className="feature-icon">
              <CheckCircle2 size={17} />
            </span>
            <div>
              <strong>Latest output ready</strong>
              <p>
                {latestCompletedJob.sourceFormat.toUpperCase()} {'->'} {latestCompletedJob.targetFormat.toUpperCase()}
              </p>
            </div>
            <Button className="download-button" type="button" onClick={() => onDownload(latestCompletedJob)}>
              Download
            </Button>
          </article>
        ) : (
          <article className="quick-output-card quick-output-card--empty">
            <span className="feature-icon">
              <UploadCloud size={17} />
            </span>
            <div>
              <strong>1. Add a file</strong>
              <p>2. Pick a target, 3. convert, 4. download from local history.</p>
            </div>
          </article>
        )}

        {!files.length ? (
          <div className="recipe-strip" aria-label="Example conversions">
            {quickRecipes.map((recipe) => (
              <span key={recipe}>{recipe}</span>
            ))}
          </div>
        ) : null}
      </section>

      <section className="panel-section">
        <div className="section-heading">
          <span className="eyebrow">Uploads</span>
          <strong>{files.length} files</strong>
        </div>

        {files.length ? (
          <div className="file-stack">
            {files.map((file) => (
              <Button
                className={`file-item${activeFileId === file.id ? ' file-item--active' : ''}`}
                variant="ghost"
                key={file.id}
                type="button"
                onClick={() => onSelectFile(file.id)}
              >
                <span className="file-item__icon">
                  <Layers3 size={16} />
                </span>
                <span className="file-item__body">
                  <strong>{file.name}</strong>
                  <small>
                    {formatBytes(file.size)} - {file.sourceFormat ? file.sourceFormat.toUpperCase() : 'N/A'}
                  </small>
                </span>
                <JobStatusBadge status={file.status} />
              </Button>
            ))}
          </div>
        ) : (
          <div className="empty-state empty-state--soft">
            <p>Added files will appear here.</p>
          </div>
        )}
      </section>

      <section className="panel-section">
        <div className="section-heading section-heading--split">
          <div>
            <span className="eyebrow">History</span>
            <strong>Local record</strong>
          </div>
          <Button
            className="icon-button"
            variant="ghost"
            size="icon"
            type="button"
            title="Clear history"
            aria-label="Clear history"
            disabled={!jobs.length}
            onClick={onClearHistory}
          >
            <Trash2 size={16} />
          </Button>
        </div>

        {jobs.length ? (
          <div className="history-stack">
            {jobs.map((job) => (
              <article className="history-item" key={job.id}>
                <div>
                  <strong>{job.fileName}</strong>
                  <small>
                    {job.sourceFormat.toUpperCase()} {'->'} {job.targetFormat.toUpperCase()}
                  </small>
                </div>
                <div className="history-item__actions">
                  <JobStatusBadge status={job.status} />
                  <Button
                    className="icon-button"
                    variant="ghost"
                    size="icon"
                    type="button"
                    title="Download"
                    aria-label="Download"
                    disabled={job.status !== 'completed' || !job.downloadUrl}
                    onClick={() => onDownload(job)}
                  >
                    <Download size={16} />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state empty-state--soft">
            <p>The latest 12 conversion jobs are stored here locally.</p>
          </div>
        )}
      </section>
    </Card>
  )
}
