const express = require('express')
const router = express.Router()
const Audition = require('../models/Audition')
const auth = require('../middleware/auth')
const adminOnly = require('../middleware/adminOnly')

router.post('/', auth, async (req, res) => {
  try {
    const a = await Audition.create(req.body)
    res.json({ success: true, a })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const auditions = await Audition.find().sort({ createdAt: -1 })
    res.json(auditions)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id', auth, adminOnly, async (req, res) => {
  try {
    const a = await Audition.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
    res.json(a)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Audition.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router