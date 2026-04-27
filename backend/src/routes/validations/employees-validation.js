const { validateParams } = require('../../lib/validation/celebrate-builders')

const validateEmployeeIdParam = validateParams('employeeId')

module.exports = {
  validateEmployeeIdParam,
}
