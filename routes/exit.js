const router = require('express').Router()
const ExitInterview = require('../models/ExitInterview')
const auth = require('../middleware/auth')
const adminOnly = require('../middleware/adminOnly')

// Submit exit request (public)
router.post('/', async (req, res) => {
  try {
    const exit = await ExitInterview.create(req.body)
    res.json({ success: true, exit })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get all (admin only)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const exits = await ExitInterview.find().sort({ createdAt: -1 })
    res.json(exits)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Approve or reject (admin only)
router.patch('/:id', auth, adminOnly, async (req, res) => {
  try {
    const exit = await ExitInterview.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
    res.json(exit)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await ExitInterview.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router