import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import { hash } from 'bcryptjs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // If super admin, return all users
    if (session.user.role === 'SUPER_ADMIN') {
      const users = await prisma.user.findMany({
        include: {
          permissions: true
        }
      });
      // Only include permissions with module and action fields
      const usersWithPermissions = users.map(user => ({
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
        status: user.status,
        createdBy: user.createdBy,
        permissions: user.permissions.filter(up => typeof up.module === 'string' && typeof up.action === 'string')
          .map(up => ({
            module: up.module,
            action: up.action,
            isGranted: up.isGranted
          }))
      }));
      return NextResponse.json(usersWithPermissions);
    }

    // For regular users, check if they have any relevant permissions
    const hasRelevantPermission = await prisma.userPermission.findFirst({
      where: {
        userId: Number(session.user.id),
        module: 'userManagement',
        action: { in: ['read', 'update', 'delete'] },
        isGranted: true
      }
    });

    if (!hasRelevantPermission) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get users that the current user created or their own row
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { id: Number(session.user.id) }, // Always include their own row
          { 
            AND: [
              { createdBy: Number(session.user.id) }, // Users they created
              { role: { not: 'SUPER_ADMIN' } } // But not super admins
            ]
          }
        ]
      },
      include: {
        permissions: true
      }
    });

    // Only include permissions with module and action fields
    const usersWithPermissions = users.map(user => ({
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      role: user.role,
      status: user.status,
      createdBy: user.createdBy,
      permissions: user.permissions.filter(up => typeof up.module === 'string' && typeof up.action === 'string')
        .map(up => ({
          module: up.module,
          action: up.action,
          isGranted: up.isGranted
        }))
    }));

    return NextResponse.json(usersWithPermissions);
  } catch (error) {
    console.error('Error fetching users:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Check if user has permission to create users
  const userPermission = await prisma.userPermission.findFirst({
    where: {
      userId: Number(session.user.id),
      module: 'userManagement',
      action: 'create',
      isGranted: true
    }
  });

  if (session.user.role !== 'SUPER_ADMIN' && !userPermission) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  const { name, phoneNumber, password, role, status, permissionIds } = body;
  if (!name || !phoneNumber || !password || !role) {
    return new NextResponse('Missing required fields', { status: 400 });
  }
  const hashedPassword = await hash(password, 12);
  // permissionIds is now an array of {module, action}
  const user = await prisma.user.create({
    data: {
      name,
      phoneNumber,
      password: hashedPassword,
      role,
      status,
      createdBy: Number(session.user.id),
      permissions: {
        create: (permissionIds || []).map((perm: {module: string, action: string}) => ({
          module: perm.module,
          action: perm.action,
          isGranted: true
        }))
      }
    },
    include: {
      permissions: true
    }
  });
  return NextResponse.json(user);
} 