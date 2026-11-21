/**
 * Shrinks a photo in the browser before upload: a full picture (longest side up to 1600px) and a small one for
 * lists (480px), both JPEG. A 5 MB phone photo becomes about 200-400 KB, so uploads are quick on mobile data.
 */
const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('This file could not be opened as a photo.'));
    };
    img.src = url;
  });

const toJpeg = (img, max, quality) =>
  new Promise((resolve, reject) => {
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; // transparent PNGs get a white background, not black
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('The photo could not be prepared.'))), 'image/jpeg', quality);
  });

export const resizeImage = async (file) => {
  if (!/^image\//.test(file.type)) throw new Error('Please choose a photo (JPG, PNG or WebP).');
  const img = await loadImage(file);
  const [full, thumb] = await Promise.all([toJpeg(img, 1600, 0.82), toJpeg(img, 480, 0.75)]);
  return { full, thumb };
};
