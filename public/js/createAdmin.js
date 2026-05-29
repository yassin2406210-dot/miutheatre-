const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config()
 
const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true })
 
const User = mongoose.model('User', userSchema)
 
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const hash = await bcrypt.hash('Admin@1234', 10)
  await User.findOneAndUpdate(
    { email: 'admin@miuegypt.edu.eg' },
    { name: 'Admin', email: 'admin@miuegypt.edu.eg', password: hash, role: 'admin' },
    { upsert: true, new: true }
  )
  console.log('✅ Admin created!')
  console.log('Email:    admin@miuegypt.edu.eg')
  console.log('Password: Admin@1234')
  process.exit()
}).catch(e => { console.log('❌ Error:', e.message); process.exit() })
