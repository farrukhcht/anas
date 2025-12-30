/*
  Warnings:

  - You are about to drop the `employees` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "employees";

-- CreateTable
CREATE TABLE "Department" (
    "DepartmentID" SERIAL NOT NULL,
    "DepartmentName" TEXT NOT NULL,
    "DepartmentDes" TEXT,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("DepartmentID")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "DepartmentId" INTEGER,
    "DepartmentName" TEXT,
    "GroupId" INTEGER,
    "EmployeeId" INTEGER NOT NULL,
    "FileNo" TEXT,
    "FullName" TEXT,
    "Campus" TEXT,
    "Designation" TEXT,
    "Specialization" TEXT,
    "Status" VARCHAR(50),
    "DateOfBirth" TIMESTAMP(3),
    "Category" TEXT,
    "DateOfJoininig" TIMESTAMP(3),
    "Email" TEXT,
    "Password" TEXT,
    "Salt" TEXT,
    "IsAdmin" INTEGER,
    "AddedBy" INTEGER,
    "ShiftId" INTEGER,
    "IsRegisterar" INTEGER,
    "Cl" INTEGER,
    "EL" INTEGER,
    "Role" VARCHAR(50),
    "ReportingOfficer" INTEGER,
    "CNIC" TEXT,
    "TL" INTEGER,
    "Active" BOOLEAN DEFAULT true,
    "RegistrationDate" TIMESTAMP(3),
    "AllowOverTime" BOOLEAN DEFAULT false,
    "DesignationId" INTEGER,
    "OfficialEmail" TEXT,
    "AddedInMachine" BOOLEAN DEFAULT false,
    "OverTimeRate" DOUBLE PRECISION,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_EmployeeId_key" ON "Employee"("EmployeeId");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_DepartmentId_fkey" FOREIGN KEY ("DepartmentId") REFERENCES "Department"("DepartmentID") ON DELETE SET NULL ON UPDATE CASCADE;
