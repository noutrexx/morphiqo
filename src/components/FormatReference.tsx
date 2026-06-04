import { ServerCog, Sparkles } from 'lucide-react'
import { FORMAT_GROUPS, getConversionMode } from '../data/formats'
import type { UploadedFileItem } from '../types/converter'
import { formatBytes } from '../utils/file'

interface FormatReferenceProps {
  activeFile?: UploadedFileItem
  pairMessage: string
}

export function FormatReference({ activeFile, pairMessage }: FormatReferenceProps) {
  const mode = activeFile ? getConversionMode(activeFile.sourceFormat, activeFile.targetFormat) : 'invalid'

  return (
    <aside className="detail-panel" aria-label="Format kategorileri ve detaylar">
      <section className="panel-section">
        <div className="section-heading">
          <span className="eyebrow">Detay</span>
          <strong>{activeFile?.category ?? 'Format seç'}</strong>
        </div>
        <div className="detail-block">
          <span className="detail-icon">
            {mode === 'server' ? <ServerCog size={18} /> : <Sparkles size={18} />}
          </span>
          <div>
            <strong>{pairMessage}</strong>
            <small>
              {activeFile
                ? `${formatBytes(activeFile.size)} · ${activeFile.sourceFormat.toUpperCase()} → ${activeFile.targetFormat.toUpperCase()}`
                : 'Dosya yüklendiğinde işlem özeti görünür.'}
            </small>
          </div>
        </div>
      </section>

      <section className="panel-section">
        <div className="section-heading">
          <span className="eyebrow">Desteklenenler</span>
          <strong>Kategoriler</strong>
        </div>
        <div className="format-groups">
          {FORMAT_GROUPS.map((group) => (
            <article className="format-group" key={group.category}>
              <div>
                <strong>{group.category}</strong>
                <span>{group.formats.length} format</span>
              </div>
              <p>{group.formats.map((format) => format.toUpperCase()).join(', ')}</p>
            </article>
          ))}
        </div>
      </section>
    </aside>
  )
}
