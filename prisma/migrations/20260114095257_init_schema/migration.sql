/*
  Warnings:

  - You are about to drop the column `discipline` on the `donors` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "donors" DROP COLUMN "discipline",
ADD COLUMN     "country" TEXT,
ADD COLUMN     "description" TEXT;
