const router = require('express').Router()
const Contact = require('../models/contact')
const auth = require('../middleware/auth')
const adminOnly = require('../middleware/adminOnly')

// Submit message (public)
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body

    // Backend validation
    if (!firstName || !firstName.trim())
      return res.status(400).json({ error: 'First name is required' })
    if (!lastName || !lastName.trim())
      return res.status(400).json({ error: 'Last name is required' })
    if (!email || !email.trim())
      return res.status(400).json({ error: 'Email is required' })
    if (!email.toLowerCase().endsWith('@miuegypt.edu.eg'))
      return res.status(400).json({ error: 'MIU email only (@miuegypt.edu.eg)' })
    if (!subject || !subject.trim())
      return res.status(400).json({ error: 'Subject is required' })
    if (!message || !message.trim())
      return res.status(400).json({ error: 'Message is required' })
    if (message.trim().length < 10)
      return res.status(400).json({ error: 'Message must be at least 10 characters' })

    const msg = await Contact.create(req.body)
    res.json({ success: true, message: msg })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get all messages (admin only)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 })
    res.json(messages)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const msg = await Contact.findByIdAndDelete(req.params.id)
    if (!msg) return res.status(404).json({ error: 'Message not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
