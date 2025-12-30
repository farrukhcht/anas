import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';

// GET /api/users/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = await params;
    // Ensure id is available
    if (!id) {
      return new NextResponse('User ID is required', { status: 400 });
    }

    // Convert string ID to integer
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return new NextResponse('Invalid user ID', { status: 400 });
    }

    // If not super admin, check permissions
    if (session.user.role !== 'SUPER_ADMIN') {
      // Check if user has any relevant permissions
      const hasRelevantPermission = await prisma.userPermission.findFirst({
        where: {
          userId: Number(session.user.id),
          module: 'userManagement',
          action: { in: ['read', 'update', 'delete'] },
          isGranted: true
        }
      });

      console.log('Session user ID:', session.user.id);
      console.log('Found relevant permission:', hasRelevantPermission);

      if (!hasRelevantPermission) {
        console.log('No relevant permission found');
        return new NextResponse('Unauthorized', { status: 401 });
      }

      // If user has permissions, they can only view their own row or rows they created
      const userToView = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, createdBy: true }
      });

      console.log('userToView.id:', userToView?.id, 'userToView.createdBy:', userToView?.createdBy);

      if (!userToView) {
        console.log('User to view not found');
        return new NextResponse('User not found', { status: 404 });
      }

      // Allow if it's their own row or a row they created
      if (String(userToView.id) !== String(session.user.id) && String(userToView.createdBy) !== String(session.user.id)) {
        console.log('Unauthorized: Not own row or created row');
        return new NextResponse('Unauthorized', { status: 401 });
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        permissions: {
          select: {
            module: true,
            action: true,
            isGranted: true
          }
        }
      }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// PUT /api/users/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = await params;
    // Convert string ID to integer
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return new NextResponse('Invalid user ID', { status: 400 });
    }

    const body = await request.json();
    const { name, phoneNumber, role, status, permissionIds } = body;

    // Validate required fields
    if (!name || !phoneNumber || !role || !status) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Get the user to be updated
    const userToUpdate = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, createdBy: true }
    });

    if (!userToUpdate) {
      return new NextResponse('User not found', { status: 404 });
    }

    // If not super admin, check permissions
    if (session.user.role !== 'SUPER_ADMIN') {
      // Check if user has update permission
      const hasUpdatePermission = await prisma.userPermission.findFirst({
        where: {
          userId: Number(session.user.id),
          module: 'userManagement',
          action: 'update',
          isGranted: true
        }
      });

      if (!hasUpdatePermission) {
        return new NextResponse('Unauthorized', { status: 401 });
      }

      // Check if the user is trying to update their own row or a row they created
      if (userId !== Number(session.user.id) && userToUpdate.createdBy !== Number(session.user.id)) {
        return new NextResponse('You can only update your own profile or users you created', { status: 403 });
      }

      // Prevent updating to super admin role
      if (role === 'SUPER_ADMIN') {
        return new NextResponse('Cannot update user to super admin role', { status: 403 });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phoneNumber,
        role,
        status,
        permissions: {
          deleteMany: {}, // Remove all existing permissions
          create: permissionIds.map((perm: { module: string; action: string }) => ({
            module: perm.module,
            action: perm.action,
            isGranted: true
          }))
        }
      },
      include: {
        permissions: {
          select: {
            module: true,
            action: true,
            isGranted: true
          }
        }
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { id } = await params;
  // Convert string ID to integer
  const userId = parseInt(id);
  if (isNaN(userId)) {
    return new NextResponse('Invalid user ID', { status: 400 });
  }
  
  try {
    // Get the user to be deleted
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, createdBy: true }
    });

    if (!userToDelete) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Check if the user is a super admin
    if (userToDelete.role === 'SUPER_ADMIN') {
      return new NextResponse('Cannot delete super admin users', { status: 403 });
    }

    // If not super admin, check permissions
    if (session.user.role !== 'SUPER_ADMIN') {
      // Check if user has delete permission
      const hasDeletePermission = await prisma.userPermission.findFirst({
        where: {
          userId: Number(session.user.id),
          module: 'userManagement',
          action: 'delete',
          isGranted: true
        }
      });

      if (!hasDeletePermission) {
        return new NextResponse('Unauthorized', { status: 401 });
      }

      // Check if the user created the user they're trying to delete
      if (userToDelete.createdBy !== Number(session.user.id)) {
        return new NextResponse('You can only delete users you created', { status: 403 });
      }
    }

    // Delete related records first
    await prisma.userActivity.deleteMany({ where: { userId } });
    await prisma.userPermission.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return new NextResponse('Error deleting user', { status: 500 });
  }
} 