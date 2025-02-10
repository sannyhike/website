// server.js
const express = require('express');
const multer  = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Create a unique filename using a timestamp and random number
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Ensure the uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Serve static files from the public folder
app.use(express.static('public'));

// Serve the uploaded memes statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle meme uploads
app.post('/upload', upload.single('meme'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  // Respond with JSON for AJAX requests
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    res.json({ success: true, file: req.file.filename, url: `/uploads/${req.file.filename}` });
  } else {
    res.redirect('/');
  }
});

// API endpoint to list all uploaded memes
app.get('/memes', (req, res) => {
  fs.readdir('uploads', (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read uploads directory.' });
    }
    // Map each file to its URL
    const memes = files.map(file => ({
      url: `/uploads/${file}`
    }));
    res.json(memes);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
