/**
 * Convert a File/Blob to a data-URL string
 */
export const fileToDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/**
 * Convert a Blob to an object URL (faster for large images)
 */
export const blobToObjectURL = (blob) => URL.createObjectURL(blob);

/**
 * Apply a solid or transparent background to a result canvas and return a new Blob
 * @param {string} resultSrc  - object URL / data URL of the removed-bg image (PNG with alpha)
 * @param {string} bgType     - 'transparent' | 'white' | 'black' | 'gradient' | hex color
 * @param {string} format     - 'image/png' | 'image/jpeg' | 'image/webp'
 */
export const applyBackground = (resultSrc, bgType, format = 'image/png') =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');

      if (bgType !== 'transparent') {
        if (bgType === 'gradient') {
          const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          grad.addColorStop(0, '#0058be');
          grad.addColorStop(1, '#6b38d4');
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = bgType; // white / black / hex
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => resolve(blob), format, 0.92);
    };
    img.src = resultSrc;
  });

/**
 * Trigger a browser download of a Blob
 */
export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

/**
 * Format file size for display
 */
export const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
