const router = require('express').Router()
const ExitInterview = require('../models/exitinterview')
const auth = require('../middleware/auth')
const adminOnly = require('../middleware/adminOnly')

// Submit exit request (public)
router.post('/', async (req, res) => {
  try {
    const { name, email, reason } = req.body

    // Backend validation
    if (!name || !name.trim())
      return res.status(400).json({ error: 'Full name is required' })
    if (!email || !email.trim())
      return res.status(400).json({ error: 'Email is required' })
    if (!email.toLowerCase().endsWith('@miuegypt.edu.eg'))
      return res.status(400).json({ error: 'MIU email only (@miuegypt.edu.eg)' })
    if (!reason || !reason.trim())
      return res.status(400).json({ error: 'Reason for leaving is required' })

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
    const { status } = req.body
    if (!status || !['approved', 'rejected'].includes(status))
      return res.status(400).json({ error: 'Invalid status value' })

    const exit = await ExitInterview.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    if (!exit) return res.status(404).json({ error: 'Exit request not found' })
    res.json(exit)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const exit = await ExitInterview.findByIdAndDelete(req.params.id)
    if (!exit) return res.status(404).json({ error: 'Exit request not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
