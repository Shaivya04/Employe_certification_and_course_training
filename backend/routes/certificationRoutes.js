const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
  assignCertification,
  getAllCertifications,
  getExpiringSoon,
  sendExpiryReminders
} = require('../controllers/certificationController');

const Certification = require('../models/Certification');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ✅ Multer setup for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf') {
      return cb(new Error('Only PDFs are allowed'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// ✅ POST: Assign new certification (Admin only)
router.post('/', protect, adminOnly, assignCertification);

// ✅ GET: All certifications (uses controller function)
router.get('/', protect, getAllCertifications);

// ✅ GET: Certifications expiring soon (uses controller function)
router.get('/expiring-soon', protect, getExpiringSoon);

// ✅ GET: Send expiry reminders via email (Admin only)
router.get('/send-reminders', protect, adminOnly, sendExpiryReminders);

// ✅ POST: Upload certificate PDF (Admin only)
router.post('/upload/:id', protect, adminOnly, upload.single('pdf'), async (req, res) => {
  try {
    const certId = req.params.id;
    const filePath = req.file.filename;

    const cert = await Certification.findByIdAndUpdate(
      certId,
      { file: filePath },
      { new: true }
    );

    if (!cert) {
      return res.status(404).json({ message: 'Certification not found' });
    }

    res.json({ message: '✅ File uploaded successfully', certification: cert });
  } catch (err) {
    console.error('❌ Upload failed:', err.message);
    res.status(400).json({ message: '❌ Upload failed', error: err.message });
  }
});

// ✅ GET: Download certificate PDF (admin or linked employee)
router.get('/download/:filename', protect, async (req, res) => {
  try {
    const cert = await Certification.findOne({ file: req.params.filename }).populate('employee');
    if (!cert) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = cert.employee?._id?.toString() === req.user.employee?._id?.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', cert.file);
    res.download(filePath, (err) => {
      if (err) {
        console.error('❌ Download error:', err.message);
        res.status(404).json({ message: 'File not found' });
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error downloading file', error: err.message });
  }
});

// ✅ DELETE: Delete a certification by ID (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const cert = await Certification.findByIdAndDelete(req.params.id);
    if (!cert) {
      return res.status(404).json({ message: 'Certification not found' });
    }
    res.json({ message: '✅ Certification deleted' });
  } catch (err) {
    res.status(500).json({ message: '❌ Failed to delete certification', error: err.message });
  }
});

module.exports = router;
