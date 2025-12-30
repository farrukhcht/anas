import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(_: Request, { params }: any) {
  const emp = await prisma.employee.findUnique({
    where: { EmpID: Number(params.id) },
  });
  return NextResponse.json(emp);
}

export async function PUT(req: Request, { params }: any) {
  const body = await req.json();

  const emp = await prisma.employee.update({
    where: { EmpID: Number(params.id) },
    data: {
      EmpName: body.EmpName,
      EmpEmail: body.EmpEmail,
      EmpJoiningDate: new Date(body.EmpJoiningDate),
      EmpDepID: body.EmpDepID,
    },
  });

  return NextResponse.json(emp);
}

export async function DELETE(_: Request, { params }: any) {
  await prisma.employee.delete({
    where: { EmpID: Number(params.id) },
  });
  return NextResponse.json({ success: true });
}
