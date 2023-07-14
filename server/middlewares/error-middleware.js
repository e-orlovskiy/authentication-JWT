const ApiError = require('../exceptions/api-error.js')

const errorMiddleware = (err, req, res, next) => {
  console.log(err)

  // если ошибка предусмотрена в ApiError и является инстансом ApiError
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message, errors: err.errors })
  }
  // если ошибка не была предусмотрена
  return res.status(500).json({ message: `Непредвиденная ошибка` })

}

module.exports = errorMiddleware