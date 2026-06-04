import { UploadCloud } from 'lucide-react'
import { useRef, useState } from 'react'

interface FileDropzoneProps {
  onAddFiles: (files: File[]) => void
}

export function FileDropzone({ onAddFiles }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

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
        className="visually-hidden"
        type="file"
        multiple
        onChange={(event) => handleFiles(event.target.files)}
      />
      <button className="dropzone__button" type="button" onClick={() => inputRef.current?.click()}>
        <UploadCloud size={24} />
      </button>
      <div>
        <h2>Dosya yükle</h2>
        <p>Drag & drop veya seç</p>
      </div>
    </section>
  )
}
