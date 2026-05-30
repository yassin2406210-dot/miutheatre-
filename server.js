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

// ── Page Routes ──
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

// ── API Routes ──
const authRouter       = require('./routes/auth')
const auditionsRouter  = require('./routes/auditions')
const workshopsRouter  = require('./routes/workshops')
const rehearsalsRouter = require('./routes/rehearsals')
const scriptsRouter    = require('./routes/scripts')
const contactRouter    = require('./routes/contact')
const exitRouter       = require('./routes/exit')
const deadlinesRouter  = require('./routes/deadlines')

app.use('/api/auth',       authRouter)
app.use('/api/auditions',  auditionsRouter)
app.use('/api/workshops',  workshopsRouter)
app.use('/api/rehearsals', rehearsalsRouter)
app.use('/api/scripts',    scriptsRouter)
app.use('/api/contact',    contactRouter)
app.use('/api/exit',       exitRouter)
app.use('/api/deadlines',  deadlinesRouter)

// 404 handler
app.use((req, res) => {
  res.status(404).render('pages/404')
})

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong' })
})  

// ── Database + Start ──
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected ✓')
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    )
  })
  .catch(err => console.log('DB Error:', err))

  