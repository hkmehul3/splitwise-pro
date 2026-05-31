import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/guards';

const schema = z.object({ groupId: z.string(), description: z.string().min(2), amount: z.number().positive(), category: z.enum(['FOOD','TRAVEL','HOUSING','ENTERTAINMENT','UTILITIES','OTHER']).default('OTHER'), paidById: z.string(), splitUserIds: z.array(z.string()).min(1), date: z.string().optional() });
export async function POST(req: Request) {
  const auth = await requireUser(); if ('error' in auth) return auth.error;
  const parsed = schema.safeParse(await req.json()); if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { groupId, description, amount, category, paidById, splitUserIds, date } = parsed.data;
  const member = await prisma.membership.findUnique({ where: { userId_groupId: { userId: auth.userId, groupId } } });
  if (!member) return NextResponse.json({ error: 'Not a group member' }, { status: 403 });
  const share = Number((amount / splitUserIds.length).toFixed(2));
  const expense = await prisma.expense.create({ data: { groupId, description, amount, category, paidById, date: date ? new Date(date) : new Date(), splits: { create: splitUserIds.map(userId => ({ userId, share })) } }, include: { splits: true, paidBy: true } });
  return NextResponse.json(expense, { status: 201 });
}
