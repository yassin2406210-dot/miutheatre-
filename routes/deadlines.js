const router = require('express').Router()
const Deadline = require('../models/deadline')
const auth = require('../middleware/auth')
const adminOnly = require('../middleware/adminOnly')

// Get all deadlines (public)
router.get('/', async (req, res) => {
  try {
    const deadlines = await Deadline.find()
    res.json(deadlines)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Set deadline (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const deadline = await Deadline.findOneAndUpdate(
      { type: req.body.type },
      { date: req.body.date },
      { upsert: true, new: true }
    )
    res.json(deadline)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Remove deadline (admin only)
router.delete('/:type', auth, adminOnly, async (req, res) => {
  try {
    await Deadline.findOneAndDelete({ type: req.params.type })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router