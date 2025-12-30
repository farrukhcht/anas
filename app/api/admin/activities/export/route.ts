import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import { prisma } from '@/lib/prisma';
import { Parser } from 'json2csv';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const userId = searchParams.get('userId');
  const action = searchParams.get('action');

  const where: any = {};

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  if (userId) where.userId = parseInt(userId);
  if (action) where.action = action;

  try {
    const activities = await prisma.userActivity.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            phoneNumber: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Add Activity and Session types
    type Activity = {
      action: string;
      createdAt: string | Date;
      details?: string | null;
      user?: any;
    };
    type Session = { login: Activity; logout: Activity | null };

    // Group activities into sessions for export
    function groupSessions(activities: Activity[]): Session[] {
      const sessions: Session[] = [];
      let currentSession: Session | null = null;
      for (const act of activities) {
        if (act.action === 'LOGIN') {
          if (currentSession) sessions.push(currentSession);
          currentSession = { login: act, logout: null };
        } else if (act.action === 'LOGOUT' && currentSession) {
          currentSession.logout = act;
          sessions.push(currentSession);
          currentSession = null;
        }
      }
      if (currentSession) sessions.push(currentSession);
      return sessions;
    }

    const sessions = groupSessions(activities);

    // Map sessions to CSV rows
    const mappedSessions = sessions.map((session, index) => {
      const loginTime = session.login ? (session.login.createdAt instanceof Date ? session.login.createdAt.toLocaleString() : new Date(session.login.createdAt).toLocaleString()) : '';
      const logoutTime = session.logout ? (session.logout.createdAt instanceof Date ? session.logout.createdAt.toLocaleString() : new Date(session.logout.createdAt).toLocaleString()) : '';
      let duration = '';
      if (session.login && session.logout) {
        const loginDate = new Date(session.login.createdAt);
        const logoutDate = new Date(session.logout.createdAt);
        const diff = Math.abs(logoutDate.getTime() - loginDate.getTime());
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        duration = `${mins}m ${secs}s`;
      } else {
        duration = '-';
      }
      return {
        'Login Time': loginTime,
        'Logout Time': logoutTime,
        'Session Duration': duration,
        'Activity': `Session ${index + 1}`
      };
    });

    const fields = [
      { label: 'Login Time', value: 'Login Time' },
      { label: 'Logout Time', value: 'Logout Time' },
      { label: 'Session Duration', value: 'Session Duration' },
      { label: 'Activity', value: 'Activity' }
    ];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(mappedSessions);

    // Add user info at the top of the CSV if available
    let csvWithHeader = csv;
    if (activities.length > 0 && activities[0].user) {
      const user = activities[0].user;
      const userInfo = [
        // Title with extra spacing for emphasis
        ['USER ACTIVITY REPORT'],
        [''],
        [''],
        // User info with clear labels and spacing
        ['USER INFORMATION'],
        [''],
        [`Name`, `${user.name}`],
        [`Phone`, `${user.phoneNumber}`],
        [`Role`, `${user.role}`],
        [''],
        [''],
        // Table header with clear separation
        ['ACTIVITY DETAILS'],
        [''],
        // Column headers with consistent capitalization
        ['LOGIN TIME', 'LOGOUT TIME', 'SESSION DURATION', 'ACTIVITY'],
        // Empty line for visual separation
        ['']
      ].map(row => row.join(',')).join('\n');

      // Add the actual data with consistent formatting
      const formattedData = mappedSessions.map(session => [
        session['Login Time'],
        session['Logout Time'],
        session['Session Duration'],
        session['Activity']
      ].join(','));

      csvWithHeader = userInfo + '\n' + formattedData.join('\n');

      // Add a footer with report generation info
      const footer = [
        [''],
        [''],
        [`Report Generated: ${new Date().toLocaleString()}`],
        [''],
        ['End of Report']
      ].map(row => row.join(',')).join('\n');

      csvWithHeader += '\n' + footer;
    }

    // Set filename with user's name if available
    const filename = activities.length > 0 && activities[0].user
      ? `activity-report-${activities[0].user.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`
      : `activity-report-${new Date().toISOString()}.csv`;

    return new NextResponse(csvWithHeader, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting activities:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 