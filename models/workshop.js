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
  featured:   { type: Boolean, default: false },
  joinedUsers: [{
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:      { type: String, required: true, trim: true },
    email:     { type: String, required: true, lowercase: true, trim: true },
    studentId: { type: String, required: true, trim: true },
    faculty:   { type: String, trim: true },
    joinedAt:  { type: Date, default: Date.now }
  }]
}, { timestamps: true })

module.exports = mongoose.model('Workshop', workshopSchema)