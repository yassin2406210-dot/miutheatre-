const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()

const app = express()

// ── Middleware ──
app.use(cors())
app.use(express.json())
app.use(express.static('public'))

// ── View Engine ──
app.set('view engine', 'ejs')
app.set('views', './views')

// ── Routes ──
app.get('/', (req, res) => res.render('pages/home'))
app.get('/login', (req, res) => res.render('pages/login'))
app.get('/admin', (req, res) => res.render('pages/admin'))
app.get('/about', (req, res) => res.render('pages/about'))
app.get('/contact', (req, res) => res.render('pages/contact'))
app.get('/auditions', (req, res) => res.render('pages/auditions'))
app.get('/workshops', (req, res) => res.render('pages/workshops')) 
app.get('/rehearsals', (req, res) => res.render('pages/rehearsals'))
app.get('/scripts', (req, res) => res.render('pages/scripts'))
app.get('/exit', (req, res) => res.render('pages/exit'))

// ── Database + Start ──
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected ✓')
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    )
  })
  .catch(err => console.log('DB Error:', err))