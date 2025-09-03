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
    const partnerA = (await prisma.partner.findFirst({ where: { name: 'شريك A' } })) ||
        (await prisma.partner.create({ data: { name: 'شريك A' } }));
    const partnerB = (await prisma.partner.findFirst({ where: { name: 'شريك B' } })) ||
        (await prisma.partner.create({ data: { name: 'شريك B' } }));
    const existingLinks = await prisma.projectPartner.findMany({ where: { projectId: project.id } });
    const hasA = existingLinks.some((l) => l.partnerId === partnerA.id);
    const hasB = existingLinks.some((l) => l.partnerId === partnerB.id);
    if (!hasA) {
        await prisma.projectPartner.create({
            data: { projectId: project.id, partnerId: partnerA.id, percentage: new client_1.Prisma.Decimal(50) },
        });
    }
    if (!hasB) {
        await prisma.projectPartner.create({
            data: { projectId: project.id, partnerId: partnerB.id, percentage: new client_1.Prisma.Decimal(50) },
        });
    }
    const foundation = await prisma.phase.create({
        data: { projectId: project.id, name: 'الأساسات', plannedAmount: new client_1.Prisma.Decimal(100000) },
    });
    const cementSupplier = (await prisma.supplier.findFirst({ where: { name: 'مورد الأسمنت' } })) ||
        (await prisma.supplier.create({ data: { name: 'مورد الأسمنت' } }));
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