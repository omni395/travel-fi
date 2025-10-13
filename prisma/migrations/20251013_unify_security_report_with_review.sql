-- AlterSecurityReportToMatchReview
-- Обновляем SecurityReport чтобы он соответствовал структуре Review
ALTER TABLE "SecurityReport" ALTER COLUMN "rating" SET NOT NULL;
ALTER TABLE "SecurityReport" DROP COLUMN IF EXISTS "toxicityScore";
ALTER TABLE "SecurityReport" RENAME COLUMN "risks" TO "comment";

-- Добавляем поле для среднего рейтинга безопасности в WifiPoint
ALTER TABLE "WifiPoint" ADD COLUMN IF NOT EXISTS "securityRating" FLOAT;