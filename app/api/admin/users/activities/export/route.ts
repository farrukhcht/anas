import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import { exportActivities } from '@/app/lib/activityLogger';

interface Activity {
  id: string;
  action: string;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    phoneNumber: string;
    role: string;
  };
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');

    const activities = await exportActivities(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      userId || undefined,
      action || undefined
    );

    // Convert activities to CSV
    const csvHeaders = ['Timestamp', 'User', 'Phone Number', 'Role', 'Action', 'Details', 'IP Address', 'User Agent'];
    const rows = activities.map((activity: Activity) => [
      new Date(activity.createdAt).toISOString(),
      activity.user.name,
      activity.user.phoneNumber,
      activity.user.role,
      activity.action,
      activity.details || '',
      activity.ipAddress || '',
      activity.userAgent || '',
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...rows.map((row: string[]) => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Set response headers for CSV download
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'text/csv');
    responseHeaders.set('Content-Disposition', 'attachment; filename=user-activities.csv');

    return new NextResponse(csvContent, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 