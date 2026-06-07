const router = require('express').Router()
const Script = require('../models/script')
const auth = require('../middleware/auth')
const adminOnly = require('../middleware/adminOnly')
const multer = require('multer')
const path = require('path')
const { getAdminEmail, queueEmail } = require('../utils/email')
 
// ── Multer Setup ──
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + path.extname(file.originalname))
  }
})
 
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowed = ['.pdf', '.doc', '.docx', '.txt']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) cb(null, true)
    else cb(new Error('Only PDF, DOC, DOCX, or TXT files are allowed'))
  }
})
 
// Submit script (public)
router.post('/', upload.single('scriptFile'), async (req, res) => {
  try {
    const { name, email, title, genre, description } = req.body
 
    if (!name || !name.trim())
      return res.status(400).json({ error: 'Full name is required' })
    if (!email || !email.trim())
      return res.status(400).json({ error: 'Email is required' })
    if (!email.toLowerCase().endsWith('@miuegypt.edu.eg'))
      return res.status(400).json({ error: 'MIU email only (@miuegypt.edu.eg)' })
    if (!title || !title.trim())
      return res.status(400).json({ error: 'Script title is required' })
    if (!genre || !genre.trim())
      return res.status(400).json({ error: 'Genre is required' })
    if (!description || !description.trim())
      return res.status(400).json({ error: 'Script description is required' })
 
    const scriptData = { ...req.body }
    if (req.file) {
      scriptData.filePath = '/uploads/' + req.file.filename
      scriptData.fileName = req.file.originalname
    }
 
    const script = await Script.create(scriptData)
    queueEmail({
      to: script.email,
      subject: 'Your script submission was received',
      title: 'Script Submission Received',
      lines: [
        `Hi ${script.name},`,
        `We received your script submission: ${script.title}.`,
        'Our team will review it and update you once a decision is made.'
      ]
    })
    queueEmail({
      to: getAdminEmail(),
      subject: 'New script submission',
      title: 'New Script Submission',
      lines: [
        `Title: ${script.title}`,
        `Author: ${script.name}`,
        `Email: ${script.email}`,
        `Genre: ${script.genre || '-'}`,
        `File: ${script.fileName || 'No file uploaded'}`
      ]
    })
    res.json({ success: true, script })
  } catch (err) {
    if (err.code === 'LIMIT_FILE_SIZE')
      return res.status(400).json({ error: 'File too large. Max size is 10MB' })
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
    const { status } = req.body
    if (!status || !['approved', 'rejected'].includes(status))
      return res.status(400).json({ error: 'Invalid status value' })
 
    const script = await Script.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    if (!script) return res.status(404).json({ error: 'Script not found' })
    queueEmail({
      to: script.email,
      subject: `Your script submission was ${script.status}`,
      title: 'Script Submission Update',
      lines: [
        `Hi ${script.name},`,
        `Your script "${script.title}" was ${script.status}.`,
        script.status === 'approved'
          ? 'Congratulations. Your script has been approved for the next step.'
          : 'Thank you for submitting your work. We appreciate your effort and creativity.'
      ]
    })
    res.json(script)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
 
// Delete (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const script = await Script.findByIdAndDelete(req.params.id)
    if (!script) return res.status(404).json({ error: 'Script not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
 
module.exports = router
