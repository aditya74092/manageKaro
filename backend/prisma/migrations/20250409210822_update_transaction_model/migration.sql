/*
  Warnings:

  - You are about to drop the column `totalAmount` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `sellingPrice` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "totalAmount",
ADD COLUMN     "sellingPrice" DOUBLE PRECISION NOT NULL;
