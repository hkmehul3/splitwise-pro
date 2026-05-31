import { PrismaClient, ExpenseCategory } from '@prisma/client';
import { hash } from 'bcryptjs';
const prisma = new PrismaClient();
async function main(){
  const users = await Promise.all([
    ['Harseet Tiwari','harseet@example.com'],['Aarav Sharma','aarav@example.com'],['Priya Singh','priya@example.com'],['Rohan Mehta','rohan@example.com']
  ].map(([name,email])=>prisma.user.upsert({where:{email},update:{},create:{name,email,passwordHash:hash('Password@123',12)}})));
  const [me,aarav,priya,rohan]=users;
  const group=await prisma.group.upsert({where:{id:'demo-goa-trip'},update:{},create:{id:'demo-goa-trip',name:'Goa Trip',color:'#1D9E75'}});
  for(const u of users) await prisma.membership.upsert({where:{userId_groupId:{userId:u.id,groupId:group.id}},update:{},create:{userId:u.id,groupId:group.id,role:u.id===me.id?'owner':'member'}});
  async function expense(description:string, amount:number, category:ExpenseCategory, paidById:string, splitIds:string[], date:string){
    const share=Number((amount/splitIds.length).toFixed(2));
    return prisma.expense.create({data:{groupId:group.id,description,amount,category,paidById,date:new Date(date),splits:{create:splitIds.map(userId=>({userId,share}))}}});
  }
  if(await prisma.expense.count({where:{groupId:group.id}})===0){
    await expense('Hotel Airbnb',8400,'HOUSING',me.id,users.map(u=>u.id),'2026-05-10');
    await expense('Dinner at Thalassa',2200,'FOOD',aarav.id,users.map(u=>u.id),'2026-05-11');
    await expense('Scooter rental',1600,'TRAVEL',priya.id,[me.id,priya.id,rohan.id],'2026-05-12');
  }
}
main().finally(()=>prisma.$disconnect());
