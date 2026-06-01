import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/guards';
const schema = z.object({ groupId: z.string(), fromUserId: z.string(), toUserId: z.string(), amount: z.number().positive() });
export async function POST(req: Request) {
 const auth=await requireUser(); if('error' in auth) return auth.error;
 const parsed=schema.safeParse(await req.json()); if(!parsed.success) return NextResponse.json({error:parsed.error.flatten()},{status:400});
 const membership=await prisma.membership.findUnique({where:{userId_groupId:{userId:auth.userId, groupId:parsed.data.groupId}}});
 if(!membership) return NextResponse.json({error:'Not a group member'},{status:403});
 const settlement = await prisma.settlement.create({
  data: {
    groupId: parsed.data.groupId,
    fromId: parsed.data.fromUserId,
    toId: parsed.data.toUserId,
    amount: parsed.data.amount
  }
});
 return NextResponse.json(settlement,{status:201});
}
