-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentNumber" TEXT NOT NULL,
    "stage1" BOOLEAN NOT NULL DEFAULT false,
    "stage2" BOOLEAN NOT NULL DEFAULT false,
    "stage3" BOOLEAN NOT NULL DEFAULT false,
    "stage4" BOOLEAN NOT NULL DEFAULT false,
    "elapsedSeconds" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Progress" ("createdAt", "elapsedSeconds", "id", "stage1", "stage2", "stage3", "studentNumber", "updatedAt") SELECT "createdAt", "elapsedSeconds", "id", "stage1", "stage2", "stage3", "studentNumber", "updatedAt" FROM "Progress";
DROP TABLE "Progress";
ALTER TABLE "new_Progress" RENAME TO "Progress";
CREATE INDEX "Progress_studentNumber_idx" ON "Progress"("studentNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
