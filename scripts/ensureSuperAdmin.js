const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function ensureSuperAdmin() {
  const superAdmin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
  });

  if (!superAdmin) {
    const password = 'admin123'; // Change after first login
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: 'Super Admin',
        phoneNumber: '0345-6543430', // Use the provided phone number
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
      },
    });

    console.log('Super admin recreated with phone: 0345-6543430 and password: admin123!');
  } else {
    console.log('Super admin exists.');
  }

  await prisma.$disconnect();
}

ensureSuperAdmin(); 