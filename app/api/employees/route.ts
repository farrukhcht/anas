import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { search = "", page = "1", limit = "10" } =
    Object.fromEntries(new URL(req.url).searchParams);

  const skip = (Number(page) - 1) * Number(limit);

  const data = await prisma.employee.findMany({
    where: {
      OR: [
        { EmpName: { contains: search, mode: "insensitive" } },
        { EmpEmail: { contains: search, mode: "insensitive" } },
      ],
    },
    include: { Department: true },
    orderBy: { EmpID: "desc" },
    skip,
    take: Number(limit),
  });

  const total = await prisma.employee.count({
    where: {
      OR: [
        { EmpName: { contains: search, mode: "insensitive" } },
        { EmpEmail: { contains: search, mode: "insensitive" } },
      ],
    },
  });

  return NextResponse.json({ data, total });
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.EmpName || !body.EmpEmail || !body.EmpJoiningDate || !body.EmpDepID) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  const emp = await prisma.employee.create({
    data: {
      EmpName: body.EmpName,
      EmpEmail: body.EmpEmail,
      EmpJoiningDate: new Date(body.EmpJoiningDate),
      EmpDepID: body.EmpDepID,
    },
  });

  return NextResponse.json(emp);
}
