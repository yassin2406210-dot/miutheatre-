const mongoose = require('mongoose')

const deadlineSchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true }, // 'auditions' or 'scripts'
  date: { type: Date, required: true }
}, { timestamps: true })

module.exports = mongoose.model('Deadline', deadlineSchema)