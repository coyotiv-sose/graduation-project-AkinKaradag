const pickAllowedFields = (payload, allowedFields) =>
  Object.fromEntries(Object.entries(payload || {}).filter(([key]) => allowedFields.includes(key)))

module.exports = {
  pickAllowedFields,
}
