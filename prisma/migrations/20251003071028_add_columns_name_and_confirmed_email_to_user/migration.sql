-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "confirmedEmail" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" TEXT;
