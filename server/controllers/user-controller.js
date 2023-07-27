const ApiError = require('../exceptions/api-error')
const userService = require('../service/user-service')
const { validationResult } = require('express-validator')


class UserController {

  async registration(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }
      const { email, password } = req.body
      const userData = await userService.registration(email, password)
      res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
      return res.json(userData)
    } catch (err) {
      next(err)
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body
      const userData = await userService.login(email, password)
      res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
      return res.json(userData)
    } catch (err) {
      next(err)
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies
      const token = await userService.logout(refreshToken)
      res.clearCookie('refreshToken')
      return res.json(token)
    } catch (err) {
      next(err)
    }
  }

  async activate(req, res, next) {
    try {
      const activationLink = req.params.link
      await userService.activate(activationLink)
      return res.redirect(process.env.CLIENT_URL) // после перехода пользотвалем по ссылке редирект к хоум страничке
    } catch (err) {
      next(err)
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies
      const userData = await userService.refresh(refreshToken)
      res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
      return res.json(userData)
    } catch (err) {
      next(err)
    }
  }

  async getTodos(req, res, next) {
    try {
      const { userId } = req.body
      const todos = await userService.getTodos(userId)
      return res.json(todos)
    } catch (err) {
      next(err)
    }
  }

  async addNewTodo(req, res, next) {
    try {
      const { userId, text, done, date, favorite } = req.body

      const newTodo = await userService.addTodo(userId, text, done, date, favorite);
      console.log("Добавлена новая задача:", newTodo);
      return res.json(newTodo)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new UserController()