import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import { logActivity } from '@/app/lib/activityLogger';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  await logActivity({
    userId: parseInt(session.user.id),
    action: 'LOGOUT',
    details: 'User logged out',
    // Optionally, you can add ipAddress and userAgent here if needed
  });
  return NextResponse.json({ success: true });
} 