'use client';

import { signOut, useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import { Plus, Download, Users, Receipt, WalletCards } from 'lucide-react';

type Member = { user: { id: string; name: string; email: string } };
type Split = { userId: string; share?: string; amount?: string };
type Expense = {
  id: string;
  description?: string;
  title?: string;
  amount: string;
  category: string;
  date: string;
  paidBy: { id: string; name: string };
  splits: Split[];
};
type Settlement = { amount: string; fromUserId: string; toUserId: string };
type Group = {
  id: string;
  name: string;
  color: string;
  memberships: Member[];
  expenses: Expense[];
  settlements: Settlement[];
};

export function DashboardClient() {
  const { data: session } = useSession();

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState('');

  async function load() {
    const r = await fetch('/api/groups');
    if (r.ok) {
      const data = await r.json();
      setGroups(data);
      if (!selectedGroupId && data.length > 0) {
        setSelectedGroupId(data[0].id);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const activeGroup = groups.find(g => g.id === selectedGroupId) || groups[0];

  const stats = useMemo(() => {
    const userId = (session?.user as any)?.id;
    let spent = 0;
    let owed = 0;
    let lent = 0;

    for (const g of groups) {
      for (const e of g.expenses) {
        const amount = Number(e.amount);
        const split = e.splits.find(s => s.userId === userId);
        const splitAmount = Number(split?.amount ?? split?.share ?? 0);

        if (split) spent += splitAmount;
        if (e.paidBy.id === userId) lent += amount;
        if (split && e.paidBy.id !== userId) owed += splitAmount;
      }
    }

    return {
      spent,
      balance: lent - spent,
      owed,
      expenses: groups.reduce((a, g) => a + g.expenses.length, 0)
    };
  }, [groups, session]);

  function exportCsv() {
    const rows = [
      'Group,Date,Description,Category,Amount,Paid By,Split Count',
      ...groups.flatMap(g =>
        g.expenses.map(e => {
          const title = e.title || e.description || 'Expense';
          return `"${g.name}",${new Date(e.date).toISOString().slice(0, 10)},"${title}",${e.category},${e.amount},"${e.paidBy.name}",${e.splits.length}`;
        })
      )
    ];

    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = 'splitwise-pro-expenses.csv';
    a.click();

    URL.revokeObjectURL(url);
  }

  async function createExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingExpense(true);

    const form = new FormData(event.currentTarget);

    const payload = {
      groupId: String(form.get('groupId')),
      description: String(form.get('description')),
      amount: Number(form.get('amount')),
      category: String(form.get('category')),
      paidById: (session?.user as any)?.id,
      splitUserIds: form.getAll('splitUserIds').map(String),
      date: new Date().toISOString()
    };

    const response = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setSavingExpense(false);

    if (!response.ok) {
      alert('Failed to create expense');
      return;
    }

    setShowExpenseModal(false);
    await load();
  }

  if (loading) return <div className="main">Loading dashboard...</div>;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          split<span>wise</span> pro
        </div>

        <nav className="nav">
          <a className="active">Dashboard</a>

          <button onClick={exportCsv}>
            <Download size={16} /> Export CSV
          </button>

          <button onClick={() => signOut({ callbackUrl: '/login' })}>
            Logout
          </button>
        </nav>
      </aside>

      <main className="main">
        <div className="top">
          <div>
            <h1 className="h1">Dashboard</h1>
            <p className="muted">
              Welcome, {session?.user?.name}. Track shared expenses, balances and settlements.
            </p>
          </div>

          <button
            className="btn primary"
            onClick={() => setShowExpenseModal(true)}
          >
            <Plus size={16} /> Add Expense
          </button>
        </div>

        <div className="grid">
          <Metric
            icon={<WalletCards />}
            label="Overall balance"
            value={`₹${Math.abs(Math.round(stats.balance)).toLocaleString()}`}
            tone={stats.balance >= 0 ? 'green' : 'red'}
            helper={stats.balance >= 0 ? 'you are owed' : 'you owe'}
          />

          <Metric
            icon={<Receipt />}
            label="Your spending"
            value={`₹${Math.round(stats.spent).toLocaleString()}`}
          />

          <Metric
            icon={<Users />}
            label="Groups"
            value={String(groups.length)}
          />

          <Metric
            icon={<Receipt />}
            label="Expenses"
            value={String(stats.expenses)}
          />
        </div>

        <h2 className="section-title">Groups</h2>

        <div className="list">
          {groups.length ? (
            groups.map(g => (
              <div className="row" key={g.id}>
                <div>
                  <strong>{g.name}</strong>
                  <div className="muted">
                    {g.memberships.length} members · {g.expenses.length} expenses
                  </div>
                </div>

                <div className="muted">
                  ₹{g.expenses.reduce((s, e) => s + Number(e.amount), 0).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="card">
              No groups yet. Seed the demo database or create a group from the API.
            </div>
          )}
        </div>

        <h2 className="section-title">Recent expenses</h2>

        <div className="list">
          {groups
            .flatMap(g => g.expenses.map(e => ({ g, e })))
            .slice(0, 8)
            .map(({ g, e }) => {
              const title = e.title || e.description || 'Expense';

              return (
                <div className="row" key={e.id}>
                  <div>
                    <strong>{title}</strong>
                    <div className="muted">
                      {g.name} · {e.category} · paid by {e.paidBy.name}
                    </div>
                  </div>

                  <strong>₹{Number(e.amount).toLocaleString()}</strong>
                </div>
              );
            })}
        </div>

        {showExpenseModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <form onSubmit={createExpense}>
                <h2>Add Expense</h2>

                <label>Group</label>
                <select
                  name="groupId"
                  required
                  value={selectedGroupId || activeGroup?.id || ''}
                  onChange={e => setSelectedGroupId(e.target.value)}
                >
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>

                <label>Description</label>
                <input
                  name="description"
                  placeholder="Dinner, Rent, Cab..."
                  required
                />

                <label>Amount</label>
                <input
                  name="amount"
                  type="number"
                  min="1"
                  placeholder="1000"
                  required
                />

                <label>Category</label>
                <select name="category">
                  <option value="food">Food</option>
                  <option value="travel">Travel</option>
                  <option value="housing">Housing</option>
                  <option value="utilities">Utilities</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="other">Other</option>
                </select>

                <label>Split With</label>

                <div style={{ marginTop: 8, marginBottom: 16 }}>
                  {activeGroup?.memberships.map(member => (
                    <label
                      key={member.user.id}
                      style={{ display: 'block', marginBottom: 8 }}
                    >
                      <input
                        type="checkbox"
                        name="splitUserIds"
                        value={member.user.id}
                        defaultChecked
                      />{' '}
                      {member.user.name || member.user.email}
                    </label>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setShowExpenseModal(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn primary"
                    disabled={savingExpense}
                  >
                    {savingExpense ? 'Saving...' : 'Save Expense'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Metric({
  label,
  value,
  helper,
  tone,
  icon
}: {
  label: string;
  value: string;
  helper?: string;
  tone?: 'green' | 'red';
  icon: React.ReactNode;
}) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="label">{label}</div>
        {icon}
      </div>

      <div className={`value ${tone || ''}`}>{value}</div>

      {helper && <div className="muted">{helper}</div>}
    </div>
  );
}