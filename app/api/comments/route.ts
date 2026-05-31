import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/guards';
const schema=z.object({expenseId:z.string(), body:z.string().min(1).max(500)});
export async function POST(req:Request){
 const auth=await requireUser(); if('error' in auth) return auth.error;
 const parsed=schema.safeParse(await req.json()); if(!parsed.success) return NextResponse.json({error:parsed.error.flatten()},{status:400});
 const expense=await prisma.expense.findUnique({where:{id:parsed.data.expenseId}, include:{group:true}});
 if(!expense) return NextResponse.json({error:'Expense not found'},{status:404});
 const member=await prisma.membership.findUnique({where:{userId_groupId:{userId:auth.userId, groupId:expense.groupId}}});
 if(!member) return NextResponse.json({error:'Not a group member'},{status:403});
 const comment=await prisma.comment.create({data:{expenseId:parsed.data.expenseId,userId:auth.userId,body:parsed.data.body}, include:{user:{select:{name:true,email:true}}}});
 return NextResponse.json(comment,{status:201});
}
