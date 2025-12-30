import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Fetching session...');
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session?.user) {
      console.log('No session or user found');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the user ID from the session
    const userId = session.user.id;
    console.log('User ID from session:', userId);

    if (!userId) {
      console.log('No user ID found in session');
      return new NextResponse('User ID not found in session', { status: 400 });
    }

    // Get user with their permissions
    const user = await prisma.user.findUnique({
      where: {
        id: typeof userId === 'string' ? parseInt(userId, 10) : userId
      },
      include: {
        permissions: {
          where: {
            isGranted: true
          },
          select: {
            module: true,
            action: true
          }
        }
      }
    });

    console.log('Found user:', {
      id: user?.id,
      role: user?.role,
      permissions: user?.permissions
    });

    if (!user) {
      console.log('User not found in database');
      return new NextResponse('User not found', { status: 404 });
    }

    // Log the permissions being returned
    console.log('Returning permissions:', user.permissions);

    // Return the permissions
    return NextResponse.json(user.permissions);
  } catch (error) {
    console.error('Detailed error in permissions API:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 