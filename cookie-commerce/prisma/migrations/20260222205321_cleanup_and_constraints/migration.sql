/*
  Warnings:

  - You are about to drop the column `rememberToken` on the `sessions` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "sessions_rememberToken_key";

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "rememberToken";
