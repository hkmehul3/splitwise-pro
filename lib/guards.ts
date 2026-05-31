import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from './auth';

export async function requireUser() {
  const session = await getServerSession(authOptions);
  const id = (session?.user as any)?.id as string | undefined;
  if (!id) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  return { userId: id, session };
}
