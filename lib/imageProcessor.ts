
// This function checks if a pixel's RGB values fall within a typical range for skin tones.
// It uses the YCbCr color space, which is more robust to lighting variations than RGB.
const isSkin = (r: number, g: number, b: number): boolean => {
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  // These are standard ranges for detecting a wide variety of skin tones.
  return cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173;
};

/**
 * Processes a base64 encoded image to resize, perform skin segmentation, color normalization, and compression.
 * @param base64Image The source image as a base64 data URL.
 * @returns A promise that resolves with the processed image as a base64 JPEG data URL.
 */
export const processImage = (base64Image: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        return reject(new Error('Could not get canvas context for processing.'));
      }

      // Step 0: Resize the image for performance and consistency.
      // The AI model works best with smaller, square-like images. 512x512 is a good balance.
      const MAX_DIMENSION = 512;
      let { width, height } = img;
      if (width > height) {
        if (width > MAX_DIMENSION) {
          height *= MAX_DIMENSION / width;
          width = MAX_DIMENSION;
        }
      } else {
        if (height > MAX_DIMENSION) {
          width *= MAX_DIMENSION / height;
          height = MAX_DIMENSION;
        }
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Variables to find the min/max color values of skin pixels for normalization.
      let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
      let hasSkinPixels = false;
      
      // Step 1: Skin Segmentation.
      // Iterate through each pixel to identify if it's a skin tone.
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (isSkin(r, g, b)) {
          hasSkinPixels = true;
          // Keep track of the darkest and brightest values for each color channel.
          if (r < minR) minR = r;
          if (r > maxR) maxR = r;
          if (g < minG) minG = g;
          if (g > maxG) maxG = g;
          if (b < minB) minB = b;
          if (b > maxB) maxB = b;
        } else {
          // Make non-skin pixels fully transparent. This isolates the area of interest.
          data[i + 3] = 0;
        }
      }
      
      // If no skin pixels were found, don't perform normalization.
      // Return the original resized image on a white background as a JPEG.
      // This prevents errors if an image without detectable skin is uploaded.
      if (!hasSkinPixels) {
          const fallbackCanvas = document.createElement('canvas');
          fallbackCanvas.width = width;
          fallbackCanvas.height = height;
          const fallbackCtx = fallbackCanvas.getContext('2d');
          if (!fallbackCtx) return reject(new Error('Could not create fallback canvas.'));
          fallbackCtx.fillStyle = '#FFFFFF';
          fallbackCtx.fillRect(0, 0, width, height);
          fallbackCtx.drawImage(canvas, 0, 0);
          resolve(fallbackCanvas.toDataURL('image/jpeg', 0.9));
          return;
      }

      // Step 2: Color Normalization (Contrast Stretching).
      // This enhances the image by stretching the color range of skin pixels to the full 0-255 range.
      // It helps to correct for poor lighting (too dark, too yellow, etc.).
      const rangeR = maxR - minR;
      const rangeG = maxG - minG;
      const rangeB = maxB - minB;

      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 0) { // Only process skin pixels (non-transparent).
          data[i] = rangeR > 0 ? ((data[i] - minR) * 255) / rangeR : data[i];
          data[i + 1] = rangeG > 0 ? ((data[i + 1] - minG) * 255) / rangeG : data[i + 1];
          data[i + 2] = rangeB > 0 ? ((data[i + 2] - minB) * 255) / rangeB : data[i + 2];
        }
      }

      // Put the modified image data (with isolated skin) back onto the canvas.
      ctx.putImageData(imageData, 0, 0);
      
      // Create a final canvas with a white background.
      // This is better than transparency, as some models might interpret transparency incorrectly.
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = width;
      outputCanvas.height = height;
      const outCtx = outputCanvas.getContext('2d');
      if (!outCtx) return reject(new Error('Could not get output canvas context.'));
      outCtx.fillStyle = '#FFFFFF';
      outCtx.fillRect(0, 0, width, height);
      // Draw the processed image (with transparent non-skin areas) onto the white background.
      outCtx.drawImage(canvas, 0, 0);

      // Step 3: Compress and return as a high-quality JPEG.
      // This is crucial for reducing upload size and speeding up the AI analysis.
      resolve(outputCanvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => {
      reject(new Error('Failed to load image for processing. It might be corrupt or in an unsupported format.'));
    };
    img.src = base64Image;
  });
};
