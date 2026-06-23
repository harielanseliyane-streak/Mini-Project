const prisma = require('./config/db');
const bcrypt = require('bcryptjs');

const candidates = [
  'college123',
  'student123',
  'password123',
  'hari123',
  'hari@123',
  'admin123',
  'admin',
  'college',
  'student',
  'infohub123',
  'infohub',
  'password',
  '123456',
  '12345678'
];

async function main() {
  const users = await prisma.user.findMany();
  for (const user of users) {
    console.log(`Checking user: ${user.email} (Role: ${user.role})`);
    let found = false;
    for (const c of candidates) {
      const match = await bcrypt.compare(c, user.passwordHash);
      if (match) {
        console.log(`  -> FOUND MATCH: "${c}"`);
        found = true;
        break;
      }
    }
    if (!found) {
      console.log(`  -> No match found in candidate list.`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
