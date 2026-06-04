import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Loader2,
  ServerCog,
  XCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ConversionStatus, UploadStatus } from '../types/converter'

type BadgeStatus = ConversionStatus | UploadStatus

interface StatusBadgeProps {
  status: BadgeStatus
}

const labels: Record<BadgeStatus, string> = {
  ready: 'Ready',
  invalid: 'Invalid',
  queued: 'Queued',
  converting: 'Converting',
  success: 'Success',
  error: 'Error',
  'server-required': 'Server required',
}

const icons: Record<BadgeStatus, LucideIcon> = {
  ready: CheckCircle2,
  invalid: AlertTriangle,
  queued: Clock3,
  converting: Loader2,
  success: CheckCircle2,
  error: XCircle,
  'server-required': ServerCog,
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const Icon = icons[status]

  return (
    <span className={`status-badge status-badge--${status}`}>
      <Icon size={14} />
      {labels[status]}
    </span>
  )
}
