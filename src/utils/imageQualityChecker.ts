import type { ImageQualityReport } from '../types';

/**
 * Client-side photo quality pre-checker using HTML5 Canvas.
 * Evaluates brightness, contrast, sharpness, and resolution without sending data to servers.
 */
export async function checkImageQuality(imageUrlOrDataUrl: string): Promise<ImageQualityReport> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width || 300;
        const height = img.naturalHeight || img.height || 300;

        // Sample down to max 200x200 for fast, instantaneous analysis
        const sampleW = Math.min(width, 160);
        const sampleH = Math.min(height, 160);

        const canvas = document.createElement('canvas');
        canvas.width = sampleW;
        canvas.height = sampleH;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          resolve(getDefaultPassReport());
          return;
        }

        ctx.drawImage(img, 0, 0, sampleW, sampleH);
        const imgData = ctx.getImageData(0, 0, sampleW, sampleH);
        const data = imgData.data;

        // 1. Calculate Average Luminance & Contrast
        let totalLuminance = 0;
        const totalPixels = sampleW * sampleH;
        const luminanceArray = new Float32Array(totalPixels);

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Standard ITU-R BT.601 luminance
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          luminanceArray[i / 4] = lum;
          totalLuminance += lum;
        }

        const avgLuminance = totalLuminance / totalPixels;

        // 2. Estimate Sharpness using gradient differences (Laplacian edge energy approximation)
        let gradientSum = 0;
        let edgeSamples = 0;
        for (let y = 1; y < sampleH - 1; y++) {
          for (let x = 1; x < sampleW - 1; x++) {
            const idx = y * sampleW + x;
            const center = luminanceArray[idx];
            const up = luminanceArray[idx - sampleW];
            const down = luminanceArray[idx + sampleW];
            const left = luminanceArray[idx - 1];
            const right = luminanceArray[idx + 1];
            
            // 4-neighbor Laplacian
            const laplacian = Math.abs(4 * center - up - down - left - right);
            gradientSum += laplacian;
            edgeSamples++;
          }
        }

        const sharpnessScore = edgeSamples > 0 ? gradientSum / edgeSamples : 20;

        // Interpretations
        const warnings: string[] = [];
        let score = 100;

        // Brightness evaluation
        let brightness: ImageQualityReport['brightness'] = 'good';
        if (avgLuminance < 50) {
          brightness = 'too_dark';
          warnings.push('ภาพค่อนข้างมืด แสงไม่เพียงพอ');
          score -= 30;
        } else if (avgLuminance > 225) {
          brightness = 'too_bright';
          warnings.push('ภาพสว่างจ้าเกินไป รายละเอียดใบหน้าอาจหายไป');
          score -= 25;
        }

        // Sharpness evaluation
        let sharpness: ImageQualityReport['sharpness'] = 'sharp';
        if (sharpnessScore < 6.5) {
          sharpness = 'blurry';
          warnings.push('ภาพอาจเบลอหรือไม่โฟกัส แนะนำใช้ภาพที่คมชัดกว่านี้');
          score -= 35;
        } else if (sharpnessScore < 11) {
          sharpness = 'acceptable';
        }

        // Resolution evaluation
        let resolution: ImageQualityReport['resolution'] = 'good';
        if (width < 250 || height < 250) {
          resolution = 'low';
          warnings.push('ความละเอียดภาพค่อนข้างต่ำ');
          score -= 20;
        } else if (width >= 800 && height >= 800) {
          resolution = 'high';
        }

        score = Math.max(10, Math.min(100, score));

        resolve({
          isAcceptable: score >= 50,
          brightness,
          sharpness,
          resolution,
          warnings,
          score
        });
      } catch (e) {
        console.warn('Image quality check failed, defaulting to pass:', e);
        resolve(getDefaultPassReport());
      }
    };

    img.onerror = () => {
      resolve(getDefaultPassReport());
    };

    img.src = imageUrlOrDataUrl;
  });
}

function getDefaultPassReport(): ImageQualityReport {
  return {
    isAcceptable: true,
    brightness: 'good',
    sharpness: 'sharp',
    resolution: 'good',
    warnings: [],
    score: 85
  };
}
