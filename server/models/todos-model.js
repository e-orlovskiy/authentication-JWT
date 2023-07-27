const mongoose = require('mongoose')

const TodosSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // id: { type: String, unique: true, required: true }, // uuid
  text: { type: String, required: true },
  done: { type: Boolean, default: false },
  date: { type: Date },
  favorite: { type: Boolean, default: false },
})

const Todos = mongoose.model('Todo', TodosSchema)

module.exports = Todos