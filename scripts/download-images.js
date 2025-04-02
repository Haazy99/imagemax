const https = require('https');
const fs = require('fs');
const path = require('path');

// Create images directory if it doesn't exist
const imagesDir = path.join(process.cwd(), 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Image URLs (high-quality product images from Unsplash)
const imageUrls = {
  original: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1920&q=85&fm=jpg',
  processed: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1920&q=85&fm=jpg&blend=000000,0.1&sat=-20&con=1.2&exp=10'
};

// Download function
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(imagesDir, filename);
    const file = fs.createWriteStream(filepath);

    https.get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${filename}`);
        resolve();
      });
    }).on('error', err => {
      fs.unlink(filepath, () => {}); // Delete the file if there was an error
      reject(err);
    });
  });
}

// Download both images
async function downloadImages() {
  try {
    await downloadImage(imageUrls.original, 'original-image.jpg');
    await downloadImage(imageUrls.processed, 'processed-image.jpg');
    console.log('All images downloaded successfully!');
  } catch (error) {
    console.error('Error downloading images:', error);
  }
}

downloadImages(); 