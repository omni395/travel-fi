/*
  Warnings:

  - Added the required column `lastActivity` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Session" ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastActivity" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "expiresAt" DROP DEFAULT;
