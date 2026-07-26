/*
  Warnings:

  - You are about to alter the column `telegramId` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Outfit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "baseItemId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Outfit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Outfit_baseItemId_fkey" FOREIGN KEY ("baseItemId") REFERENCES "WardrobeItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Outfit" ("baseItemId", "createdAt", "id", "name", "updatedAt", "userId") SELECT "baseItemId", "createdAt", "id", "name", "updatedAt", "userId" FROM "Outfit";
DROP TABLE "Outfit";
ALTER TABLE "new_Outfit" RENAME TO "Outfit";
CREATE INDEX "Outfit_userId_idx" ON "Outfit"("userId");
CREATE INDEX "Outfit_baseItemId_idx" ON "Outfit"("baseItemId");
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "telegramId" BIGINT NOT NULL,
    "username" TEXT,
    "firstName" TEXT,
    "language" TEXT NOT NULL,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "bannedUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("bannedUntil", "createdAt", "firstName", "id", "isBanned", "language", "telegramId", "updatedAt", "username") SELECT "bannedUntil", "createdAt", "firstName", "id", "isBanned", "language", "telegramId", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
