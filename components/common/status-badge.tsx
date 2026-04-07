import { cn } from '@/lib/utils'
import type { LeadStatus, CommissionStatus } from '@/lib/types'
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, COMMISSION_STATUS_LABELS, COMMISSION_STATUS_COLORS } from '@/lib/constants'

interface LeadStatusBadgeProps {
  status: LeadStatus
  className?: string
}

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  const colors = LEAD_STATUS_COLORS[status]
  const label = LEAD_STATUS_LABELS[status]
  
  return (
    <span className={cn(
      'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold',
      'border shadow-sm',
      colors.bg,
      colors.text,
      colors.border,
      className
    )}>
      {label}
    </span>
  )
}

interface CommissionStatusBadgeProps {
  status: CommissionStatus
  className?: string
}

export function CommissionStatusBadge({ status, className }: CommissionStatusBadgeProps) {
  const colors = COMMISSION_STATUS_COLORS[status] || { bg: 'bg-gray-100', text: 'text-gray-700' }
  const label = COMMISSION_STATUS_LABELS[status] || status
  
  return (
    <span className={cn(
      'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold',
      'border shadow-sm',
      colors.bg,
      colors.text,
      className
    )}>
      {label}
    </span>
  )
}
