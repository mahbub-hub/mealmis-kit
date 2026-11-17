-- CreateEnum
CREATE TYPE "Programme" AS ENUM ('SELP', 'TBCP', 'MEP', 'WASH', 'Migration', 'BEP', 'BHP', 'UPGP', 'UDP', 'DRMP', 'SDP', 'MF', 'IDP', 'CCP');

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "district" TEXT,
    "upazilla" TEXT,
    "union" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResultEntry" (
    "id" TEXT NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "programme" "Programme" NOT NULL,
    "district" TEXT NOT NULL,
    "upazilla" TEXT NOT NULL,
    "union" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "totalAchievements" INTEGER NOT NULL,
    "male" INTEGER NOT NULL DEFAULT 0,
    "female" INTEGER NOT NULL DEFAULT 0,
    "others" INTEGER NOT NULL DEFAULT 0,
    "disableMale" INTEGER NOT NULL DEFAULT 0,
    "disableFemale" INTEGER NOT NULL DEFAULT 0,
    "disableOthers" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResultEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Branch_name_key" ON "Branch"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_name_key" ON "Activity"("name");

-- CreateIndex
CREATE INDEX "ResultEntry_month_programme_idx" ON "ResultEntry"("month", "programme");

-- CreateIndex
CREATE INDEX "ResultEntry_district_upazilla_union_idx" ON "ResultEntry"("district", "upazilla", "union");

-- CreateIndex
CREATE INDEX "ResultEntry_branchId_activityId_idx" ON "ResultEntry"("branchId", "activityId");

-- AddForeignKey
ALTER TABLE "ResultEntry" ADD CONSTRAINT "ResultEntry_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultEntry" ADD CONSTRAINT "ResultEntry_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
