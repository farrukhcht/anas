import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { search = "", page = "1", limit = "10" } =
    Object.fromEntries(new URL(req.url).searchParams);

  const skip = (Number(page) - 1) * Number(limit);

  const data = await prisma.department.findMany({
    where: {
      DepName: { contains: search, mode: "insensitive" },
    },
    orderBy: { DepID: "desc" },
    skip,
    take: Number(limit),
  });

  const total = await prisma.department.count({
    where: { DepName: { contains: search, mode: "insensitive" } },
  });

  return NextResponse.json({ data, total });
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.DepName) {
    return NextResponse.json({ error: "Department Name required" }, { status: 400 });
  }

  const dep = await prisma.department.create({
    data: {
      DepName: body.DepName,
      DepDes: body.DepDes,
    },
  });

  return NextResponse.json(dep);
}
