import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/guards';

const createSchema = z.object({ name: z.string().min(2), members: z.array(z.string().email()).default([]) });
export async function GET() {
  const auth = await requireUser(); if ('error' in auth) return auth.error;
  const groups = await prisma.group.findMany({
    where: { memberships: { some: { userId: auth.userId } } },
    include: { memberships: { include: { user: { select: { id:true, name:true, email:true } } } }, expenses: { include: { splits: true, paidBy: { select:{id:true,name:true} } } }, settlements: true },
    orderBy: { updatedAt: 'desc' }
  });
  return NextResponse.json(groups);
}
export async function POST(req: Request) {
  const auth = await requireUser(); if ('error' in auth) return auth.error;
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const group = await prisma.group.create({ data: { name: parsed.data.name, memberships: { create: { userId: auth.userId, role: 'owner' } } } });
  for (const email of parsed.data.members) {
    const u = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (u) await prisma.membership.upsert({ where: { userId_groupId: { userId: u.id, groupId: group.id } }, update: {}, create: { userId: u.id, groupId: group.id } });
  }
  return NextResponse.json(group, { status: 201 });
}
