-- CreateTable
CREATE TABLE "employees" (
    "id" SERIAL NOT NULL,
    "DepartmentId" INTEGER,
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

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_EmployeeId_key" ON "employees"("EmployeeId");
