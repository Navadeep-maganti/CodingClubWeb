/*
  Warnings:

  - You are about to drop the column `position` on the `TeamMember` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TeamMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "profileImage" TEXT,
    "strengths" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT NOT NULL DEFAULT 'Member',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TeamMember" ("bio", "category", "createdAt", "displayOrder", "id", "isActive", "isFeatured", "name", "profileImage", "strengths", "updatedAt", "userId") SELECT "bio", "category", "createdAt", "displayOrder", "id", "isActive", "isFeatured", "name", "profileImage", "strengths", "updatedAt", "userId" FROM "TeamMember";
DROP TABLE "TeamMember";
ALTER TABLE "new_TeamMember" RENAME TO "TeamMember";
CREATE UNIQUE INDEX "TeamMember_userId_key" ON "TeamMember"("userId");
CREATE INDEX "TeamMember_displayOrder_idx" ON "TeamMember"("displayOrder");
CREATE INDEX "TeamMember_isActive_idx" ON "TeamMember"("isActive");
CREATE INDEX "TeamMember_category_idx" ON "TeamMember"("category");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
