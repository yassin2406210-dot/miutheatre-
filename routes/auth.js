const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!email.endsWith('@miuegypt.edu.eg'))
      return res.status(400).json({ error: 'MIU email only' })
    const exists = await User.findOne({ email })
    if (exists)
      return res.status(400).json({ error: 'Email already registered' })
    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hashed })
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({ token, name: user.name, email: user.email, role: user.role })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user)
      return res.status(400).json({ error: 'Email not found' })
    const match = await bcrypt.compare(password, user.password)
    if (!match)
      return res.status(400).json({ error: 'Wrong password' })
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({ token, name: user.name, email: user.email, role: user.role })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
const auth = require('../middleware/auth')
const adminOnly = require('../middleware/adminOnly')

router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})



module.exports = router