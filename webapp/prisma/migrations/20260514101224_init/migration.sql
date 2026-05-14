-- CreateTable
CREATE TABLE "ThemeSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "lightPrimary" TEXT NOT NULL DEFAULT '#7c3aed',
    "lightAccent" TEXT NOT NULL DEFAULT '#ec4899',
    "lightBackground" TEXT NOT NULL DEFAULT '#fafafa',
    "lightForeground" TEXT NOT NULL DEFAULT '#18181b',
    "darkPrimary" TEXT NOT NULL DEFAULT '#a78bfa',
    "darkAccent" TEXT NOT NULL DEFAULT '#f472b6',
    "darkBackground" TEXT NOT NULL DEFAULT '#09090b',
    "darkForeground" TEXT NOT NULL DEFAULT '#fafafa',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThemeSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "source" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "userAgent" TEXT,
    "visitorHash" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");

-- CreateIndex
CREATE INDEX "PageView_path_idx" ON "PageView"("path");

-- CreateIndex
CREATE INDEX "PageView_source_idx" ON "PageView"("source");

-- CreateIndex
CREATE INDEX "PageView_visitorHash_idx" ON "PageView"("visitorHash");

-- AddForeignKey
ALTER TABLE "PageView" ADD CONSTRAINT "PageView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
