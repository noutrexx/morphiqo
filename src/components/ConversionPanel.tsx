import { ArrowRight, FileInput, FileOutput, Play, Trash2 } from 'lucide-react'
import { ConversionQueue } from './ConversionQueue'
import { FileDropzone } from './FileDropzone'
import { FormatSelector } from './FormatSelector'
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
  const statusMessage = activeFile ? pairMessage : 'Add a file to reveal compatible targets and engine status.'

  return (
    <Card className="converter-panel" aria-label="File conversion workspace">
      <div className="converter-panel__intro">
        <span className="eyebrow">Universal file converter</span>
        <h1>Convert files without the clutter.</h1>
        <p>Upload a file, choose the output format, and let Morphiqo handle the rest.</p>
      </div>

      <FileDropzone onAddFiles={onAddFiles} />

      {activeFile ? (
        <div className="active-file-strip">
          <div>
            <span className="eyebrow">Selected file</span>
            <strong>{activeFile.name}</strong>
            <p>{formatBytes(activeFile.size)}</p>
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
        </div>
      ) : null}

      {activeFile?.message ? (
        <div className="pair-alert pair-alert--invalid" role="status">
          <span>{activeFile.message}</span>
        </div>
      ) : null}

      <div className="format-flow" aria-label="Conversion formats">
        <div className="format-flow__field">
          <FileInput size={18} />
          <FormatSelector
            id="source-format"
            label="From"
            value={activeFile?.sourceFormat ?? ''}
            formats={activeFile?.sourceFormat ? [activeFile.sourceFormat] : []}
            disabled
            onChange={() => undefined}
          />
        </div>
        <span className="format-flow__arrow" aria-hidden="true">
          <ArrowRight size={20} />
        </span>
        <div className="format-flow__field">
          <FileOutput size={18} />
          <FormatSelector
            id="target-format"
            label="To"
            value={activeFile?.targetFormat ?? ''}
            formats={targetFormats}
            disabled={!activeFile}
            onChange={onTargetChange}
          />
        </div>
      </div>

      <div className={`pair-alert pair-alert--${mode}`} role="status">
        <span>{statusMessage}</span>
      </div>

      <Button className="primary-action" type="button" disabled={!canConvert} onClick={onConvert}>
        <Play size={18} />
        {isConverting ? 'Queue is running' : 'Convert selected file'}
      </Button>

      {canConvertAll && jobs.length > 0 ? (
        <Button className="secondary-action" variant="outline" type="button" onClick={onConvertAll}>
          {isConverting ? 'Queue is running' : 'Queue all valid files'}
        </Button>
      ) : null}

      {jobs.length > 0 ? <ConversionQueue jobs={jobs} onDownload={onDownload} onRetry={onRetry} /> : null}
    </Card>
  )
}
