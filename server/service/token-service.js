const jwt = require('jsonwebtoken')
const tokenModel = require('../models/token-model')

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

  async saveToken(userId, refreshToken) {
    const tokenData = await tokenModel.findOne({ user: userId })
    if (tokenData) {
      tokenData.refreshToken = refreshToken
      return tokenData.save()
    }
    const token = await tokenModel.create({ user: userId, refreshToken })
    return token
  }
}

module.exports = new TokenService()