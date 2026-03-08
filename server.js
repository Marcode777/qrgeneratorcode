const express = require('express');
const multer = require('multer');
const qrcode = require('qrcode');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer storage — each file gets a UUID-based filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB limit
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));
app.use(express.json());

// Upload a file and return its hosted URL
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const host = req.protocol + '://' + req.get('host');
  const fileUrl = `${host}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, originalName: req.file.originalname });
});

// Generate a QR code from a URL
app.post('/api/generate-qr', async (req, res) => {
  const { url } = req.body;
  if (!url || url.trim() === '') {
    return res.status(400).json({ error: 'A URL is required' });
  }
  try {
    const dataUrl = await qrcode.toDataURL(url.trim(), {
      width: 400,
      margin: 2,
      color: { dark: '#1a1a2e', light: '#ffffff' },
      errorCorrectionLevel: 'H'
    });
    res.json({ qr: dataUrl });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

app.listen(PORT, () => {
  console.log(`QR Generator running at http://localhost:${PORT}`);
});
