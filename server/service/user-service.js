const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mongoose = require('mongoose');

const UserModel = require('../models/user-model')
const TodosModel = require('../models/todos-model')
const mailService = require('../service/mail-service')
const tokenService = require('../service/token-service')
const UserDto = require('../data-transfer-objects/user-dto')
const ApiError = require('../exceptions/api-error')

class UserService {
  async registration(email, password) {
    const candidate = await UserModel.findOne({ email })

    if (candidate) {
      throw ApiError.BadRequest('Пользователь уже существует')
    }

    const hashPassword = await bcrypt.hash(password, 10)
    const activationLink = uuid.v4()

    const user = await UserModel.create({ email, password: hashPassword, activationLink })
    await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink} `)

    const userDto = new UserDto(user) // id, mail, isActivated
    const tokens = tokenService.generateTokens({ ...userDto })
    await tokenService.saveToken(userDto.id, tokens.refreshToken) // сохраняем refreshToken в БД

    return { ...tokens, user: userDto }
  }

  async activate(activationLink) {
    const user = await UserModel.findOne({ activationLink })
    if (!user) {
      throw ApiError.BadRequest('Некорректная ссылка активации!')
    }
    user.isActivated = true
    await user.save()
  }

  async login(email, password) {
    const user = await UserModel.findOne({ email })
    if (!user) {
      throw ApiError.BadRequest('Пользователь с таким email не найден')
    }
    // ! не пускать пользователя, который не активировал акк по email
    const isPassEquals = await bcrypt.compare(password, user.password)
    if (!isPassEquals) {
      throw ApiError.BadRequest('Неверный пароль')
    }
    const userDto = new UserDto(user)
    const tokens = tokenService.generateTokens({ ...userDto })

    await tokenService.saveToken(userDto.id, tokens.refreshToken)
    return { ...tokens, user: userDto }
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken)
    return token
  }

  async refresh(refreshToken) {
    // если пользователь не авторизован -> токена у него нет, сначала нужно авторизоваться!
    if (!refreshToken) {
      throw ApiError.UnauthorizedError()
    }

    const userData = await tokenService.validateRefreshToken(refreshToken)
    const tokenFromDB = await tokenService.findToken(refreshToken)
    if (!userData || !tokenFromDB) {
      throw ApiError.UnauthorizedError()
    }

    const user = await UserModel.findById(userData.id)
    const userDto = new UserDto(user)
    const tokens = tokenService.generateTokens({ ...userDto })

    await tokenService.saveToken(userDto.id, tokens.refreshToken)
    return { ...tokens, user: userDto }
  }

  async getTodos(userId) {
    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      throw ApiError.BadRequest('Такого пользователя не существует');
    }
    const todos = await TodosModel.find({ userId });

    return todos;
  }

  async addTodo(userId, text, done, date, favorite) {
    try {
      // Создаем новую задачу с помощью модели TodosModel
      const newTodo = new TodosModel({
        userId: new mongoose.Types.ObjectId(userId),
        text: text,
        done: done,
        date: date,
        favorite: favorite
      });

      const savedTodo = await newTodo.save();

      return savedTodo; // Возвращаем сохраненную задачу
    } catch (error) {
      throw new Error('Не удалось добавить задачу: ' + error.message);
    }
  }

}

module.exports = new UserService()