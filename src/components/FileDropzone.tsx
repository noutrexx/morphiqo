import { UploadCloud } from 'lucide-react'
import { useRef, useState } from 'react'
import conversionFlow from '../assets/conversion-flow.svg'
import { ALL_FORMATS } from '../data/formats'
import { Button } from './ui/button'

interface FileDropzoneProps {
  onAddFiles: (files: File[]) => void
}

export function FileDropzone({ onAddFiles }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const acceptedFormats = ALL_FORMATS.map((format) => `.${format}`).join(',')

  function handleFiles(files: FileList | null): void {
    if (!files?.length) {
      return
    }

    onAddFiles(Array.from(files))
  }

  return (
    <section
      className={`dropzone${isDragging ? ' dropzone--active' : ''}`}
      onDragEnter={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={(event) => {
        event.preventDefault()
        setIsDragging(false)
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        setIsDragging(false)
        handleFiles(event.dataTransfer.files)
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptedFormats}
        hidden
        multiple
        onChange={(event) => handleFiles(event.target.files)}
      />
      <Button
        className="dropzone__button"
        type="button"
        aria-label="Browse files"
        onClick={() => inputRef.current?.click()}
      >
        <UploadCloud size={19} />
        Choose file
      </Button>
      <div>
        <h2>Drop your file here</h2>
        <p>Drag and drop a file, or choose one from your device.</p>
        <div className="dropzone__meta" aria-label="Upload constraints">
          <span>Images</span>
          <span>Documents</span>
          <span>Media</span>
          <span>Archives</span>
        </div>
      </div>
      <img className="dropzone__visual" src={conversionFlow} alt="" aria-hidden="true" />
    </section>
  )
}
