const mongoose = require('mongoose')

const exitSchema = new mongoose.Schema({
  name:   { type: String, required: true, trim: true },
  email:  { type: String, required: true, lowercase: true, trim: true },
  reason: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true })

module.exports = mongoose.model('ExitInterview', exitSchema)