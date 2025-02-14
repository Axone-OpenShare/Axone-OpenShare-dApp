// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();

// Enhanced CORS: Allow requests from frontend URL
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type']
}));

// Middleware to parse JSON bodies if needed
app.use(express.json());

// Ensure the uploads folder exists
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// AWS S3 Configuration
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

console.log('AWS Configured for bucket:', process.env.S3_BUCKET_NAME);

// Set up multer to store files in memory (we'll upload to S3)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Error handling middleware for Multer errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(413).json({ success: false, error: 'File too large (max 10MB)' });
  }
  next(err);
});

// File upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { userDID } = req.body;
    if (!userDID || !req.file) {
      return res.status(400).json({ success: false, error: 'Missing required fields: userDID or file' });
    }

    // Generate a unique file key for S3
    const fileKey = `uploads/${uuidv4()}-${req.file.originalname}`;

    // Create an upload object using AWS SDK
    const parallelUpload = new Upload({
      client: s3,
      params: {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileKey,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        Metadata: {
          uploader: userDID,
          originalname: req.file.originalname
        }
      }
    });

    const result = await parallelUpload.done();

    res.status(200).json({
      success: true,
      fileMetadata: {
        location: result.Location,
        key: result.Key,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: 'Internal server error', details: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start the backend server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server is running at http://localhost:${PORT}`);
  console.log(`CORS allowed origin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});
