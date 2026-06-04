import { Download, RotateCcw } from 'lucide-react'
import { JobStatusBadge } from './JobStatusBadge'
import { ProgressBar } from './ProgressBar'
import { Button } from './ui/button'
import type { ConversionJob } from '../types/converter'
import { formatBytes } from '../utils/file'

interface ConversionQueueProps {
  jobs: ConversionJob[]
  onDownload: (job: ConversionJob) => void
  onRetry: (job: ConversionJob) => void
}

export function ConversionQueue({ jobs, onDownload, onRetry }: ConversionQueueProps) {
  const visibleJobs = jobs.slice(0, 6)

  return (
    <section className="conversion-list" aria-label="Conversion queue">
      <div className="section-heading">
        <span className="eyebrow">Queue</span>
        <strong>{visibleJobs.length ? 'Conversion jobs' : 'No jobs yet'}</strong>
      </div>

      {visibleJobs.length ? (
        <div className="conversion-stack">
          {visibleJobs.map((job) => (
            <article className="conversion-row" key={job.id}>
              <div className="conversion-row__top">
                <div>
                  <strong>{job.fileName}</strong>
                  <span>
                    {job.sourceFormat.toUpperCase()} {'->'} {job.targetFormat.toUpperCase()} - {formatBytes(job.size)}
                  </span>
                </div>
                <JobStatusBadge status={job.status} />
              </div>

              <ProgressBar value={job.progress} />

              <div className="conversion-row__bottom">
                <small>{job.message ?? 'Ready'}</small>
                <div className="row-actions">
                  {job.status === 'failed' ? (
                    <Button className="download-button" type="button" onClick={() => onRetry(job)}>
                      <RotateCcw size={15} />
                      Retry
                    </Button>
                  ) : (
                    <Button
                      className="download-button"
                      type="button"
                      disabled={job.status !== 'completed' || !job.downloadUrl}
                      onClick={() => onDownload(job)}
                    >
                      <Download size={15} />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state empty-state--soft">
          <p>Progress appears here when a conversion starts.</p>
        </div>
      )}
    </section>
  )
}
