import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const schema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8) });
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  const user = await prisma.user.create({ data: { name, email: email.toLowerCase(), passwordHash: await hash(password, 12) }, select: { id: true, name: true, email: true } });
  return NextResponse.json(user, { status: 201 });
}
