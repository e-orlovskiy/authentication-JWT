class ApiError extends Error {
  status; // http статус ошибки
  errors; // 

  constructor(status, message, errors = []) {
    super(message) // вызываем конструктор родительского класса Error
    this.status = status // статус ошибки
    this.errors = errors // обрабатываемые ошибки
  }

  static UnauthorizedError() {
    return new ApiError(401, 'Пользователь не авторизован')
  }

  static BadRequest(message, errors = []) {
    return new ApiError(400, message, errors)
  }
}

module.exports = ApiError
