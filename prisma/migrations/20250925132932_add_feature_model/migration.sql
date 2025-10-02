/*
  Warnings:

  - You are about to drop the `UserFeature` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."UserFeature" DROP CONSTRAINT "UserFeature_userId_fkey";

-- DropTable
DROP TABLE "public"."UserFeature";

-- CreateTable
CREATE TABLE "public"."features" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_features" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "featureId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_features_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "features_key_key" ON "public"."features"("key");

-- CreateIndex
CREATE UNIQUE INDEX "user_features_userId_featureId_key" ON "public"."user_features"("userId", "featureId");

-- AddForeignKey
ALTER TABLE "public"."user_features" ADD CONSTRAINT "user_features_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_features" ADD CONSTRAINT "user_features_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "public"."features"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
