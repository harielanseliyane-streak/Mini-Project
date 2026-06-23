const prisma = require('./config/db');
const bcrypt = require('bcryptjs');

async function main() {
  const collegeHash = await bcrypt.hash('college123', 10);
  const studentHash = await bcrypt.hash('student123', 10);

  // Update colleges
  await prisma.user.updateMany({
    where: { role: 'college' },
    data: { passwordHash: collegeHash }
  });
  console.log("Updated college users' passwords to 'college123'");

  // Update student (if exists)
  await prisma.user.updateMany({
    where: { email: 'harielanseliyan.e@gmail.com' },
    data: { passwordHash: studentHash }
  });
  console.log("Updated student user's password to 'student123'");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
