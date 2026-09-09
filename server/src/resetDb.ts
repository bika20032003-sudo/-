import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function reset() {
  console.log('Clearing all operational data...');
  await prisma.dailyReport.deleteMany();
  await prisma.crusherLog.deleteMany();
  await prisma.fuelDispatchLog.deleteMany();
  await prisma.fuelLog.deleteMany();
  await prisma.sharshoorLog.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.equipmentStatus.deleteMany();
  await prisma.tomorrowPlan.deleteMany();
  await prisma.alert.deleteMany();
  
  console.log('Database successfully reset to clean brand new state!');
  await prisma.$disconnect();
}

reset().catch(e => {
  console.error(e);
  process.exit(1);
});
