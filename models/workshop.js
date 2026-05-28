const mongoose = require('mongoose')

const workshopSchema = new mongoose.Schema({
  title:      { type: String, required: true, trim: true },
  date:       { type: Date, required: true },
  time:       { type: String },
  location:   { type: String },
  instructor: { type: String },
  maxSpots:   { type: Number, default: 20 },
  image:      { type: String },
  description:{ type: String },
  featured:   { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('Workshop', workshopSchema)