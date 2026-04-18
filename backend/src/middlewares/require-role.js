/* eslint-disable func-names */
function requireRole(...allowedRoles) {
  // eslint-disable-next-line consistent-return
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    next()
  }
}

module.exports = requireRole
