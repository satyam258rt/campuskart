const express = require('express');
const fs = require('fs');
const path = require('path');
const { protect } = require('../middlewares/authMiddleware');
const ApiError = require('../utils/apiError');
const logger = require('../utils/logger');

const router = express.Router();

const uploadsDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * @route   POST /api/v1/upload
 * @desc    Upload direct photos (base64 or data URI) to server static storage
 * @access  Private
 */
router.post('/', protect, async (req, res, next) => {
  try {
    const { images } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      throw ApiError.badRequest('Please provide at least one image in images array');
    }

    const savedImages = [];

    for (let i = 0; i < images.length; i++) {
      const item = images[i];
      const rawData = typeof item === 'string' ? item : item.data || item.url;

      if (!rawData) continue;

      // Check if it's already a web URL
      if (rawData.startsWith('http://') || rawData.startsWith('https://')) {
        savedImages.push({
          url: rawData,
          isCover: item.isCover || i === 0
        });
        continue;
      }

      // If it's a data URI or base64
      let ext = 'jpg';
      let base64Content = rawData;

      if (rawData.includes(';base64,')) {
        const parts = rawData.split(';base64,');
        const mime = parts[0].replace('data:', '');
        if (mime.includes('png')) ext = 'png';
        else if (mime.includes('webp')) ext = 'webp';
        else if (mime.includes('gif')) ext = 'gif';
        base64Content = parts[1];
      }

      const filename = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${i}.${ext}`;
      const filePath = path.join(uploadsDir, filename);

      const buffer = Buffer.from(base64Content, 'base64');
      await fs.promises.writeFile(filePath, buffer);

      const fileUrl = `/uploads/${filename}`;
      savedImages.push({
        url: fileUrl,
        filename,
        isCover: item.isCover || i === 0
      });
    }

    return res.status(200).json({
      success: true,
      message: `${savedImages.length} photo(s) uploaded successfully`,
      data: {
        images: savedImages
      }
    });
  } catch (err) {
    logger.error(`Upload error: ${err.message}`);
    next(err);
  }
});

module.exports = router;
