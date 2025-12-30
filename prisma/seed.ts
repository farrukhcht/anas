import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  
  // Create super admin user
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await hash(superAdminPassword, 12);

  const superAdmin = await prisma.user.upsert({
    where: { phoneNumber: '0345-6543430' },
    update: {},
    create: {
      name: 'Super Admin',
      phoneNumber: '0345-6543430',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      permissions: {
        create: [
          {
            module: 'users',
            action: 'manage',
            isGranted: true
          },
          {
            module: 'permissions',
            action: 'manage',
            isGranted: true
          }
        ]
      }
    },
    include: {
      permissions: true
    }
  });

  console.log('Super admin created:', {
    id: superAdmin.id,
    phoneNumber: superAdmin.phoneNumber,
    role: superAdmin.role,
    permissions: superAdmin.permissions
  });

  console.log('Database has been seeded. 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 