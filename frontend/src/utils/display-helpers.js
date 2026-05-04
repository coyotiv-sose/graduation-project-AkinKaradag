export function formatDate(date, options) {
  if (!date) return '-'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return '-'
  return parsed.toLocaleDateString(undefined, options)
}

export function initials(value) {
  if (!value) return '?'
  const result = String(value)
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('')

  return result || '?'
}

export function orderBadgeClass(state) {
  return {
    PENDING: 'kl-badge kl-badge--warning',
    IN_PROCESS: 'kl-badge kl-badge--info',
    DELIVERED: 'kl-badge kl-badge--primary',
  }[state] || 'kl-badge kl-badge--muted'
}

export function vehicleBadgeClass(state) {
  return {
    AVAILABLE: 'kl-badge kl-badge--primary',
    ON_TOUR: 'kl-badge kl-badge--info',
    IN_GARAGE: 'kl-badge kl-badge--danger',
    DAMAGED: 'kl-badge kl-badge--danger',
    PARKED: 'kl-badge kl-badge--muted',
    SOLD: 'kl-badge kl-badge--muted',
  }[state] || 'kl-badge kl-badge--muted'
}

export function vehicleName(vehicle) {
  if (!vehicle) return ''
  return vehicle.name || [vehicle.brand, vehicle.model].filter(Boolean).join(' ')
}

export function tourBadgeClass(state) {
  return {
    PLANNED: 'kl-badge kl-badge--warning',
    STARTED: 'kl-badge kl-badge--info',
    FINISHED: 'kl-badge kl-badge--primary',
    CANCELLED: 'kl-badge kl-badge--danger',
  }[state] || 'kl-badge kl-badge--muted'
}
