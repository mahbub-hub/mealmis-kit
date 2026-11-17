/*
  Warnings:

  - You are about to drop the column `name` on the `Activity` table. All the data in the column will be lost.
  - The primary key for the `Branch` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `district` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `union` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `upazilla` on the `Branch` table. All the data in the column will be lost.
  - The `id` column on the `Branch` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResultEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[activityCode]` on the table `Activity` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[activityName,projectId]` on the table `Activity` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Branch` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,districtId]` on the table `Branch` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `activityCode` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `activityName` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branchId` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Branch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `districtId` to the `Branch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `divisionId` to the `Branch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `upazillaId` to the `Branch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Branch` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER', 'SUPERVISOR');

-- CreateEnum
CREATE TYPE "IndicatorCategory" AS ENUM ('OUTPUT', 'OUTCOME', 'IMPACT', 'PROCESS');

-- CreateEnum
CREATE TYPE "ReportingFrequency" AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('Pending', 'Ongoing', 'Completed', 'Cancelled');

-- CreateEnum
CREATE TYPE "MeasurementFrequency" AS ENUM ('Monthly', 'Quarterly', 'BiAnnual', 'Annual');

-- CreateEnum
CREATE TYPE "DonorType" AS ENUM ('GOVERNMENT', 'INTERNATIONAL', 'PRIVATE', 'NGO', 'BILATERAL', 'MULTILATERAL', 'CORPORATE', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'APPROVED', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED', 'EVALUATION');

-- CreateEnum
CREATE TYPE "IndicatorType" AS ENUM ('OUTPUT', 'OUTCOME', 'IMPACT', 'PROCESS', 'INPUT');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('ILLITERATE', 'PRIMARY', 'SECONDARY', 'SSC', 'HSC', 'GRADUATE', 'POST_GRADUATE', 'VOCATIONAL', 'OTHER');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'DROPOUT', 'SUSPENDED', 'TRANSFERRED');

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropForeignKey
ALTER TABLE "ResultEntry" DROP CONSTRAINT "ResultEntry_activityId_fkey";

-- DropForeignKey
ALTER TABLE "ResultEntry" DROP CONSTRAINT "ResultEntry_branchId_fkey";

-- DropIndex
DROP INDEX "Activity_name_key";

-- DropIndex
DROP INDEX "Branch_name_key";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "name",
ADD COLUMN     "activityCode" TEXT NOT NULL,
ADD COLUMN     "activityName" TEXT NOT NULL,
ADD COLUMN     "branchId" INTEGER NOT NULL,
ADD COLUMN     "disabledFemale" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "disabledMale" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "disabledOthers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "female" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "male" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "others" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "projectId" INTEGER NOT NULL,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "status" "ActivityStatus" NOT NULL DEFAULT 'Pending',
ADD COLUMN     "totalParticipants" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Branch" DROP CONSTRAINT "Branch_pkey",
DROP COLUMN "district",
DROP COLUMN "union",
DROP COLUMN "upazilla",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "districtId" INTEGER NOT NULL,
ADD COLUMN     "divisionId" INTEGER NOT NULL,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "unionId" INTEGER,
ADD COLUMN     "upazillaId" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Branch_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "ResultEntry";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "divisions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "divisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "districts" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "divisionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upazillas" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "districtId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "upazillas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "upazillaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donors" (
    "id" SERIAL NOT NULL,
    "donorName" TEXT NOT NULL,
    "donorType" TEXT,
    "discipline" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "projectId" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "projectType" TEXT,
    "projectDuration" INTEGER,
    "programme" "Programme" NOT NULL,
    "donorId" INTEGER NOT NULL,
    "districtId" INTEGER NOT NULL,
    "upazillaId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "budget" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "status" "ParticipantStatus" NOT NULL DEFAULT 'ACTIVE',
    "totalTarget" INTEGER NOT NULL DEFAULT 0,
    "targetMale" INTEGER NOT NULL DEFAULT 0,
    "targetFemale" INTEGER NOT NULL DEFAULT 0,
    "targetOther" INTEGER NOT NULL DEFAULT 0,
    "targetDisabled" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "discription" TEXT,
    "objectives" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indicators" (
    "id" TEXT NOT NULL,
    "indicatorCode" TEXT NOT NULL,
    "indicatorName" TEXT NOT NULL,
    "description" TEXT,
    "projectId" INTEGER NOT NULL,
    "category" "IndicatorCategory" NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'Number',
    "targetValue" DECIMAL(15,2) NOT NULL,
    "baselineValue" DECIMAL(15,2),
    "achievedValue" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "targetMale" INTEGER NOT NULL DEFAULT 0,
    "targetFemale" INTEGER NOT NULL DEFAULT 0,
    "targetOther" INTEGER NOT NULL DEFAULT 0,
    "achievedMale" INTEGER NOT NULL DEFAULT 0,
    "achievedFemale" INTEGER NOT NULL DEFAULT 0,
    "achievedOther" INTEGER NOT NULL DEFAULT 0,
    "reportingFrequency" "ReportingFrequency" NOT NULL DEFAULT 'MONTHLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "indicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participants" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "fatherName" TEXT,
    "motherName" TEXT,
    "gender" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "age" INTEGER,
    "nid" TEXT,
    "projectId" INTEGER NOT NULL,
    "activityId" TEXT,
    "branchId" INTEGER NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "district" TEXT NOT NULL,
    "upazila" TEXT NOT NULL,
    "union" TEXT NOT NULL,
    "village" TEXT,
    "maritalStatus" "MaritalStatus",
    "education" "EducationLevel",
    "occupation" TEXT,
    "isDisabled" BOOLEAN NOT NULL DEFAULT false,
    "disabilityType" TEXT,
    "isMinority" BOOLEAN NOT NULL DEFAULT false,
    "householdHead" BOOLEAN NOT NULL DEFAULT false,
    "familyMembers" INTEGER,
    "monthlyIncome" DECIMAL(10,2),
    "photoUrl" TEXT,
    "remarks" TEXT,
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ParticipantStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DivisionToProject" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_DivisionToProject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_BranchToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_BranchToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProjectToUnion" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ProjectToUnion_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProjectToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ProjectToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ActivityToIndicator" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ActivityToIndicator_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ActivityToUser" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ActivityToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ParticipantToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ParticipantToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "divisions_name_key" ON "divisions"("name");

-- CreateIndex
CREATE INDEX "divisions_name_idx" ON "divisions"("name");

-- CreateIndex
CREATE INDEX "districts_name_idx" ON "districts"("name");

-- CreateIndex
CREATE INDEX "districts_divisionId_idx" ON "districts"("divisionId");

-- CreateIndex
CREATE UNIQUE INDEX "districts_name_divisionId_key" ON "districts"("name", "divisionId");

-- CreateIndex
CREATE INDEX "upazillas_name_idx" ON "upazillas"("name");

-- CreateIndex
CREATE INDEX "upazillas_districtId_idx" ON "upazillas"("districtId");

-- CreateIndex
CREATE UNIQUE INDEX "upazillas_name_districtId_key" ON "upazillas"("name", "districtId");

-- CreateIndex
CREATE INDEX "unions_name_idx" ON "unions"("name");

-- CreateIndex
CREATE INDEX "unions_upazillaId_idx" ON "unions"("upazillaId");

-- CreateIndex
CREATE UNIQUE INDEX "unions_name_upazillaId_key" ON "unions"("name", "upazillaId");

-- CreateIndex
CREATE UNIQUE INDEX "donors_donorName_key" ON "donors"("donorName");

-- CreateIndex
CREATE INDEX "donors_donorName_idx" ON "donors"("donorName");

-- CreateIndex
CREATE UNIQUE INDEX "projects_projectId_key" ON "projects"("projectId");

-- CreateIndex
CREATE INDEX "projects_projectName_idx" ON "projects"("projectName");

-- CreateIndex
CREATE INDEX "projects_donorId_idx" ON "projects"("donorId");

-- CreateIndex
CREATE INDEX "projects_districtId_idx" ON "projects"("districtId");

-- CreateIndex
CREATE INDEX "projects_upazillaId_idx" ON "projects"("upazillaId");

-- CreateIndex
CREATE INDEX "projects_branchId_idx" ON "projects"("branchId");

-- CreateIndex
CREATE INDEX "projects_programme_idx" ON "projects"("programme");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_startDate_endDate_idx" ON "projects"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "projects_projectName_branchId_key" ON "projects"("projectName", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "indicators_indicatorCode_key" ON "indicators"("indicatorCode");

-- CreateIndex
CREATE INDEX "indicators_projectId_idx" ON "indicators"("projectId");

-- CreateIndex
CREATE INDEX "indicators_category_idx" ON "indicators"("category");

-- CreateIndex
CREATE INDEX "participants_projectId_idx" ON "participants"("projectId");

-- CreateIndex
CREATE INDEX "participants_activityId_idx" ON "participants"("activityId");

-- CreateIndex
CREATE INDEX "participants_gender_idx" ON "participants"("gender");

-- CreateIndex
CREATE INDEX "participants_status_idx" ON "participants"("status");

-- CreateIndex
CREATE INDEX "_DivisionToProject_B_index" ON "_DivisionToProject"("B");

-- CreateIndex
CREATE INDEX "_BranchToUser_B_index" ON "_BranchToUser"("B");

-- CreateIndex
CREATE INDEX "_ProjectToUnion_B_index" ON "_ProjectToUnion"("B");

-- CreateIndex
CREATE INDEX "_ProjectToUser_B_index" ON "_ProjectToUser"("B");

-- CreateIndex
CREATE INDEX "_ActivityToIndicator_B_index" ON "_ActivityToIndicator"("B");

-- CreateIndex
CREATE INDEX "_ActivityToUser_B_index" ON "_ActivityToUser"("B");

-- CreateIndex
CREATE INDEX "_ParticipantToUser_B_index" ON "_ParticipantToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_activityCode_key" ON "Activity"("activityCode");

-- CreateIndex
CREATE INDEX "Activity_activityName_idx" ON "Activity"("activityName");

-- CreateIndex
CREATE INDEX "Activity_projectId_idx" ON "Activity"("projectId");

-- CreateIndex
CREATE INDEX "Activity_status_idx" ON "Activity"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_activityName_projectId_key" ON "Activity"("activityName", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_code_key" ON "Branch"("code");

-- CreateIndex
CREATE INDEX "Branch_name_idx" ON "Branch"("name");

-- CreateIndex
CREATE INDEX "Branch_districtId_idx" ON "Branch"("districtId");

-- CreateIndex
CREATE INDEX "Branch_upazillaId_idx" ON "Branch"("upazillaId");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_name_districtId_key" ON "Branch"("name", "districtId");

-- AddForeignKey
ALTER TABLE "districts" ADD CONSTRAINT "districts_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "divisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upazillas" ADD CONSTRAINT "upazillas_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unions" ADD CONSTRAINT "unions_upazillaId_fkey" FOREIGN KEY ("upazillaId") REFERENCES "upazillas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "divisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_upazillaId_fkey" FOREIGN KEY ("upazillaId") REFERENCES "upazillas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_unionId_fkey" FOREIGN KEY ("unionId") REFERENCES "unions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "donors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_upazillaId_fkey" FOREIGN KEY ("upazillaId") REFERENCES "upazillas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicators" ADD CONSTRAINT "indicators_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DivisionToProject" ADD CONSTRAINT "_DivisionToProject_A_fkey" FOREIGN KEY ("A") REFERENCES "divisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DivisionToProject" ADD CONSTRAINT "_DivisionToProject_B_fkey" FOREIGN KEY ("B") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BranchToUser" ADD CONSTRAINT "_BranchToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BranchToUser" ADD CONSTRAINT "_BranchToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToUnion" ADD CONSTRAINT "_ProjectToUnion_A_fkey" FOREIGN KEY ("A") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToUnion" ADD CONSTRAINT "_ProjectToUnion_B_fkey" FOREIGN KEY ("B") REFERENCES "unions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToUser" ADD CONSTRAINT "_ProjectToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToUser" ADD CONSTRAINT "_ProjectToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActivityToIndicator" ADD CONSTRAINT "_ActivityToIndicator_A_fkey" FOREIGN KEY ("A") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActivityToIndicator" ADD CONSTRAINT "_ActivityToIndicator_B_fkey" FOREIGN KEY ("B") REFERENCES "indicators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActivityToUser" ADD CONSTRAINT "_ActivityToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActivityToUser" ADD CONSTRAINT "_ActivityToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParticipantToUser" ADD CONSTRAINT "_ParticipantToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParticipantToUser" ADD CONSTRAINT "_ParticipantToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
