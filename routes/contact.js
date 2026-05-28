const router = require('express').Router()
const Contact = require('../models/Contact')
const auth = require('../middleware/auth')
const adminOnly = require('../middleware/adminOnly')

// Submit message (public)
router.post('/', async (req, res) => {
  try {
    const message = await Contact.create(req.body)
    res.json({ success: true, message })
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
    await Contact.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router