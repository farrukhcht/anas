/*
  Warnings:

  - You are about to drop the column `permissionId` on the `UserPermission` table. All the data in the column will be lost.
  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,module,action]` on the table `UserPermission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `action` to the `UserPermission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `module` to the `UserPermission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserPermission" DROP CONSTRAINT "UserPermission_permissionId_fkey";

-- DropIndex
DROP INDEX "UserPermission_userId_permissionId_key";

-- AlterTable
ALTER TABLE "UserPermission" DROP COLUMN "permissionId",
ADD COLUMN     "action" TEXT NOT NULL,
ADD COLUMN     "module" TEXT NOT NULL;

-- DropTable
DROP TABLE "Permission";

-- CreateIndex
CREATE UNIQUE INDEX "UserPermission_userId_module_action_key" ON "UserPermission"("userId", "module", "action");
