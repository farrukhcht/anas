import { prisma } from '../lib/prisma';
import fs from 'fs';
import path from 'path';

const MODULES_DIR = path.join(__dirname, '../app/components');
const ACTIONS = ['read', 'write', 'delete', 'view'];

async function main() {
  const modules = fs.readdirSync(MODULES_DIR).filter((file) => {
    const fullPath = path.join(MODULES_DIR, file);
    return fs.statSync(fullPath).isDirectory() || file.endsWith('.tsx');
  });

  for (const module of modules) {
    const moduleName = module.replace('.tsx', '');
    for (const action of ACTIONS) {
      const permName = `${moduleName}:${action}`;
      const permModule = moduleName;
      const permAction = action;
      await prisma.permission.upsert({
        where: { module_action: { module: permModule, action: permAction } },
        update: {},
        create: {
          name: permName,
          module: permModule,
          action: permAction,
        },
      });
    }
  }
  console.log('Permissions seeded for modules:', modules);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 