-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InfluencerProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "category" TEXT,
    "followerCount" INTEGER,
    "country" TEXT,
    "gender" TEXT,
    "ageRange" TEXT,
    "interests" TEXT,
    "city" TEXT,
    "instagramFollowers" INTEGER,
    "tiktokFollowers" INTEGER,
    "youtubeFollowers" INTEGER,
    "instagramUrl" TEXT,
    "tiktokUrl" TEXT,
    "youtubeUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InfluencerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_InfluencerProfile" ("ageRange", "bio", "category", "country", "createdAt", "displayName", "followerCount", "gender", "id", "interests", "updatedAt", "userId") SELECT "ageRange", "bio", "category", "country", "createdAt", "displayName", "followerCount", "gender", "id", "interests", "updatedAt", "userId" FROM "InfluencerProfile";
DROP TABLE "InfluencerProfile";
ALTER TABLE "new_InfluencerProfile" RENAME TO "InfluencerProfile";
CREATE UNIQUE INDEX "InfluencerProfile_userId_key" ON "InfluencerProfile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
