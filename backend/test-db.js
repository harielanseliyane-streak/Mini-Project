const prisma = require('./config/db');
const bcrypt = require('bcryptjs');

async function main() {
  const users = await prisma.user.findMany();
  console.log("Users in database:");
  for (const u of users) {
    const isMatch = await bcrypt.compare('college123', u.passwordHash);
    console.log(`ID: ${u.id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, PasswordHash: ${u.passwordHash}, Match college123: ${isMatch}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
