import { Cpu, Gauge, ShieldCheck } from 'lucide-react'
import { ConversionPanel } from './components/ConversionPanel'
import { ConversionHistory } from './components/ConversionHistory'
import { SupportedFormatsPanel } from './components/SupportedFormatsPanel'
import { useConversionManager } from './hooks/useConversionManager'
import './App.css'

export function App() {
  const converter = useConversionManager()

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand-lockup" aria-label="Morphiqo">
          <span className="brand-mark">M</span>
          <div>
            <strong>Morphiqo</strong>
            <span>File converter</span>
          </div>
        </div>
        <div className="signal-strip" aria-label="Uygulama özellikleri">
          <span>
            <Gauge size={16} />
            Fast queue
          </span>
          <span>
            <ShieldCheck size={16} />
            100 MB limit
          </span>
          <span>
            <Cpu size={16} />
            Canvas ready
          </span>
        </div>
      </header>

      <main className="workspace-grid">
        <ConversionHistory
          activeFileId={converter.activeFileId}
          files={converter.files}
          jobs={converter.jobs}
          onClearHistory={converter.clearHistory}
          onDownload={converter.downloadConversion}
          onSelectFile={converter.selectFile}
        />
        <ConversionPanel
          activeFile={converter.activeFile}
          canConvert={converter.canConvert}
          jobs={converter.jobs}
          isConverting={converter.isConverting}
          onAddFiles={converter.addFiles}
          onConvertAll={converter.convertAllFiles}
          onConvert={converter.convertActiveFile}
          onDownload={converter.downloadConversion}
          onRemoveFile={converter.removeFile}
          onRetry={converter.retryJob}
          onSourceChange={converter.updateActiveSource}
          onTargetChange={converter.updateActiveTarget}
          pairMessage={converter.pairMessage}
        />
        <SupportedFormatsPanel activeFile={converter.activeFile} pairMessage={converter.pairMessage} />
      </main>
    </div>
  )
}
