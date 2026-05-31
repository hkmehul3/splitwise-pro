'use client';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import { Plus, Download, Users, Receipt, WalletCards } from 'lucide-react';

type Member = { user: { id:string; name:string; email:string } };
type Split = { userId:string; share:string };
type Expense = { id:string; description:string; amount:string; category:string; date:string; paidBy:{id:string;name:string}; splits:Split[] };
type Settlement = { amount:string; fromUserId:string; toUserId:string };
type Group = { id:string; name:string; color:string; memberships:Member[]; expenses:Expense[]; settlements:Settlement[] };

export function DashboardClient(){
  const { data: session } = useSession();
  const [groups,setGroups]=useState<Group[]>([]); const [loading,setLoading]=useState(true);
  async function load(){ const r=await fetch('/api/groups'); if(r.ok) setGroups(await r.json()); setLoading(false); }
  useEffect(()=>{load()},[]);
  const stats=useMemo(()=>{
    const userId=(session?.user as any)?.id; let spent=0, owed=0, lent=0;
    for(const g of groups){
      for(const e of g.expenses){
        const amount=Number(e.amount); const share=e.splits.find(s=>s.userId===userId);
        if(share) spent+=Number(share.share); if(e.paidBy.id===userId) lent+=amount; if(share && e.paidBy.id!==userId) owed+=Number(share.share);
      }
    }
    return {spent, balance:lent-spent, owed, expenses:groups.reduce((a,g)=>a+g.expenses.length,0)};
  },[groups,session]);
  function exportCsv(){
    const rows=['Group,Date,Description,Category,Amount,Paid By,Split Count',...groups.flatMap(g=>g.expenses.map(e=>`"${g.name}",${new Date(e.date).toISOString().slice(0,10)},"${e.description}",${e.category},${e.amount},"${e.paidBy.name}",${e.splits.length}`))];
    const blob=new Blob([rows.join('\n')],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='splitwise-pro-expenses.csv'; a.click(); URL.revokeObjectURL(url);
  }
  if(loading) return <div className="main">Loading dashboard...</div>;
  return <div className="shell"><aside className="sidebar"><div className="brand">split<span>wise</span> pro</div><nav className="nav"><a className="active">Dashboard</a><button onClick={exportCsv}><Download size={16}/> Export CSV</button><button onClick={()=>signOut({callbackUrl:'/login'})}>Logout</button></nav></aside><main className="main"><div className="top"><div><h1 className="h1">Dashboard</h1><p className="muted">Welcome, {session?.user?.name}. Track shared expenses, balances and settlements.</p></div><button className="btn primary" onClick={()=>alert('Use API POST /api/groups and /api/expenses or wire this button to a modal.') }><Plus size={16}/> Add expense</button></div><div className="grid"><Metric icon={<WalletCards/>} label="Overall balance" value={`₹${Math.abs(Math.round(stats.balance)).toLocaleString()}`} tone={stats.balance>=0?'green':'red'} helper={stats.balance>=0?'you are owed':'you owe'}/><Metric icon={<Receipt/>} label="Your spending" value={`₹${Math.round(stats.spent).toLocaleString()}`}/><Metric icon={<Users/>} label="Groups" value={String(groups.length)}/><Metric icon={<Receipt/>} label="Expenses" value={String(stats.expenses)}/></div><h2 className="section-title">Groups</h2><div className="list">{groups.length?groups.map(g=><div className="row" key={g.id}><div><strong>{g.name}</strong><div className="muted">{g.memberships.length} members · {g.expenses.length} expenses</div></div><div className="muted">₹{g.expenses.reduce((s,e)=>s+Number(e.amount),0).toLocaleString()}</div></div>):<div className="card">No groups yet. Create one with POST /api/groups or seed the demo database.</div>}</div><h2 className="section-title">Recent expenses</h2><div className="list">{groups.flatMap(g=>g.expenses.map(e=>({g,e}))).slice(0,8).map(({g,e})=><div className="row" key={e.id}><div><strong>{e.description}</strong><div className="muted">{g.name} · {e.category} · paid by {e.paidBy.name}</div></div><strong>₹{Number(e.amount).toLocaleString()}</strong></div>)}</div></main></div>
}
function Metric({label,value,helper,tone,icon}:{label:string;value:string;helper?:string;tone?:'green'|'red';icon:React.ReactNode}){return <div className="card"><div style={{display:'flex',justifyContent:'space-between'}}><div className="label">{label}</div>{icon}</div><div className={`value ${tone||''}`}>{value}</div>{helper&&<div className="muted">{helper}</div>}</div>}
