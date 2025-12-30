import { prisma } from '@/lib/prisma';

interface ActivityLogInput {
  userId: number;
  action: string;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function logActivity({
  userId,
  action,
  details,
  ipAddress,
  userAgent,
}: ActivityLogInput) {
  return prisma.userActivity.create({
    data: {
      userId,
      action,
      details,
      ipAddress,
      userAgent,
    },
  });
}

export async function exportActivities(
  startDate?: Date,
  endDate?: Date,
  userId?: string,
  action?: string
) {
  const where: any = {};

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  if (userId) where.userId = userId;
  if (action) where.action = action;

  return prisma.userActivity.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phoneNumber: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
} 