const jwt = require('jsonwebtoken')
const TokenModel = require('../models/token-model')

class TokenService {

  generateTokens(payload) {
    const JWT_ACCESS_SECRET_KEY = process.env.JWT_ACCESS_SECRET
    const JWT_REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET

    const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET_KEY, { expiresIn: '15m' })
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET_KEY, { expiresIn: '30d' })

    return {
      accessToken,
      refreshToken
    }
  }
  // валидация access токена
  validateAccessToken(token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
      return userData
    }
    catch (err) {
      return null
    }
  }
  // валидация refresh токена
  validateRefreshToken(token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
      return userData
    }
    catch (err) {
      return null
    }
  }

  async saveToken(userId, refreshToken) {
    const tokenData = await TokenModel.findOne({ user: userId })
    if (tokenData) {
      tokenData.refreshToken = refreshToken
      return tokenData.save()
    }
    const token = await TokenModel.create({ user: userId, refreshToken })
    return token
  }

  async removeToken(refreshToken) {
    const tokenData = await TokenModel.deleteOne({ refreshToken })
    return tokenData
  }

  // поиск токена в БД
  async findToken(refreshToken) {
    const tokenData = await tokenModel.findOne({ refreshToken })
    return tokenData
  }
}

module.exports = new TokenService()