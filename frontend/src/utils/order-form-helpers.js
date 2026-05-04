export function createEmptyBillingInfo() {
  return {
    label: '',
    customerName: '',
    address: '',
    postalCode: '',
    city: '',
    VATnr: '',
  }
}

export function createEmptyAddress() {
  return { name: '', street: '', number: '', postalCode: '', city: '' }
}

export function createEmptyCargo() {
  return {
    loadCarrierType: 'Pallet',
    quantity: 1,
    weight: 0,
    dimensions: { width: 0, length: 0, height: 0 },
  }
}

export function formatAddress(addr) {
  return `${addr.name}, ${addr.street} ${addr.number}, ${addr.postalCode} ${addr.city}`
}

/** Strip Mongoose billing subdocuments for POST — Joi rejects unknown keys (_id, __v). */
export function createOrderBillingPayload(billing) {
  if (!billing) return null
  const label = String(billing.label ?? '').trim() || 'default'
  const payload = {
    label,
    customerName: String(billing.customerName ?? '').trim(),
    address: String(billing.address ?? '').trim(),
    postalCode: String(billing.postalCode ?? '').trim(),
    city: String(billing.city ?? '').trim(),
    VATnr: billing.VATnr != null ? String(billing.VATnr).trim() : '',
  }
  if (typeof billing.isDefault === 'boolean') {
    payload.isDefault = billing.isDefault
  }
  return payload
}

/** Ensure cargo matches Joi.number() fields (HTML inputs may yield strings). */
export function normalizeCargoForApi(cargo) {
  const d = cargo.dimensions || {}
  return {
    loadCarrierType: String(cargo.loadCarrierType ?? '').trim(),
    quantity: Number(cargo.quantity),
    weight: Number(cargo.weight),
    dimensions: {
      width: Number(d.width),
      length: Number(d.length),
      height: Number(d.height),
    },
  }
}

export function shortAddress(addr) {
  if (!addr.city && !addr.street) return 'Not filled'
  return [addr.name, `${addr.postalCode} ${addr.city}`.trim()].filter(Boolean).join(' · ')
}

export function customerLabel(customer) {
  const company = customer.company?.companyName || customer.company
  return company ? `${customer.customerName} — ${company}` : customer.customerName
}

export function billingLabel(billing) {
  const tag = billing.label && billing.label !== 'default' ? `${billing.label} · ` : ''
  return `${tag}${billing.customerName} — ${billing.postalCode} ${billing.city}`
}

export function defaultBillingIndex(profiles) {
  if (!profiles || !profiles.length) return 0
  const idx = profiles.findIndex(b => b.isDefault)
  return idx >= 0 ? idx : 0
}

export function formatBillingLine(billing) {
  if (!billing) return 'Not selected'
  const who = billing.customerName || '—'
  const where = [billing.address, `${billing.postalCode} ${billing.city}`.trim()]
    .filter(Boolean)
    .join(', ')
  return where ? `${who} · ${where}` : who
}

export function totalCargoWeight(cargos = []) {
  return cargos.reduce(
    (sum, cargo) => sum + Number(cargo.quantity || 0) * Number(cargo.weight || 0),
    0,
  )
}
