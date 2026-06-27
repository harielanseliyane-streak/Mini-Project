const fs = require('fs');
const path = require('path');

const src = "C:\\Users\\HARI\\.gemini\\antigravity-ide\\brain\\8a4b3ae4-f4ae-43b7-94a6-b121d052b4d9\\media__1782557929939.png";
const dest1 = path.join(__dirname, 'public', 'sketch-bg.png');
const dest2 = path.join(__dirname, 'public', 'college-bg-teal.png');

try {
  fs.copyFileSync(src, dest1);
  fs.copyFileSync(src, dest2);
  console.log('SUCCESSFULLY_COPIED_BACKGROUND_IMAGES');
} catch (err) {
  console.error('Copy failed:', err.message);
}
