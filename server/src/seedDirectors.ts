import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('Resetting users table to the 2 specified directors...');
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      { name: 'م. عبدالرحمن', email: 'admin', password: 'admin1234', role: 'مدير المشروع' },
      { name: 'م. عبدالسلام', email: 'admin_sectors', password: 'admin1234', role: 'مدير القطاعات' }
    ]
  });

  const users = await prisma.user.findMany();
  console.log('Current users:', users);
  await prisma.$disconnect();
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
});
