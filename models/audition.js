const mongoose = require('mongoose')

const auditionSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, lowercase: true, trim: true },
  phone:      { type: String, trim: true },
  year:       { type: String },
  major:      { type: String },
  experience: { type: String },
  whyJoin:    { type: String },
  status:     { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true })

module.exports = mongoose.model('Audition', auditionSchema)