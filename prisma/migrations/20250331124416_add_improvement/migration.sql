-- AlterEnum
ALTER TYPE "VideoStatus" ADD VALUE 'QUEUED';

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "metadata" JSONB;

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserRoles_userId_idx" ON "UserRoles"("userId");

-- CreateIndex
CREATE INDEX "Video_userId_idx" ON "Video"("userId");

-- CreateIndex
CREATE INDEX "Video_status_idx" ON "Video"("status");
