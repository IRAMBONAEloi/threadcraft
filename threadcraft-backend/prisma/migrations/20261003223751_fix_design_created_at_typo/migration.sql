/*
  Warnings:

  - You are about to drop the column `craetedAt` on the `Design` table. All the data in the column will be lost.
  - You are about to drop the column `providerPayment` on the `Payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[providerPaymentId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `providerPaymentId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Made the column `isActive` on table `Variant` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Payment_providerPayment_key";

-- AlterTable
ALTER TABLE "Design" DROP COLUMN "craetedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "providerPayment",
ADD COLUMN     "providerPaymentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Variant" ALTER COLUMN "isActive" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_providerPaymentId_key" ON "Payment"("providerPaymentId");
