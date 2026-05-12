const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { uploadImage, processImageHandler, getHistory } = require('../controllers/imageController');

// @route   POST /api/images/upload
// @desc    Upload an image
router.post('/upload', upload.single('image'), uploadImage);

// @route   POST /api/images/process
// @desc    Process an uploaded image (resize, convert, etc.)
router.post('/process', processImageHandler);

// @route   GET /api/images/history
// @desc    Get session history (mocked)
router.get('/history', getHistory);

module.exports = router;
