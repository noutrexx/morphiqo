import { AlertTriangle, CheckCircle2, Clock3, Loader2, ServerCog, XCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ConversionStatus, UploadStatus } from '../types/converter'
import { Badge } from './ui/badge'

type BadgeStatus = ConversionStatus | UploadStatus

interface StatusBadgeProps {
  status: BadgeStatus
}

const labels: Record<BadgeStatus, string> = {
  ready: 'Ready',
  invalid: 'Invalid',
  queued: 'Queued',
  uploading: 'Uploading',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
  requires_server: 'Engine required',
}

const icons: Record<BadgeStatus, LucideIcon> = {
  ready: CheckCircle2,
  invalid: AlertTriangle,
  queued: Clock3,
  uploading: Loader2,
  processing: Loader2,
  completed: CheckCircle2,
  failed: XCircle,
  requires_server: ServerCog,
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const Icon = icons[status]

  return (
    <Badge className={`status-badge status-badge--${status}`} variant="secondary">
      <Icon size={14} />
      {labels[status]}
    </Badge>
  )
}
