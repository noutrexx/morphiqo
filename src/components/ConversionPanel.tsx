import { Play, Trash2 } from 'lucide-react'
import { ConversionQueue } from './ConversionQueue'
import { FileDropzone } from './FileDropzone'
import { FormatSelector } from './FormatSelector'
import { getConversionMode } from '../data/formats'
import type { ConversionJob, UploadedFileItem } from '../types/converter'
import { formatBytes } from '../utils/file'

interface ConversionPanelProps {
  activeFile?: UploadedFileItem
  canConvert: boolean
  jobs: ConversionJob[]
  isConverting: boolean
  pairMessage: string
  onAddFiles: (files: File[]) => void
  onConvertAll: () => void
  onConvert: () => void
  onDownload: (job: ConversionJob) => void
  onRemoveFile: (fileId: string) => void
  onRetry: (job: ConversionJob) => void
  onSourceChange: (format: string) => void
  onTargetChange: (format: string) => void
}

export function ConversionPanel({
  activeFile,
  canConvert,
  jobs,
  isConverting,
  pairMessage,
  onAddFiles,
  onConvertAll,
  onConvert,
  onDownload,
  onRemoveFile,
  onRetry,
  onSourceChange,
  onTargetChange,
}: ConversionPanelProps) {
  const mode = activeFile ? getConversionMode(activeFile.sourceFormat, activeFile.targetFormat) : 'invalid'

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
        <FormatSelector
          id="source-format"
          label="Kaynak"
          value={activeFile?.sourceFormat ?? ''}
          onChange={onSourceChange}
        />
        <FormatSelector
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
        {isConverting ? 'Kuyruk çalışıyor' : 'Seçili dosyayı dönüştür'}
      </button>

      <button className="secondary-action" type="button" disabled={isConverting} onClick={onConvertAll}>
        Tüm uygun dosyaları kuyruğa al
      </button>

      <ConversionQueue jobs={jobs} onDownload={onDownload} onRetry={onRetry} />
    </section>
  )
}
