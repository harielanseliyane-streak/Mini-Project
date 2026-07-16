const fs = require('fs');
const path = require('path');

const source = "C:\\Users\\HARI\\.gemini\\antigravity-ide\\brain\\2997fb2f-f594-4447-a139-1cc35862ae67\\college_hero_cap_1784189296730.png";
const dest = path.join(__dirname, "public", "college-hero-cap.png");

try {
  fs.copyFileSync(source, dest);
  console.log("Successfully copied hero image!");
} catch (err) {
  console.error("Error copying file:", err);
}
