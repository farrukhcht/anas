import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(_: Request, { params }: any) {
  const dep = await prisma.department.findUnique({
    where: { DepID: Number(params.id) },
  });
  return NextResponse.json(dep);
}

export async function PUT(req: Request, { params }: any) {
  const body = await req.json();

  const dep = await prisma.department.update({
    where: { DepID: Number(params.id) },
    data: {
      DepName: body.DepName,
      DepDes: body.DepDes,
    },
  });

  return NextResponse.json(dep);
}

export async function DELETE(_: Request, { params }: any) {
  try {
    await prisma.department.delete({
      where: { DepID: Number(params.id) },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Cannot delete. Employees are linked to this department" },
      { status: 400 }
    );
  }
}
