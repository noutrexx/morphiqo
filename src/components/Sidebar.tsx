import { Download, Layers3, Trash2 } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import type { ConversionRecord, UploadedFileItem } from '../types/converter'
import { formatBytes } from '../utils/file'

interface SidebarProps {
  activeFileId?: string
  conversions: ConversionRecord[]
  files: UploadedFileItem[]
  onClearHistory: () => void
  onDownload: (conversion: ConversionRecord) => void
  onSelectFile: (fileId: string) => void
}

export function Sidebar({
  activeFileId,
  conversions,
  files,
  onClearHistory,
  onDownload,
  onSelectFile,
}: SidebarProps) {
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
                <StatusBadge status={file.status} />
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Dosya eklenince liste burada tutulur.</p>
          </div>
        )}
      </section>

      <section className="panel-section">
        <div className="section-heading section-heading--split">
          <div>
            <span className="eyebrow">Geçmiş</span>
            <strong>LocalStorage</strong>
          </div>
          <button
            className="icon-button"
            type="button"
            title="Geçmişi temizle"
            aria-label="Geçmişi temizle"
            disabled={!conversions.length}
            onClick={onClearHistory}
          >
            <Trash2 size={16} />
          </button>
        </div>

        {conversions.length ? (
          <div className="history-stack">
            {conversions.map((conversion) => (
              <article className="history-item" key={conversion.id}>
                <div>
                  <strong>{conversion.fileName}</strong>
                  <small>
                    {conversion.sourceFormat.toUpperCase()} → {conversion.targetFormat.toUpperCase()}
                  </small>
                </div>
                <div className="history-item__actions">
                  <StatusBadge status={conversion.status} />
                  <button
                    className="icon-button"
                    type="button"
                    title="İndir"
                    aria-label="İndir"
                    disabled={!conversion.downloadUrl}
                    onClick={() => onDownload(conversion)}
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
