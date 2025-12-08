-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Content" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "applicationId" TEXT,
    "platform" TEXT NOT NULL,
    "contentUrl" TEXT NOT NULL,
    "postedAt" DATETIME NOT NULL,
    "lastViewCount" INTEGER NOT NULL DEFAULT 0,
    "lastViewCountCheckedAt" DATETIME,
    "likes" INTEGER,
    "comments" INTEGER,
    "shares" INTEGER,
    "followers" INTEGER,
    "views" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "earning" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Content_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Content_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "InfluencerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Content_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "CampaignApplication" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Content" ("applicationId", "campaignId", "comments", "contentUrl", "createdAt", "followers", "id", "influencerId", "lastViewCount", "lastViewCountCheckedAt", "likes", "platform", "postedAt", "shares", "updatedAt", "views") SELECT "applicationId", "campaignId", "comments", "contentUrl", "createdAt", "followers", "id", "influencerId", "lastViewCount", "lastViewCountCheckedAt", "likes", "platform", "postedAt", "shares", "updatedAt", "views" FROM "Content";
DROP TABLE "Content";
ALTER TABLE "new_Content" RENAME TO "Content";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
