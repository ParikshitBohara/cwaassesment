-- CreateTable
CREATE TABLE "Progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentNumber" TEXT NOT NULL,
    "stage1" BOOLEAN NOT NULL DEFAULT false,
    "stage2" BOOLEAN NOT NULL DEFAULT false,
    "stage3" BOOLEAN NOT NULL DEFAULT false,
    "elapsedSeconds" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Progress_studentNumber_idx" ON "Progress"("studentNumber");
