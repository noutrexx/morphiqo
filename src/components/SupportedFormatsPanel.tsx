import { FileType2, ServerCog, Sparkles } from 'lucide-react'
import { CONVERSION_ENGINES, FORMAT_GROUPS, getConversionMode, getConvertibleTargetFormats } from '../config/conversionRules'
import type { UploadedFileItem } from '../types/converter'
import { formatBytes } from '../utils/file'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'
import { Badge } from './ui/badge'
import { Card } from './ui/card'

interface SupportedFormatsPanelProps {
  activeFile?: UploadedFileItem
  pairMessage: string
}

const popularFormatGroups = ['Image', 'Document', 'Audio']

export function SupportedFormatsPanel({ activeFile, pairMessage }: SupportedFormatsPanelProps) {
  const mode = activeFile ? getConversionMode(activeFile.sourceFormat, activeFile.targetFormat) : 'idle'
  const visibleGroups = activeFile
    ? FORMAT_GROUPS.filter((group) => group.category === activeFile.category)
    : FORMAT_GROUPS.filter((group) => popularFormatGroups.includes(group.category))
  const compatibleTargets = activeFile ? getConvertibleTargetFormats(activeFile.sourceFormat) : []
  const detailMessage = activeFile ? pairMessage : 'Add a file to see compatible targets and engine routing.'

  return (
    <Card className="detail-panel" aria-label="Format categories and engine details">
      <section className="panel-section">
        <div className="section-heading">
          <span className="eyebrow">Flow summary</span>
          <strong>{activeFile?.category ?? 'Select a format'}</strong>
        </div>
        <div className={`detail-block detail-block--${mode}`}>
          <span className="detail-icon">
            {mode === 'server' ? <ServerCog size={18} /> : <Sparkles size={18} />}
          </span>
          <div>
            <strong>{detailMessage}</strong>
            <small>
              {activeFile
                ? `${formatBytes(activeFile.size)} - ${activeFile.sourceFormat.toUpperCase()} -> ${activeFile.targetFormat.toUpperCase()}`
                : 'Add a file first, then choose the target format.'}
            </small>
          </div>
        </div>
      </section>

      <section className="panel-section">
        <div className="section-heading">
          <span className="eyebrow">{activeFile ? 'Compatible targets' : 'Popular formats'}</span>
          <strong>
            {activeFile ? `${activeFile.sourceFormat.toUpperCase()} can convert to` : 'Most common'}
          </strong>
        </div>
        <div className="format-groups format-groups--compact">
          {activeFile ? (
            <article className="format-group" key={activeFile.id}>
              <div>
                <strong>{activeFile.sourceFormat.toUpperCase()}</strong>
                <span>{activeFile.category ? CONVERSION_ENGINES[activeFile.category] : 'Detected format'}</span>
              </div>
              <div className="format-chip-list" aria-label={`${activeFile.sourceFormat} convertible formats`}>
                {compatibleTargets.map((format) => (
                  <Badge className="format-chip" variant="outline" key={format}>
                    {format.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </article>
          ) : (
            visibleGroups.map((group) => (
              <article className="format-group" key={group.category}>
                <div>
                  <strong>{group.category}</strong>
                  <span>{CONVERSION_ENGINES[group.category]}</span>
                </div>
                <div className="format-chip-list" aria-label={`${group.category} formats`}>
                  {group.formats.slice(0, 8).map((format) => (
                    <Badge className="format-chip" variant="outline" key={format}>
                      {format.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {!activeFile ? (
        <Accordion className="format-matrix">
          <AccordionItem value="full-matrix">
            <AccordionTrigger className="format-matrix__trigger">
              <span>
                <FileType2 size={16} />
                Full format matrix
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="format-groups">
                {FORMAT_GROUPS.map((group) => (
                  <article className="format-group" key={group.category}>
                    <div>
                      <strong>{group.category}</strong>
                      <span>{CONVERSION_ENGINES[group.category]}</span>
                    </div>
                    <div className="format-chip-list" aria-label={`${group.category} formats`}>
                      {group.formats.map((format) => (
                        <Badge className="format-chip format-chip--muted" variant="outline" key={format}>
                          {format.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : null}
    </Card>
  )
}
