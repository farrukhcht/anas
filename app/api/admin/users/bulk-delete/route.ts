import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/authOptions';

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { userIds } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return new NextResponse('Invalid user IDs', { status: 400 });
    }

    // Check if any of the users to be deleted are super admins
    const superAdmins = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        role: 'SUPER_ADMIN',
      },
    });

    if (superAdmins.length > 0) {
      return new NextResponse('Cannot delete super admin users', { status: 400 });
    }

    // Delete the users
    await prisma.user.deleteMany({
      where: {
        id: { in: userIds },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 