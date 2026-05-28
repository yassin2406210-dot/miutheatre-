const router = require('express').Router()
const Workshop = require('../models/Workshop')
const auth = require('../middleware/auth')
const adminOnly = require('../middleware/adminOnly')

// Get all workshops (public)
router.get('/', async (req, res) => {
  try {
    const workshops = await Workshop.find().sort({ date: 1 })
    res.json(workshops)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Add workshop (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const workshop = await Workshop.create(req.body)
    res.json({ success: true, workshop })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Edit workshop (admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const workshop = await Workshop.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    res.json(workshop)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete workshop (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Workshop.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router