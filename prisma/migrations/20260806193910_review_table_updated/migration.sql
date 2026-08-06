/*
  Warnings:

  - You are about to drop the column `is_published` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `reviews` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "reviews_is_published_idx";

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "is_published",
DROP COLUMN "tags";
