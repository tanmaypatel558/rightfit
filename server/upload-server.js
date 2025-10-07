// Minimal local upload server for dev
const path = require('path')
const fs = require('fs')
const express = require('express')
const cors = require('cors')
const multer = require('multer')

const app = express()
app.use(cors())

const uploadsDir = path.join(__dirname, '..', 'public', 'uploads')
fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: function(req, file, cb){ cb(null, uploadsDir) },
  filename: function(req, file, cb){
    const ext = path.extname(file.originalname || '') || '.jpg'
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    cb(null, name)
  }
})
const upload = multer({ storage })

app.post('/upload', upload.single('file'), (req, res)=>{
  const file = req.file
  if (!file) return res.status(400).json({ error: 'No file' })
  // Public URL served by Vite from /public
  const publicPath = `/uploads/${file.filename}`
  res.json({ url: publicPath })
})

const port = process.env.UPLOAD_PORT || 5174
app.listen(port, ()=>{
  console.log(`Upload server listening on http://localhost:${port}`)
})
