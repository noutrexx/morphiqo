import { ServerCog, Sparkles } from 'lucide-react'
import { CONVERSION_ENGINES, FORMAT_GROUPS, getConversionMode } from '../config/conversionRules'
import type { UploadedFileItem } from '../types/converter'
import { formatBytes } from '../utils/file'

interface SupportedFormatsPanelProps {
  activeFile?: UploadedFileItem
  pairMessage: string
}

export function SupportedFormatsPanel({ activeFile, pairMessage }: SupportedFormatsPanelProps) {
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
                : 'Dosya seçilince özet görünür.'}
            </small>
          </div>
        </div>
      </section>

      <section className="panel-section">
        <div className="section-heading">
          <span className="eyebrow">Backend planı</span>
          <strong>Motorlar</strong>
        </div>
        <div className="format-groups">
          {FORMAT_GROUPS.map((group) => (
            <article className="format-group" key={group.category}>
              <div>
                <strong>{group.category}</strong>
                <span>{CONVERSION_ENGINES[group.category]}</span>
              </div>
              <p>{group.formats.map((format) => format.toUpperCase()).join(', ')}</p>
            </article>
          ))}
        </div>
      </section>
    </aside>
  )
}
