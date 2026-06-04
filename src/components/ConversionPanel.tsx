import { Archive, FileImage, FileText, FileType2, Music, Play, Presentation, Table2, Trash2, Video } from 'lucide-react'
import formatConstellation from '../assets/format-constellation.svg'
import { ConversionQueue } from './ConversionQueue'
import { FileDropzone } from './FileDropzone'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { getConversionMode, getConvertibleTargetFormats } from '../data/formats'
import type { ConversionJob, UploadedFileItem } from '../types/converter'
import { formatBytes } from '../utils/file'

interface ConversionPanelProps {
  activeFile?: UploadedFileItem
  canConvertAll: boolean
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
  onTargetChange: (format: string) => void
}

const previewFormats = ['pdf', 'docx', 'txt', 'png', 'jpg', 'webp']

function getFormatIcon(format: string) {
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tiff', 'avif', 'ico'].includes(format)) {
    return <FileImage size={16} />
  }

  if (['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'].includes(format)) {
    return <Music size={16} />
  }

  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(format)) {
    return <Video size={16} />
  }

  if (['zip', '7z', 'tar', 'rar'].includes(format)) {
    return <Archive size={16} />
  }

  if (['xlsx', 'xls', 'csv'].includes(format)) {
    return <Table2 size={16} />
  }

  if (['pptx', 'ppt'].includes(format)) {
    return <Presentation size={16} />
  }

  if (['txt', 'md', 'rtf', 'html'].includes(format)) {
    return <FileText size={16} />
  }

  return <FileType2 size={16} />
}

export function ConversionPanel({
  activeFile,
  canConvertAll,
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
  onTargetChange,
}: ConversionPanelProps) {
  const mode = activeFile ? getConversionMode(activeFile.sourceFormat, activeFile.targetFormat) : 'idle'
  const targetFormats = activeFile ? getConvertibleTargetFormats(activeFile.sourceFormat) : []
  const displayFormats = activeFile ? targetFormats.slice(0, 12) : previewFormats
  const statusMessage = activeFile ? pairMessage : 'Add a file to reveal compatible targets and engine status.'

  return (
    <Card className="converter-panel" aria-label="File conversion workspace">
      <FileDropzone onAddFiles={onAddFiles} />

      <section className="target-format-section" aria-label="Target formats">
        <img className="target-format-visual" src={formatConstellation} alt="" aria-hidden="true" />
        <div className="section-heading section-heading--center">
          <span className="eyebrow">Target formats</span>
          <strong>{activeFile ? 'Choose the output format' : 'Select a file to activate targets'}</strong>
        </div>
        <div className="target-format-grid">
          {displayFormats.map((format) => {
            const isSelected = activeFile?.targetFormat === format

            return (
              <Button
                className={`target-format-option${isSelected ? ' target-format-option--selected' : ''}`}
                variant="outline"
                type="button"
                disabled={!activeFile}
                aria-pressed={isSelected}
                key={format}
                onClick={() => onTargetChange(format)}
              >
                <span className="target-format-icon">{getFormatIcon(format)}</span>
                <span>{format.toUpperCase()}</span>
              </Button>
            )
          })}
        </div>
      </section>

      <div className={`active-file-strip${activeFile ? '' : ' active-file-strip--empty'}`}>
        {activeFile ? (
          <>
            <div>
              <span className="eyebrow">Active file</span>
              <h1>{activeFile.name}</h1>
              <p>
                {formatBytes(activeFile.size)} - {activeFile.sourceFormat.toUpperCase()}
              </p>
            </div>
            <Button
              className="icon-button"
              variant="ghost"
              size="icon"
              type="button"
              title="Remove file"
              aria-label="Remove file"
              onClick={() => onRemoveFile(activeFile.id)}
            >
              <Trash2 size={18} />
            </Button>
          </>
        ) : (
          <div>
            <span className="eyebrow">Workspace summary</span>
            <h1>Waiting for a file</h1>
            <p>Add a supported file to unlock conversion targets.</p>
          </div>
        )}
      </div>

      {activeFile?.message ? (
        <div className="pair-alert pair-alert--invalid" role="status">
          <span>{activeFile.message}</span>
        </div>
      ) : null}

      <div className="format-grid">
        <div className="detected-format" aria-live="polite">
          <span>Source</span>
          <strong>{activeFile?.sourceFormat ? activeFile.sourceFormat.toUpperCase() : 'Waiting for a file'}</strong>
          <small>Detected automatically from the file extension.</small>
        </div>
        <div className="detected-format" aria-live="polite">
          <span>Target</span>
          <strong>{activeFile?.targetFormat ? activeFile.targetFormat.toUpperCase() : 'Not selected'}</strong>
          <small>{activeFile ? 'Choose one of the compatible output formats above.' : 'Upload a file to activate these targets.'}</small>
        </div>
      </div>

      <div className={`pair-alert pair-alert--${mode}`} role="status">
        <span>{statusMessage}</span>
      </div>

      <Button className="primary-action" type="button" disabled={!canConvert} onClick={onConvert}>
        <Play size={18} />
        {isConverting ? 'Queue is running' : 'Convert selected file'}
      </Button>

      <Button className="secondary-action" variant="outline" type="button" disabled={!canConvertAll} onClick={onConvertAll}>
        {isConverting ? 'Queue is running' : 'Queue all valid files'}
      </Button>

      <ConversionQueue jobs={jobs} onDownload={onDownload} onRetry={onRetry} />
    </Card>
  )
}
