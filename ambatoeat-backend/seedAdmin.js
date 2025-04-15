// seedAdmin.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ambatoeat.com' },
    update: {},
    create: {
      email: 'admin@ambatoeat.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });
  
  console.log('Admin created:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });