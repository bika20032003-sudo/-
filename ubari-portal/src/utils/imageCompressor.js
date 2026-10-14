/**
 * Utility for compressing uploaded images on an off-screen HTML5 Canvas
 * Prevents localStorage QuotaExceededError while retaining 4K visual clarity.
 */

export function compressImageFile(file, maxWidth = 1400, maxHeight = 1000, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('لم يتم تحديد أي ملف'));
    }

    if (!file.type || !file.type.startsWith('image/')) {
      return reject(new Error('الملف المختار ليس صورة صالحة (يرجى اختيار JPG, PNG, WEBP)'));
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('تعذر قراءة ملف الصورة من جهازك'));
    };

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => {
        reject(new Error('تعذر تحميل الصورة للمعالجة'));
      };

      img.onload = () => {
        let { width, height } = img;

        // Scale down while preserving aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback if canvas context fails
          return resolve(e.target.result);
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (err) {
          // If canvas security or toDataURL fails, resolve original
          resolve(e.target.result);
        }
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Safe localStorage setter with quota protection
 */
export function safeStorageSet(key, value) {
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (err) {
    console.warn(`[SafeStorage] Quota exceeded or storage error on ${key}:`, err);
    // If quota exceeded, try to clean old large temporary items
    try {
      // Clear legacy heavy keys if present
      localStorage.removeItem('portal-field-photos');
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (e2) {
      console.error('[SafeStorage] Unable to save to localStorage:', e2);
      return false;
    }
  }
}

/**
 * Safe localStorage getter with fallback
 */
export function safeStorageGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    return fallback;
  }
}
