-- Добавляем поля targetId и targetType в таблицу Contribution
ALTER TABLE "Contribution" ADD COLUMN "targetId" INTEGER;
ALTER TABLE "Contribution" ADD COLUMN "targetType" VARCHAR(255);