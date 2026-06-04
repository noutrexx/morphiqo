import { StatusBadge } from './StatusBadge'
import type { ConversionJob, UploadedFileItem } from '../types/converter'

interface JobStatusBadgeProps {
  status: ConversionJob['status'] | UploadedFileItem['status']
}

export function JobStatusBadge({ status }: JobStatusBadgeProps) {
  return <StatusBadge status={status} />
}
