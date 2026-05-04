export function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString()
}

export function formatLongDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateInput(date) {
  if (!date) return ''
  return new Date(date).toISOString().split('T')[0]
}
