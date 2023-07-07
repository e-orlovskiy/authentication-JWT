const mongoose = require('mongoose')

const TokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  refreshToken: { type: String, required: true }
})

const Token = mongoose.model('Token', TokenSchema)

module.exports = Token