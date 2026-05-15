-- AlterTable
ALTER TABLE "ThemeSettings" ADD COLUMN     "siteStyle" TEXT NOT NULL DEFAULT 'studio',
ALTER COLUMN "lightPrimary" SET DEFAULT '#7e22ce',
ALTER COLUMN "lightAccent" SET DEFAULT '#f43f5e',
ALTER COLUMN "lightBackground" SET DEFAULT '#fafaf9',
ALTER COLUMN "lightForeground" SET DEFAULT '#1c1917',
ALTER COLUMN "darkPrimary" SET DEFAULT '#c084fc',
ALTER COLUMN "darkAccent" SET DEFAULT '#fb7185',
ALTER COLUMN "darkBackground" SET DEFAULT '#0c0a09',
ALTER COLUMN "darkForeground" SET DEFAULT '#f5f5f4';
