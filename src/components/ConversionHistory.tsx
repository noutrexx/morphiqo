import { Download, Layers3, Trash2 } from 'lucide-react'
import { JobStatusBadge } from './JobStatusBadge'
import type { ConversionJob, UploadedFileItem } from '../types/converter'
import { formatBytes } from '../utils/file'

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
  return (
    <aside className="side-panel" aria-label="Yüklenen dosyalar ve geçmiş">
      <section className="panel-section">
        <div className="section-heading">
          <span className="eyebrow">Yüklenenler</span>
          <strong>{files.length} dosya</strong>
        </div>

        {files.length ? (
          <div className="file-stack">
            {files.map((file) => (
              <button
                className={`file-item${activeFileId === file.id ? ' file-item--active' : ''}`}
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
                    {formatBytes(file.size)} · {file.sourceFormat ? file.sourceFormat.toUpperCase() : 'N/A'}
                  </small>
                </span>
                <JobStatusBadge status={file.status} />
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Dosyalar burada listelenir.</p>
          </div>
        )}
      </section>

      <section className="panel-section">
        <div className="section-heading section-heading--split">
          <div>
            <span className="eyebrow">History</span>
            <strong>LocalStorage</strong>
          </div>
          <button
            className="icon-button"
            type="button"
            title="Geçmişi temizle"
            aria-label="Geçmişi temizle"
            disabled={!jobs.length}
            onClick={onClearHistory}
          >
            <Trash2 size={16} />
          </button>
        </div>

        {jobs.length ? (
          <div className="history-stack">
            {jobs.map((job) => (
              <article className="history-item" key={job.id}>
                <div>
                  <strong>{job.fileName}</strong>
                  <small>
                    {job.sourceFormat.toUpperCase()} → {job.targetFormat.toUpperCase()}
                  </small>
                </div>
                <div className="history-item__actions">
                  <JobStatusBadge status={job.status} />
                  <button
                    className="icon-button"
                    type="button"
                    title="İndir"
                    aria-label="İndir"
                    disabled={job.status !== 'completed' || !job.downloadUrl}
                    onClick={() => onDownload(job)}
                  >
                    <Download size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Son 12 işlem saklanır.</p>
          </div>
        )}
      </section>
    </aside>
  )
}
