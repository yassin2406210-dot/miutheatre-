const router = require('express').Router()
const Workshop = require('../models/workshop')
const auth = require('../middleware/auth')
const adminOnly = require('../middleware/adminOnly')
const { queueEmail } = require('../utils/email')
const multer = require('multer')
const path = require('path')

// ── Multer Setup ──
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})
const upload = multer({ storage })

function formatWorkshopDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Get all workshops (public)
router.get('/', async (req, res) => {
  try {
    const workshops = await Workshop.find().sort({ date: 1 })
    res.json(workshops)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Join workshop (logged-in users only)
router.post('/:id/join', auth, async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id)
    if (!workshop) return res.status(404).json({ error: 'Workshop not found' })

    const alreadyJoined = workshop.joinedUsers.some(function(user) {
      return String(user.userId) === String(req.user.id)
    })

    if (alreadyJoined) {
      return res.status(400).json({ error: 'You already joined this workshop' })
    }

    if (workshop.joinedUsers.length >= workshop.maxSpots) {
      return res.status(400).json({ error: 'This workshop is full' })
    }

    workshop.joinedUsers.push({
      userId: req.user.id,
      name: req.body.name,
      email: req.body.email,
      studentId: req.body.studentId,
      faculty: req.body.faculty
    })

    await workshop.save()
    queueEmail({
      to: req.body.email,
      subject: `Workshop confirmation: ${workshop.title}`,
      title: 'Workshop Registration Confirmed',
      lines: [
        `Hi ${req.body.name},`,
        `You joined: ${workshop.title}.`,
        `Date: ${formatWorkshopDate(workshop.date)}`,
        `Time: ${workshop.time || '-'}`,
        `Location: ${workshop.location || '-'}`,
        'See you there.'
      ]
    })
    res.json({ success: true, workshop })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Leave workshop (logged-in users only)
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id)
    if (!workshop) return res.status(404).json({ error: 'Workshop not found' })

    workshop.joinedUsers = workshop.joinedUsers.filter(function(user) {
      return String(user.userId) !== String(req.user.id)
    })

    await workshop.save()
    res.json({ success: true, workshop })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Add workshop (admin only)
router.post('/', auth, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const workshop = await Workshop.create({
      ...req.body,
      image: req.file ? '/uploads/' + req.file.filename : null
    })
    res.json({ success: true, workshop })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Edit workshop (admin only)
router.put('/:id', auth, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body }
    if (req.file) {
      updateData.image = '/uploads/' + req.file.filename
    }
    const workshop = await Workshop.findByIdAndUpdate(
      req.params.id,
      updateData,
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