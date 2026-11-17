-- CreateTable
CREATE TABLE "ActivityAchievement" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "programme" "Programme",
    "activityId" TEXT NOT NULL,
    "branchId" INTEGER NOT NULL,
    "total" INTEGER NOT NULL DEFAULT 0,
    "male" INTEGER NOT NULL DEFAULT 0,
    "female" INTEGER NOT NULL DEFAULT 0,
    "others" INTEGER NOT NULL DEFAULT 0,
    "disabledMale" INTEGER NOT NULL DEFAULT 0,
    "disabledFemale" INTEGER NOT NULL DEFAULT 0,
    "disabledOthers" INTEGER NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityAchievement_month_idx" ON "ActivityAchievement"("month");

-- CreateIndex
CREATE INDEX "ActivityAchievement_activityId_idx" ON "ActivityAchievement"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityAchievement_month_activityId_branchId_key" ON "ActivityAchievement"("month", "activityId", "branchId");

-- AddForeignKey
ALTER TABLE "ActivityAchievement" ADD CONSTRAINT "ActivityAchievement_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityAchievement" ADD CONSTRAINT "ActivityAchievement_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
