import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const source = "C:\\Users\\HARI\\.gemini\\antigravity-ide\\brain\\2997fb2f-f594-4447-a139-1cc35862ae67\\media__1784190394816.jpg";
const dest = path.join(__dirname, "public", "college-bg-campus.jpg");

try {
  fs.copyFileSync(source, dest);
  console.log("Successfully copied campus background image!");
} catch (err) {
  console.error("Error copying file:", err);
}
