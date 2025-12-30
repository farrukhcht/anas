import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

const EXCLUDE = ['lib', 'context', 'generated', 'api', 'auth', 'components'];
const DEFAULT_ACTIONS = ['create', 'read', 'update', 'delete'];

function getModules() {
  const appDir = path.join(process.cwd(), 'app');
  const entries = fs.readdirSync(appDir, { withFileTypes: true });
  const modules: string[] = [];

  for (const entry of entries) {
    if (entry.isDirectory() && !EXCLUDE.includes(entry.name)) {
      modules.push(entry.name);
    }
  }

  // Add submodules from components (e.g., userManagement)
  const componentsDir = path.join(appDir, 'components');
  if (fs.existsSync(componentsDir)) {
    const compEntries = fs.readdirSync(componentsDir, { withFileTypes: true });
    for (const entry of compEntries) {
      if (entry.isDirectory()) {
        modules.push(entry.name);
      }
    }
  }

  return modules;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // If SUPER_ADMIN, return all permissions
  if (session.user.role === 'SUPER_ADMIN') {
    try {
      const modules = getModules();
      // Return as [{ module, action }]
      const permissions = modules.flatMap(module =>
        DEFAULT_ACTIONS.map(action => ({ module, action }))
      );
      return NextResponse.json(permissions);
    } catch (error) {
      return new NextResponse('Internal Server Error', { status: 500 });
    }
  }

  // For non-super-admins, check if they have userManagement:create or userManagement:update
  try {
    // Fetch the user's granted permissions
    const user = await prisma.user.findUnique({
      where: { id: typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id },
      include: {
        permissions: {
          where: { isGranted: true },
          select: { module: true, action: true }
        }
      }
    });
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    // Check if user has userManagement:create or userManagement:update
    const canCreateOrUpdate = user.permissions.some(
      p => p.module === 'userManagement' && (p.action === 'create' || p.action === 'update')
    );
    if (!canCreateOrUpdate) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    // Only return the permissions the user themselves has
    return NextResponse.json(user.permissions);
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 