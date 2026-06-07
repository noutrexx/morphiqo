import type { MouseEvent } from 'react'
import {
  ArrowDownToLine,
  Blocks,
  CheckCircle2,
  Cpu,
  FileImage,
  FileStack,
  FileText,
  Gauge,
  GitBranch,
  Layers3,
  LockKeyhole,
  ServerCog,
  ShieldCheck,
  Sparkles,
  UserRound,
  Workflow,
  Zap,
} from 'lucide-react'
import { ConversionPanel } from './components/ConversionPanel'
import { ConversionHistory } from './components/ConversionHistory'
import { SupportedFormatsPanel } from './components/SupportedFormatsPanel'
import { Badge } from './components/ui/badge'
import { Card } from './components/ui/card'
import { useConversionManager } from './hooks/useConversionManager'
import engineMatrix from './assets/engine-matrix.svg'
import engineNetwork from './assets/engine-network.webp'
import conversionPortal from './assets/conversion-portal.webp'
import morphiqoMark from './assets/morphiqo-mark.svg'
import './App.css'

const coreSystems = [
  {
    icon: Blocks,
    title: 'Smart engine routing',
    meta: 'Sharp / FFmpeg / LibreOffice / Pandoc / 7zip',
    text: 'Each file family is routed to the right local engine, with visible job state, errors, and output handling.',
  },
  {
    icon: GitBranch,
    title: 'Portfolio-ready product',
    meta: '@noutrexx',
    text: 'Built as a full-stack product piece with interface polish, backend routing, engine readiness, and conversion history.',
    href: 'https://github.com/noutrexx',
  },
  {
    icon: UserRound,
    title: 'Creator signature',
    meta: 'Designed by noutrexx',
    text: 'A focused local tool with a premium surface, practical engineering choices, and a clear upload-to-download flow.',
  },
]

const productMetrics = [
  { value: '100 MB', label: 'safe per-file limit' },
  { value: '12', label: 'recent jobs stored locally' },
  { value: '6+', label: 'engine families ready' },
]

const workflowSteps = [
  {
    icon: FileStack,
    title: 'Drop a file',
    text: 'Add images, documents, media, spreadsheets, presentations, or archives into one focused workspace.',
  },
  {
    icon: Sparkles,
    title: 'Pick a compatible target',
    text: 'Morphiqo detects the source format and only reveals valid output choices for that file.',
  },
  {
    icon: Workflow,
    title: 'Run the queue',
    text: 'Convert one file or queue every valid file while progress, retry, and server-required states stay visible.',
  },
  {
    icon: ArrowDownToLine,
    title: 'Download the result',
    text: 'Completed outputs are isolated, safely named, and available from local conversion history.',
  },
]

const audienceCards = [
  {
    title: 'Designers',
    text: 'Move quickly between PNG, JPG, and WebP without leaving the creative workflow.',
  },
  {
    title: 'Students',
    text: 'Turn PDF notes into TXT, Markdown, HTML, or DOCX for cleaner study material.',
  },
  {
    title: 'Builders',
    text: 'Use the backend-ready conversion pipeline as a foundation for workers, storage, and broader engines.',
  },
]

const faqItems = [
  {
    question: 'Does Morphiqo work locally?',
    answer: 'Yes. The interface runs in the browser, and the Express backend handles server-side conversion jobs locally.',
  },
  {
    question: 'Which conversions are strongest right now?',
    answer: 'Sharp-backed image conversions and PDF text extraction paths are active; optional engines expand media, document, and archive support.',
  },
  {
    question: 'Why do some pairs require the server?',
    answer: 'Some formats need local tools such as FFmpeg, LibreOffice, Pandoc, ImageMagick, or 7zip, so Morphiqo marks that requirement clearly.',
  },
]

const formatFamilies = [
  { icon: FileImage, title: 'Images', formats: 'PNG / JPG / WebP', text: 'Convert visual files with a fast, clean output flow.' },
  { icon: FileText, title: 'Documents', formats: 'PDF / DOCX / MD', text: 'Move notes, reports, and documents into readable formats.' },
  { icon: Cpu, title: 'Media', formats: 'FFmpeg ready', text: 'Keep engine readiness visible for video and audio operations.' },
  { icon: Blocks, title: 'Archives', formats: 'ZIP / 7z / TAR', text: 'Make archive engine requirements clear before users commit.' },
]

function ProductPreview() {
  return (
    <aside className="product-preview" aria-label="Morphiqo product preview">
      <div className="preview-topline">
        <span>Live workspace</span>
        <strong>92% ready</strong>
      </div>
      <div className="preview-window">
        <div className="preview-rail" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className="preview-main">
          <div className="preview-drop">
            <Sparkles size={18} />
            <strong>campaign-cover.png</strong>
            <span>PNG detected</span>
          </div>
          <div className="preview-targets" aria-label="Preview target formats">
            <span className="is-active">WEBP</span>
            <span>JPG</span>
            <span>PDF</span>
          </div>
          <div className="preview-progress">
            <span></span>
          </div>
        </div>
      </div>
      <div className="preview-proof">
        <span>
          <ShieldCheck size={16} />
          Local history
        </span>
        <span>
          <Gauge size={16} />
          Fast queue
        </span>
      </div>
    </aside>
  )
}

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
            <span>Local conversion workspace</span>
          </div>
        </div>
        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#convert" onClick={(event) => scrollToSection(event, 'convert')}>
            Converter
          </a>
          <a href="#workspace" onClick={(event) => scrollToSection(event, 'workspace')}>
            Workspace
          </a>
          <a href="#product" onClick={(event) => scrollToSection(event, 'product')}>
            Product
          </a>
          <a href="#systems" onClick={(event) => scrollToSection(event, 'systems')}>
            Systems
          </a>
        </nav>
        <a className="mobile-convert-link" href="#workspace-panel" onClick={(event) => scrollToSection(event, 'workspace-panel')}>
          Convert now
        </a>
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
        <section className="converter-first-section" id="convert">
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

        <section className="product-story-section" id="product" aria-label="Morphiqo product story">
          <img className="section-art section-art--portal" src={conversionPortal} alt="" aria-hidden="true" />
          <div className="hero-copy">
            <span className="hero-kicker">
              <Zap size={16} />
              Premium local conversion workspace
            </span>
            <h1>Clean queue. Smart targets. Local-first control.</h1>
            <p>
              Morphiqo turns file conversion into a product-grade workflow: upload, detect, route, convert, retry, and
              download without losing sight of engine status or output history.
            </p>
            <div className="hero-actions">
              <a className="hero-action hero-action--primary" href="#workspace-panel" onClick={(event) => scrollToSection(event, 'workspace-panel')}>
                Open converter
              </a>
              <a className="hero-action hero-action--secondary" href="#systems" onClick={(event) => scrollToSection(event, 'systems')}>
                View engine matrix
              </a>
            </div>
            <div className="product-metrics" aria-label="Morphiqo product metrics">
              {productMetrics.map((metric) => (
                <div key={metric.label}>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>
          </div>
          <ProductPreview />
        </section>

        <section className="workflow-section" aria-label="Conversion workflow">
          <div className="section-title">
            <span className="eyebrow">Workflow</span>
            <h2>Everything important stays visible from upload to output.</h2>
          </div>
          <div className="workflow-grid">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon

              return (
                <Card className="workflow-card" key={step.title}>
                  <span className="workflow-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="feature-icon">
                    <Icon size={20} />
                  </span>
                  <strong>{step.title}</strong>
                  <p>{step.text}</p>
                </Card>
              )
            })}
          </div>
        </section>

        <section className="systems-section" id="systems" aria-label="Core systems and profile">
          <img className="section-art section-art--network" src={engineNetwork} alt="" aria-hidden="true" />
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
                  Sharp, FFmpeg, LibreOffice, Pandoc, ImageMagick, and 7zip create a practical engine map for image,
                  media, document, and archive conversion paths.
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

        <section className="format-family-section" aria-label="Format family overview">
          <div className="section-title">
            <span className="eyebrow">Format families</span>
            <h2>Supported areas read like product capabilities, not a dry technical list.</h2>
          </div>
          <div className="format-family-grid">
            {formatFamilies.map((family) => {
              const Icon = family.icon

              return (
                <Card className="format-family-card" key={family.title}>
                  <span className="feature-icon">
                    <Icon size={20} />
                  </span>
                  <span className="eyebrow">{family.formats}</span>
                  <strong>{family.title}</strong>
                  <p>{family.text}</p>
                </Card>
              )
            })}
          </div>
        </section>

        <section className="audience-section" aria-label="Who Morphiqo is for">
          <div className="section-title">
            <span className="eyebrow">Use cases</span>
            <h2>Built for people who need fewer tabs and cleaner output control.</h2>
          </div>
          <div className="audience-grid">
            {audienceCards.map((card) => (
              <Card className="audience-card" key={card.title}>
                <span className="feature-icon">
                  <Layers3 size={20} />
                </span>
                <strong>{card.title}</strong>
                <p>{card.text}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="proof-section" aria-label="Product proof">
          <Card className="proof-card">
            <span className="feature-icon">
              <CheckCircle2 size={20} />
            </span>
            <div>
              <span className="eyebrow">Product signal</span>
              <strong>Morphiqo can stay tool-first while still reading like a complete local conversion product.</strong>
              <p>
                The converter remains the first experience. The product story, engine proof, and trust signals live
                below it where they support the workflow instead of blocking it.
              </p>
            </div>
          </Card>
        </section>

        <section className="faq-section" id="faq" aria-label="Frequently asked questions">
          <div className="section-title">
            <span className="eyebrow">FAQ</span>
            <h2>Clear answers before someone tries the app.</h2>
          </div>
          <div className="faq-grid">
            {faqItems.map((item) => (
              <Card className="faq-card" key={item.question}>
                <span className="feature-icon">
                  <LockKeyhole size={20} />
                </span>
                <strong>{item.question}</strong>
                <p>{item.answer}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span>Morphiqo</span>
        <p>Premium local conversion workspace for documents, media, images, and archives.</p>
        <a href="https://github.com/noutrexx" target="_blank" rel="noreferrer">
          noutrexx on GitHub
        </a>
      </footer>
    </div>
  )
}
