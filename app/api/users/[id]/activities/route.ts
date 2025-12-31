// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { prisma } from '@/lib/prisma';
// import { authOptions } from '@/app/api/auth/authOptions';

// export async function GET(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session) {
//       return new NextResponse('Unauthorized', { status: 401 });
//     }

//     const { id } = await params;
//     const { searchParams } = new URL(request.url);
//     const page = parseInt(searchParams.get('page') || '1');
//     const limit = parseInt(searchParams.get('limit') || '10');
//     const search = searchParams.get('search') || '';
//     const startDate = searchParams.get('startDate');
//     const endDate = searchParams.get('endDate');
//     const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

//     const skip = (page - 1) * limit;

//     // Build where clause
//     const where: any = {
//       userId: parseInt(id)
//     };

//     if (search) {
//       where.OR = [
//         { action: { contains: search, mode: 'insensitive' } },
//         { details: { contains: search, mode: 'insensitive' } }
//       ];
//     }

//     if (startDate || endDate) {
//       where.createdAt = {};
//       if (startDate && endDate && startDate === endDate) {
//         // If both dates are the same, include the full day
//         const start = new Date(startDate);
//         start.setHours(0, 0, 0, 0);
//         const end = new Date(endDate);
//         end.setHours(23, 59, 59, 999);
//         where.createdAt.gte = start;
//         where.createdAt.lte = end;
//       } else {
//         if (startDate) where.createdAt.gte = new Date(startDate);
//         if (endDate) {
//           const end = new Date(endDate);
//           end.setHours(23, 59, 59, 999);
//           where.createdAt.lte = end;
//         }
//       }
//     }

//     // Get total count
//     const total = await prisma.userActivity.count({ where });

//     // Get activities
//     const activities = await prisma.userActivity.findMany({
//       where,
//       include: {
//         user: {
//           select: {
//             id: true,
//             name: true,
//             phoneNumber: true,
//             role: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: order,
//       },
//       skip,
//       take: limit,
//     });

//     return NextResponse.json({
//       activities,
//       total,
//       pages: Math.ceil(total / limit),
//       currentPage: page,
//     });
//   } catch (error) {
//     console.error('Error fetching user activities:', error);
//     return new NextResponse('Internal Server Error', { status: 500 });
//   }
// } 

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/authOptions";

export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = context.params;

    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const search = searchParams.get("search") ?? "";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const order = searchParams.get("order") === "asc" ? "asc" : "desc";

    const skip = (page - 1) * limit;

    const where: any = {
      userId: Number(id),
    };

    if (search) {
      where.OR = [
        { action: { contains: search, mode: "insensitive" } },
        { details: { contains: search, mode: "insensitive" } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};

      if (startDate && endDate && startDate === endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        where.createdAt.gte = start;
        where.createdAt.lte = end;
      } else {
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          where.createdAt.lte = end;
        }
      }
    }

    const total = await prisma.userActivity.count({ where });

    const activities = await prisma.userActivity.findMany({
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
        createdAt: order,
      },
      skip,
      take: limit,
    });

    return NextResponse.json({
      activities,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching user activities:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
