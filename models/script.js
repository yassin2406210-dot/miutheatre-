const mongoose = require('mongoose')

const scriptSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  email:       { type: String, required: true, lowercase: true, trim: true },
  title:       { type: String, required: true, trim: true },
  genre:       { type: String },
  language: { type: String },
  cast:     { type: String },
  description: { type: String },
  status:      { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  filePath:    { type: String },
  fileName:    { type: String }
}, { timestamps: true })

module.exports = mongoose.model('Script', scriptSchema)