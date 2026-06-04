import { Download, Play, Trash2 } from 'lucide-react'
import { FileDropzone } from './FileDropzone'
import { FormatSelect } from './FormatSelect'
import { StatusBadge } from './StatusBadge'
import { getConversionMode } from '../data/formats'
import type { ConversionRecord, UploadedFileItem } from '../types/converter'
import { formatBytes } from '../utils/file'

interface ConversionPanelProps {
  activeFile?: UploadedFileItem
  canConvert: boolean
  conversions: ConversionRecord[]
  isConverting: boolean
  pairMessage: string
  onAddFiles: (files: File[]) => void
  onConvert: () => void
  onDownload: (conversion: ConversionRecord) => void
  onRemoveFile: (fileId: string) => void
  onSourceChange: (format: string) => void
  onTargetChange: (format: string) => void
}

export function ConversionPanel({
  activeFile,
  canConvert,
  conversions,
  isConverting,
  pairMessage,
  onAddFiles,
  onConvert,
  onDownload,
  onRemoveFile,
  onSourceChange,
  onTargetChange,
}: ConversionPanelProps) {
  const mode = activeFile ? getConversionMode(activeFile.sourceFormat, activeFile.targetFormat) : 'invalid'
  const latestConversions = conversions.slice(0, 4)

  return (
    <section className="converter-panel" aria-label="Ana dönüşüm paneli">
      <FileDropzone onAddFiles={onAddFiles} />

      <div className="active-file-strip">
        {activeFile ? (
          <>
            <div>
              <span className="eyebrow">Aktif dosya</span>
              <h1>{activeFile.name}</h1>
              <p>
                {formatBytes(activeFile.size)} · {activeFile.sourceFormat.toUpperCase()}
              </p>
            </div>
            <button
              className="icon-button"
              type="button"
              title="Dosyayı kaldır"
              aria-label="Dosyayı kaldır"
              onClick={() => onRemoveFile(activeFile.id)}
            >
              <Trash2 size={18} />
            </button>
          </>
        ) : (
          <div>
            <span className="eyebrow">Aktif dosya</span>
            <h1>Dosya bekleniyor</h1>
            <p>100 MB altındaki desteklenen dosyaları ekle.</p>
          </div>
        )}
      </div>

      <div className="format-grid">
        <FormatSelect
          id="source-format"
          label="Kaynak"
          value={activeFile?.sourceFormat ?? ''}
          onChange={onSourceChange}
        />
        <FormatSelect
          id="target-format"
          label="Hedef"
          value={activeFile?.targetFormat ?? ''}
          onChange={onTargetChange}
        />
      </div>

      <div className={`pair-alert pair-alert--${mode}`}>
        <span>{pairMessage}</span>
      </div>

      <button className="primary-action" type="button" disabled={!canConvert} onClick={onConvert}>
        <Play size={18} />
        {isConverting ? 'Dönüştürülüyor' : 'Dönüştür'}
      </button>

      <section className="conversion-list" aria-label="Dönüşüm listesi">
        <div className="section-heading">
          <span className="eyebrow">İşlem durumu</span>
          <strong>{latestConversions.length ? 'Son dönüşümler' : 'Henüz işlem yok'}</strong>
        </div>

        {latestConversions.length ? (
          <div className="conversion-stack">
            {latestConversions.map((conversion) => (
              <article className="conversion-row" key={conversion.id}>
                <div className="conversion-row__top">
                  <div>
                    <strong>{conversion.fileName}</strong>
                    <span>
                      {conversion.sourceFormat.toUpperCase()} → {conversion.targetFormat.toUpperCase()} ·{' '}
                      {formatBytes(conversion.size)}
                    </span>
                  </div>
                  <StatusBadge status={conversion.status} />
                </div>
                <div className="progress-track" aria-label={`${conversion.progress}% ilerleme`}>
                  <span style={{ width: `${conversion.progress}%` }} />
                </div>
                <div className="conversion-row__bottom">
                  <small>{conversion.message ?? 'Queue ready'}</small>
                  <button
                    className="download-button"
                    type="button"
                    disabled={!conversion.downloadUrl}
                    onClick={() => onDownload(conversion)}
                  >
                    <Download size={15} />
                    İndir
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Dönüşüm başladığında burada progress ve çıktı görünecek.</p>
          </div>
        )}
      </section>
    </section>
  )
}
