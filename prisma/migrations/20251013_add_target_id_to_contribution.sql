-- CreateMigration
ALTER TABLE "Contribution" ADD COLUMN IF NOT EXISTS "targetId" INTEGER;