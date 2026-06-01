import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await hash('Password123!', 10);

  const users = await Promise.all(
    [
      ['Harseet Tiwari', 'harseet@example.com'],
      ['Aarav Sharma', 'aarav@example.com'],
      ['Priya Singh', 'priya@example.com'],
      ['Rohan Mehta', 'rohan@example.com']
    ].map(([name, email]) =>
      prisma.user.upsert({
        where: { email },
        update: {},
        create: { name, email, password }
      })
    )
  );

  const [me, aarav, priya, rohan] = users;

  const group = await prisma.group.upsert({
    where: { id: 'demo-goa-trip' },
    update: {},
    create: {
      id: 'demo-goa-trip',
      name: 'Goa Trip',
      color: '#1D9E75'
    }
  });

  await Promise.all(
    users.map(user =>
      prisma.membership.upsert({
        where: {
          userId_groupId: {
            userId: user.id,
            groupId: group.id
          }
        },
        update: {},
        create: {
          userId: user.id,
          groupId: group.id
        }
      })
    )
  );

  async function createExpense(
    title: string,
    amount: number,
    category: string,
    paidById: string,
    splitIds: string[],
    date: string
  ) {
    const existing = await prisma.expense.findFirst({
      where: { groupId: group.id, title }
    });

    if (existing) return;

    const share = Number((amount / splitIds.length).toFixed(2));

    await prisma.expense.create({
      data: {
        groupId: group.id,
        title,
        amount,
        category,
        paidById,
        date: new Date(date),
        splits: {
          create: splitIds.map(userId => ({
            userId,
            amount: share
          }))
        }
      }
    });
  }

  await createExpense('Hotel Airbnb', 8400, 'housing', me.id, users.map(u => u.id), '2026-05-10');
  await createExpense('Dinner at Thalassa', 2200, 'food', aarav.id, users.map(u => u.id), '2026-05-11');
  await createExpense('Scooter rental', 1600, 'travel', priya.id, [me.id, priya.id, rohan.id], '2026-05-12');

  console.log('Seed completed successfully.');
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
