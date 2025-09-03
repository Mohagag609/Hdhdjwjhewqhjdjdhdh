"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const project = await prisma.project.create({
        data: {
            name: 'مشروع بناء 1',
            startDate: new Date('2025-01-01'),
            endDate: new Date('2026-01-01'),
        },
    });
    const partnerA = await prisma.partner.upsert({
        where: { name: 'شريك A' },
        update: {},
        create: { name: 'شريك A' },
    });
    const partnerB = await prisma.partner.upsert({
        where: { name: 'شريك B' },
        update: {},
        create: { name: 'شريك B' },
    });
    await prisma.projectPartner.createMany({
        data: [
            { projectId: project.id, partnerId: partnerA.id, percentage: new client_1.Prisma.Decimal(50) },
            { projectId: project.id, partnerId: partnerB.id, percentage: new client_1.Prisma.Decimal(50) },
        ],
        skipDuplicates: true,
    });
    const foundation = await prisma.phase.create({
        data: { projectId: project.id, name: 'الأساسات', plannedAmount: new client_1.Prisma.Decimal(100000) },
    });
    const cementSupplier = await prisma.supplier.upsert({
        where: { name: 'مورد الأسمنت' },
        update: {},
        create: { name: 'مورد الأسمنت' },
    });
    await prisma.materialItem.create({
        data: {
            projectId: project.id,
            phaseId: foundation.id,
            supplierId: cementSupplier.id,
            name: 'أسمنت',
            quantity: new client_1.Prisma.Decimal(10),
            unit: 'طن',
            unitPrice: new client_1.Prisma.Decimal(11500),
            total: new client_1.Prisma.Decimal(115000),
        },
    });
    await prisma.treasuryTransaction.createMany({
        data: [
            {
                projectId: project.id,
                direction: 'in',
                amount: new client_1.Prisma.Decimal(60000),
                partnerId: partnerA.id,
            },
            {
                projectId: project.id,
                direction: 'in',
                amount: new client_1.Prisma.Decimal(60000),
                partnerId: partnerB.id,
            },
        ],
    });
    await prisma.treasuryTransaction.create({
        data: {
            projectId: project.id,
            direction: 'out',
            amount: new client_1.Prisma.Decimal(100000),
            supplierId: cementSupplier.id,
            phaseId: foundation.id,
        },
    });
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=seed.js.map