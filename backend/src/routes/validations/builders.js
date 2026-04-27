const { celebrate, Segments } = require('celebrate')

const { objectIdParamsSchema } = require('../../lib/request-validation')

const normalizeParamKeys = paramKeys => (Array.isArray(paramKeys) ? paramKeys : [paramKeys])

const validateParams = (...paramKeys) =>
  celebrate({
    [Segments.PARAMS]: objectIdParamsSchema(...paramKeys),
  })

const validateBody = bodySchema =>
  celebrate({
    [Segments.BODY]: bodySchema,
  })

const validateParamsAndBody = (paramKeys, bodySchema) =>
  celebrate({
    [Segments.PARAMS]: objectIdParamsSchema(...normalizeParamKeys(paramKeys)),
    [Segments.BODY]: bodySchema,
  })

module.exports = {
  validateParams,
  validateBody,
  validateParamsAndBody,
}
