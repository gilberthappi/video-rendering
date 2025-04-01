/*
  Warnings:

  - You are about to drop the column `duration` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `format` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `Video` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Video" DROP COLUMN "duration",
DROP COLUMN "format",
DROP COLUMN "height",
DROP COLUMN "metadata",
DROP COLUMN "size",
DROP COLUMN "width";
