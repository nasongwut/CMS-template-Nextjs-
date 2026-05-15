-- AlterTable
ALTER TABLE "NavItem" ADD COLUMN     "parentId" TEXT,
ALTER COLUMN "target" SET DEFAULT '';

-- CreateIndex
CREATE INDEX "NavItem_parentId_idx" ON "NavItem"("parentId");

-- AddForeignKey
ALTER TABLE "NavItem" ADD CONSTRAINT "NavItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "NavItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
