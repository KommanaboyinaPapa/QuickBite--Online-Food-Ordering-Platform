const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets', 'images');

// A minimal valid PNG (1x1 pixel, red)
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const pngBuffer = Buffer.from(pngBase64, 'base64');

const files = [
  'app-icon.png',
  'adaptive-icon.png',
  'favicon.png',
  'notification-icon.png',
  'splash.png'
];

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

files.forEach(file => {
  const filePath = path.join(assetsDir, file);
  console.log(`Writing valid PNG to ${filePath}`);
  fs.writeFileSync(filePath, pngBuffer);
});

console.log('Assets regenerated successfully.');
