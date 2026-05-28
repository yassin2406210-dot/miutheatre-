const router = require('express').Router()
const Script = require('../models/Script')
const auth = require('../middleware/auth')
const adminOnly = require('../middleware/adminOnly')

// Submit script (public)
router.post('/', async (req, res) => {
  try {
    const script = await Script.create(req.body)
    res.json({ success: true, script })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get all (admin only)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const scripts = await Script.find().sort({ createdAt: -1 })
    res.json(scripts)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Approve or reject (admin only)
router.patch('/:id', auth, adminOnly, async (req, res) => {
  try {
    const script = await Script.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
    res.json(script)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Script.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router