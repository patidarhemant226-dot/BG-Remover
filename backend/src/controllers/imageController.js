const path = require('path');
const fs = require('fs');
const { processImage } = require('../utils/imageProcessor');

// Store simple in-memory history for this session
const history = [];

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    const fileData = {
      id: Date.now().toString(),
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
      uploadedAt: new Date(),
    };

    history.push(fileData);

    res.status(201).json({
      success: true,
      data: fileData,
    });
  } catch (error) {
    next(error);
  }
};

const processImageHandler = async (req, res, next) => {
  try {
    const { filename, options } = req.body;

    if (!filename) {
      return res.status(400).json({ success: false, message: 'Filename is required' });
    }

    const isVercel = process.env.VERCEL === '1';
    const uploadDir = isVercel ? '/tmp' : path.join(__dirname, '../../uploads');
    const inputPath = path.join(uploadDir, filename);

    if (!fs.existsSync(inputPath)) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    const processedPath = await processImage(inputPath, options);
    const processedFilename = path.basename(processedPath);

    res.status(200).json({
      success: true,
      data: {
        filename: processedFilename,
        url: `/uploads/${processedFilename}`,
        processedAt: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadImage,
  processImageHandler,
  getHistory,
};
