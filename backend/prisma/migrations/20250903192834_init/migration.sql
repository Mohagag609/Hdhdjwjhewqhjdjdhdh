-- CreateEnum
CREATE TYPE "public"."Direction" AS ENUM ('in', 'out');

-- CreateEnum
CREATE TYPE "public"."SettlementStatus" AS ENUM ('none', 'needs_to_pay', 'needs_refund', 'settled');

-- CreateTable
CREATE TABLE "public"."Project" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Phase" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "plannedAmount" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Phase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Partner" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectPartner" (
    "projectId" INTEGER NOT NULL,
    "partnerId" INTEGER NOT NULL,
    "percentage" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "ProjectPartner_pkey" PRIMARY KEY ("projectId","partnerId")
);

-- CreateTable
CREATE TABLE "public"."Supplier" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MaterialItem" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "phaseId" INTEGER NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "unit" TEXT,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaterialItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TreasuryTransaction" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "direction" "public"."Direction" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "txDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reference" TEXT,
    "partnerId" INTEGER,
    "supplierId" INTEGER,
    "phaseId" INTEGER,
    "materialItemId" INTEGER,
    "method" TEXT,
    "notes" TEXT,

    CONSTRAINT "TreasuryTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PartnerPhaseSettlement" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "phaseId" INTEGER NOT NULL,
    "partnerId" INTEGER NOT NULL,
    "amountDue" DECIMAL(65,30) NOT NULL,
    "amountPaidToDate" DECIMAL(65,30) NOT NULL,
    "delta" DECIMAL(65,30) NOT NULL,
    "status" "public"."SettlementStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerPhaseSettlement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Partner_name_key" ON "public"."Partner"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_name_key" ON "public"."Supplier"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerPhaseSettlement_projectId_phaseId_partnerId_key" ON "public"."PartnerPhaseSettlement"("projectId", "phaseId", "partnerId");

-- AddForeignKey
ALTER TABLE "public"."Phase" ADD CONSTRAINT "Phase_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectPartner" ADD CONSTRAINT "ProjectPartner_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectPartner" ADD CONSTRAINT "ProjectPartner_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "public"."Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MaterialItem" ADD CONSTRAINT "MaterialItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MaterialItem" ADD CONSTRAINT "MaterialItem_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "public"."Phase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MaterialItem" ADD CONSTRAINT "MaterialItem_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "public"."Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TreasuryTransaction" ADD CONSTRAINT "TreasuryTransaction_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TreasuryTransaction" ADD CONSTRAINT "TreasuryTransaction_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "public"."Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TreasuryTransaction" ADD CONSTRAINT "TreasuryTransaction_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "public"."Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TreasuryTransaction" ADD CONSTRAINT "TreasuryTransaction_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "public"."Phase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TreasuryTransaction" ADD CONSTRAINT "TreasuryTransaction_materialItemId_fkey" FOREIGN KEY ("materialItemId") REFERENCES "public"."MaterialItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PartnerPhaseSettlement" ADD CONSTRAINT "PartnerPhaseSettlement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PartnerPhaseSettlement" ADD CONSTRAINT "PartnerPhaseSettlement_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "public"."Phase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PartnerPhaseSettlement" ADD CONSTRAINT "PartnerPhaseSettlement_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "public"."Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
