import { Cpu, Gauge, ShieldCheck } from 'lucide-react'
import { ConversionPanel } from './components/ConversionPanel'
import { FormatReference } from './components/FormatReference'
import { Sidebar } from './components/Sidebar'
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
        <Sidebar
          activeFileId={converter.activeFileId}
          conversions={converter.conversions}
          files={converter.files}
          onClearHistory={converter.clearHistory}
          onDownload={converter.downloadConversion}
          onSelectFile={converter.selectFile}
        />
        <ConversionPanel
          activeFile={converter.activeFile}
          canConvert={converter.canConvert}
          conversions={converter.conversions}
          isConverting={converter.isConverting}
          onAddFiles={converter.addFiles}
          onConvert={converter.convertActiveFile}
          onDownload={converter.downloadConversion}
          onRemoveFile={converter.removeFile}
          onSourceChange={converter.updateActiveSource}
          onTargetChange={converter.updateActiveTarget}
          pairMessage={converter.pairMessage}
        />
        <FormatReference activeFile={converter.activeFile} pairMessage={converter.pairMessage} />
      </main>
    </div>
  )
}
