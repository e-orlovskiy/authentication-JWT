const bcrypt = require('bcrypt')
const uuid = require('uuid')

const userModel = require('../models/user-model')
const mailService = require('../service/mail-service')
const tokenService = require('../service/token-service')
const UserDto = require('../data-transfer-objects/user-dto')

class UserService {
  async registration(email, password) {
    const candidate = await userModel.findOne({ email })

    if (candidate) {
      throw new Error('Пользователь уже существует')
    }

    const hashPassword = await bcrypt.hash(password, 10)
    const activationLink = uuid.v4()

    const user = await userModel.create({ email, password: hashPassword, activationLink })
    await mailService.sendActivationMail(email, activationLink)

    const userDto = new UserDto(user) // id, mail, isActivated
    const tokens = tokenService.generateTokens({ ...userDto })
    await tokenService.saveToken(userDto.id, tokens.refreshToken) // сохраняем refreshToken в БД

    return {
      ...tokens,
      user: userDto
    }
  }
}

module.exports = new UserService()