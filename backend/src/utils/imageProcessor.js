const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Process image using Sharp
 * @param {string} inputPath 
 * @param {object} options - { format, width, height, background }
 */
const processImage = async (inputPath, options = {}) => {
  const { format = 'png', width, height, background } = options;
  const fileName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(path.dirname(inputPath), `${fileName}-processed.${format}`);

  let pipeline = sharp(inputPath);

  if (width || height) {
    pipeline = pipeline.resize(
      width ? parseInt(width) : null,
      height ? parseInt(height) : null,
      { fit: 'inside', withoutEnlargement: true }
    );
  }

  if (background && background !== 'transparent') {
    // If background is provided, flatten the image over that color
    pipeline = pipeline.flatten({ background });
  }

  await pipeline.toFormat(format).toFile(outputPath);

  return outputPath;
};

module.exports = { processImage };
