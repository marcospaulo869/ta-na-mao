/**
 * Extract the dominant color from an image data URL using a Canvas 2D approach.
 * Returns a hex color like "#A38B6C".
 */
export async function extractDominantColorFromDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const targetW = 80;
        const scale = targetW / img.width;
        canvas.width = targetW;
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        // Bucketize colors (5-bit precision) and count
        const counts = new Map();
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a < 128) continue;
          const r = data[i] & 0xf8;
          const g = data[i + 1] & 0xf8;
          const b = data[i + 2] & 0xf8;
          const key = (r << 16) | (g << 8) | b;
          counts.set(key, (counts.get(key) || 0) + 1);
        }
        let best = 0;
        let bestKey = 0;
        for (const [k, v] of counts) {
          if (v > best) {
            best = v;
            bestKey = k;
          }
        }
        const r = (bestKey >> 16) & 0xff;
        const g = (bestKey >> 8) & 0xff;
        const b = bestKey & 0xff;
        const hex =
          "#" +
          [r, g, b]
            .map((c) => c.toString(16).padStart(2, "0"))
            .join("")
            .toUpperCase();
        resolve(hex);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
