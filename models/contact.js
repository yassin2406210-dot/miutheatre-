const mongoose = require('mongoose')

const contactSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, trim: true },
  email:     { type: String, required: true, lowercase: true, trim: true },
  subject:   { type: String },
  message:   { type: String, required: true }
}, { timestamps: true })

module.exports = mongoose.model('Contact', contactSchema)