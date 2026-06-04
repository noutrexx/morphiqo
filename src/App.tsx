import type { MouseEvent } from 'react'
import { Blocks, Cpu, Gauge, GitBranch, ServerCog, ShieldCheck, UserRound } from 'lucide-react'
import { ConversionPanel } from './components/ConversionPanel'
import { ConversionHistory } from './components/ConversionHistory'
import { SupportedFormatsPanel } from './components/SupportedFormatsPanel'
import { Badge } from './components/ui/badge'
import { Card } from './components/ui/card'
import { useConversionManager } from './hooks/useConversionManager'
import engineMatrix from './assets/engine-matrix.svg'
import morphiqoMark from './assets/morphiqo-mark.svg'
import './App.css'

const coreSystems = [
  {
    icon: Blocks,
    title: 'Conversion engines',
    meta: 'Sharp / FFmpeg / LibreOffice / Pandoc / 7zip',
    text: 'Routes each file category to the right local engine with clear progress and output handling.',
  },
  {
    icon: GitBranch,
    title: 'GitHub profile',
    meta: '@noutrexx',
    text: 'Project work, experiments, and engineering progress are collected under the noutrexx GitHub profile.',
    href: 'https://github.com/noutrexx',
  },
  {
    icon: UserRound,
    title: 'About me',
    meta: 'noutrexx signature',
    text: 'Designed and engineered by noutrexx with a focus on sharp interfaces, practical local tooling, and reliable conversion flows.',
  },
]

export function App() {
  const converter = useConversionManager()

  const scrollToSection = (event: MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    event.preventDefault()

    const section = document.getElementById(sectionId)
    if (!section) {
      return
    }

    section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.replaceState(null, '', `#${sectionId}`)
  }

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand-lockup" aria-label="Morphiqo">
          <span className="brand-mark">
            <img src={morphiqoMark} alt="" aria-hidden="true" />
          </span>
          <div>
            <strong>Morphiqo</strong>
            <span>File conversion workspace</span>
          </div>
        </div>
        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#convert" onClick={(event) => scrollToSection(event, 'convert')}>
            Convert
          </a>
          <a href="#workspace" onClick={(event) => scrollToSection(event, 'workspace')}>
            Workspace
          </a>
          <a href="#systems" onClick={(event) => scrollToSection(event, 'systems')}>
            Systems
          </a>
        </nav>
        <div className="signal-strip" aria-label="Application capabilities">
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
            Local engines
          </span>
        </div>
      </header>

      <main>
        <section className="hero-section" id="convert">
          <div className="converter-stage" id="workspace-panel">
            <ConversionPanel
              activeFile={converter.activeFile}
              canConvertAll={converter.canConvertAll}
              canConvert={converter.canConvert}
              jobs={converter.jobs}
              isConverting={converter.isConverting}
              onAddFiles={converter.addFiles}
              onConvertAll={converter.convertAllFiles}
              onConvert={converter.convertActiveFile}
              onDownload={converter.downloadConversion}
              onRemoveFile={converter.removeFile}
              onRetry={converter.retryJob}
              onTargetChange={converter.updateActiveTarget}
              pairMessage={converter.pairMessage}
            />

            <div className="workspace-grid" id="workspace">
              <SupportedFormatsPanel activeFile={converter.activeFile} pairMessage={converter.pairMessage} />
              <ConversionHistory
                activeFileId={converter.activeFileId}
                files={converter.files}
                jobs={converter.jobs}
                onClearHistory={converter.clearHistory}
                onDownload={converter.downloadConversion}
                onSelectFile={converter.selectFile}
              />
            </div>
          </div>
        </section>

        <section className="systems-section" id="systems" aria-label="Core systems and profile">
          <div className="section-title">
            <span className="eyebrow">Core Systems</span>
            <h2>Engine-backed conversion with a focused product workflow.</h2>
          </div>
          <div className="system-grid">
            <Card className="system-card system-card--wide">
              <span className="feature-icon">
                <ServerCog size={20} />
              </span>
              <div>
                <strong>Engine matrix</strong>
                <p>
                  ImageMagick, Sharp, FFmpeg, LibreOffice, Pandoc, and 7zip power image, media, document, and archive
                  conversions with explicit job states.
                </p>
              </div>
              <img className="system-visual" src={engineMatrix} alt="Conversion engine matrix" />
              <div className="engine-list" aria-label="Connected engines">
                <Badge variant="outline">Sharp</Badge>
                <Badge variant="outline">ImageMagick</Badge>
                <Badge variant="outline">FFmpeg</Badge>
                <Badge variant="outline">LibreOffice</Badge>
                <Badge variant="outline">Pandoc</Badge>
                <Badge variant="outline">7zip</Badge>
              </div>
            </Card>

            {coreSystems.map((system) => {
              const Icon = system.icon
              const content = (
                <>
                  <span className="feature-icon">
                    <Icon size={20} />
                  </span>
                  <span className="eyebrow">{system.meta}</span>
                  <strong>{system.title}</strong>
                  <p>{system.text}</p>
                </>
              )

              return system.href ? (
                <a
                  className="system-card system-card--link"
                  href={system.href}
                  key={system.title}
                  target="_blank"
                  rel="noreferrer"
                >
                  {content}
                  <span className="system-card__cta">Open GitHub</span>
                </a>
              ) : (
                <Card className="system-card" key={system.title}>
                  {content}
                </Card>
              )
            })}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span>Morphiqo</span>
        <p>Premium local conversion workspace for documents, media, and archives.</p>
        <a href="https://github.com/noutrexx" target="_blank" rel="noreferrer">
          noutrexx on GitHub
        </a>
      </footer>
    </div>
  )
}
