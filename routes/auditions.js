const express = require('express')
const router = express.Router()
const Audition = require('../models/audition')
const auth = require('../middleware/auth')
const adminOnly = require('../middleware/adminOnly')
const { getAdminEmail, queueEmail } = require('../utils/email')

router.post('/', auth, async (req, res) => {
  try {
    const { name, email, experience, whyJoin } = req.body

    // Backend validation
    if (!name || !name.trim())
      return res.status(400).json({ error: 'Full name is required' })
    if (!email || !email.trim())
      return res.status(400).json({ error: 'Email is required' })
    if (!email.toLowerCase().endsWith('@miuegypt.edu.eg'))
      return res.status(400).json({ error: 'MIU email only (@miuegypt.edu.eg)' })
    if (!experience || !experience.trim())
      return res.status(400).json({ error: 'Experience field is required' })
    if (!whyJoin || !whyJoin.trim())
      return res.status(400).json({ error: 'Please tell us why you want to join' })

    const a = await Audition.create(req.body)
    queueEmail({
      to: a.email,
      subject: 'Your audition application was received',
      title: 'Audition Application Received',
      lines: [
        `Hi ${a.name},`,
        'We received your MIU Theatre Club audition application.',
        'Our team will review it and update you once a decision is made.'
      ]
    })
    queueEmail({
      to: getAdminEmail(),
      subject: 'New audition application',
      title: 'New Audition Application',
      lines: [
        `Name: ${a.name}`,
        `Email: ${a.email}`,
        `Major: ${a.major || '-'}`,
        `Year: ${a.year || '-'}`,
        `Experience: ${a.experience || '-'}`
      ]
    })
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
    const { status } = req.body
    if (!status || !['approved', 'rejected'].includes(status))
      return res.status(400).json({ error: 'Invalid status value' })

    const a = await Audition.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    if (!a) return res.status(404).json({ error: 'Audition not found' })
    queueEmail({
      to: a.email,
      subject: `Your audition application was ${a.status}`,
      title: 'Audition Application Update',
      lines: [
        `Hi ${a.name},`,
        `Your MIU Theatre Club audition application was ${a.status}.`,
        a.status === 'approved'
          ? 'Congratulations. Our team will follow up with the next steps.'
          : 'Thank you for applying. We appreciate your interest in the club.'
      ]
    })
    res.json(a)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const a = await Audition.findByIdAndDelete(req.params.id)
    if (!a) return res.status(404).json({ error: 'Audition not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
