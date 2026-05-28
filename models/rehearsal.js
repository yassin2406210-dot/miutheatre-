const mongoose = require('mongoose')

const rehearsalSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  date:  { type: Date },
  link:  { type: String, required: true, trim: true }
}, { timestamps: true })

module.exports = mongoose.model('Rehearsal', rehearsalSchema)