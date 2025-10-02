-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "confirmationToken" TEXT,
ADD COLUMN     "confirmedEmail" BOOLEAN NOT NULL DEFAULT false;
