const FALLBACK_BADGE = 'kl-badge kl-badge--muted'
const ORDER_FALLBACK_BADGE = 'kl-badge kl-badge--warning'

const ORDER_BADGE_MAP = {
  PENDING: 'kl-badge kl-badge--warning',
  IN_PROCESS: 'kl-badge kl-badge--info',
  DELIVERED: 'kl-badge kl-badge--primary',
}

const TOUR_BADGE_MAP = {
  PLANNED: 'kl-badge kl-badge--warning',
  STARTED: 'kl-badge kl-badge--info',
  FINISHED: 'kl-badge kl-badge--primary',
  CANCELLED: 'kl-badge kl-badge--danger',
}

const VEHICLE_BADGE_MAP = {
  AVAILABLE: 'kl-badge kl-badge--primary',
  ON_TOUR: 'kl-badge kl-badge--info',
  IN_GARAGE: 'kl-badge kl-badge--danger',
  DAMAGED: 'kl-badge kl-badge--danger',
  PARKED: 'kl-badge kl-badge--muted',
  SOLD: 'kl-badge kl-badge--muted',
}

export function orderBadgeClass(state) {
  return ORDER_BADGE_MAP[state] || ORDER_FALLBACK_BADGE
}

export function tourBadgeClass(state) {
  return TOUR_BADGE_MAP[state] || FALLBACK_BADGE
}

export function vehicleBadgeClass(state) {
  return VEHICLE_BADGE_MAP[state] || FALLBACK_BADGE
}
