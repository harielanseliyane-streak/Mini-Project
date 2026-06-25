const fs = require('fs');
try {
  fs.copyFileSync('C:\\Users\\HARI\\.gemini\\antigravity-ide\\brain\\76002eee-ed6f-418d-8c23-1de4d27a63ed\\media__1782359769241.jpg', 'd:\\Mini Project\\frontend\\src\\assets\\logo.jpg');
  console.log('Copy successful');
} catch (e) {
  console.error('Copy failed:', e);
}
