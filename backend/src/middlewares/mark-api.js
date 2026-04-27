const markApi = (req, res, next) => {
  req.isApi = true
  next()
}

module.exports = markApi
