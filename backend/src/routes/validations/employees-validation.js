const { validateParams } = require('./builders')

const validateEmployeeIdParam = validateParams('employeeId')

module.exports = {
  validateEmployeeIdParam,
}
