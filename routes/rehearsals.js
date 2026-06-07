const router = require('express').Router()
const Rehearsal = require('../models/rehearsal')
const auth = require('../middleware/auth')
const adminOnly = require('../middleware/adminOnly')

// Get all (public)
router.get('/', async (req, res) => {
  try {
    const rehearsals = await Rehearsal.find().sort({ createdAt: -1 })
    res.json(rehearsals)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Add (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const rehearsal = await Rehearsal.create(req.body)
    res.json({ success: true, rehearsal })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Rehearsal.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router