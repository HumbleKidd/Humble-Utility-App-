import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, TrendingUp, TrendingDown, 
  Trash2, Wallet, PieChart, 
  ChevronRight, Calendar, Info
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, 
  XAxis, YAxis, Tooltip, Cell, 
  PieChart as RechartsPieChart, Pie 
} from 'recharts';
import { BudgetState, Transaction } from '../types';
import { cn, formatCurrency } from '../lib/utils';

interface BudgetProps {
  budget: BudgetState;
  setBudget: (budget: BudgetState) => void;
}

const CATEGORIES = [
  { name: 'Food', color: '#6366f1' },
  { name: 'Rent', color: '#f59e0b' },
  { name: 'Transport', color: '#10b981' },
  { name: 'Shopping', color: '#ec4899' },
  { name: 'Entertainment', color: '#8b5cf6' },
  { name: 'Other', color: '#64748b' },
];

export default function Budget({ budget, setBudget }: BudgetProps) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  const addTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      description: desc,
      amount: parseFloat(amount),
      category,
      type,
      date: Date.now(),
    };

    setBudget({
      ...budget,
      transactions: [transaction, ...budget.transactions],
    });
    setDesc('');
    setAmount('');
  };

  const deleteTransaction = (id: string) => {
    setBudget({
      ...budget,
      transactions: budget.transactions.filter(t => t.id !== id),
    });
  };

  const stats = useMemo(() => {
    const income = budget.transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = budget.transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const balance = income - expense;
    
    // Pie data
    const pieData = CATEGORIES.map(cat => ({
      name: cat.name,
      value: budget.transactions
        .filter(t => t.type === 'expense' && t.category === cat.name)
        .reduce((acc, t) => acc + t.amount, 0),
      color: cat.color
    })).filter(d => d.value > 0);

    return { income, expense, balance, pieData };
  }, [budget]);

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
      {/* Left Column: Stats & Add */}
      <div className="lg:col-span-4 space-y-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card bg-indigo-600 text-white border-none p-8 relative overflow-hidden"
        >
          <div className="relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">Total Balance</span>
            <h2 className="text-4xl font-black mt-1 mb-8">
              {formatCurrency(stats.balance)}
            </h2>
            <div className="flex justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-indigo-200">Income</span>
                <p className="text-lg font-bold flex items-center gap-1">
                  <TrendingUp size={16} className="text-green-300" />
                  {formatCurrency(stats.income)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-indigo-200">Expense</span>
                <p className="text-lg font-bold flex items-center gap-1 justify-end">
                  {formatCurrency(stats.expense)}
                  <TrendingDown size={16} className="text-red-300" />
                </p>
              </div>
            </div>
          </div>
          <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={addTransaction}
          className="card space-y-4"
        >
          <h3 className="text-lg font-bold text-zinc-800 flex items-center gap-2">
            <Plus size={20} className="text-indigo-600" />
            Add Movement
          </h3>
          <div className="flex bg-zinc-100 p-1 rounded-xl">
            <button 
              type="button" 
              onClick={() => setType('expense')}
              className={cn(
                "flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all",
                type === 'expense' ? "bg-white text-zinc-800 shadow-sm" : "text-zinc-400"
              )}
            >
              Expense
            </button>
            <button 
              type="button" 
              onClick={() => setType('income')}
              className={cn(
                "flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all",
                type === 'income' ? "bg-white text-zinc-800 shadow-sm" : "text-zinc-400"
              )}
            >
              Income
            </button>
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Description</label>
              <input 
                type="text" 
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Where did it go? 💸"
                className="w-full px-4 py-2 bg-zinc-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Amount</label>
              <input 
                type="number" 
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2 bg-zinc-100 border-none rounded-xl font-bold focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Category</label>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/10"
              >
                {CATEGORIES.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full btn-primary mt-2">
              Log Transaction
            </button>
          </div>
        </motion.form>
      </div>

      {/* Right Column: Visualization & History */}
      <div className="lg:col-span-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card min-h-[300px] flex flex-col"
          >
            <h4 className="text-sm font-bold uppercase text-zinc-400 mb-6 flex items-center gap-2">
              <PieChart size={16} />
              Spending by Category
            </h4>
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={stats.pieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {stats.pieData.map(item => (
                <div key={item.name} className="flex items-center gap-2 text-[10px] font-bold uppercase text-zinc-500">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}: {formatCurrency(item.value)}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card flex flex-col items-center justify-center space-y-4"
          >
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
              <Info size={32} />
            </div>
            <h4 className="text-lg font-bold text-zinc-800">Financial Insight ✨</h4>
            <p className="text-zinc-500 text-sm text-center max-w-[200px]">
              {stats.expense > stats.income 
                ? "You've spent more than you earned this month. Take care! 🧊" 
                : "Great job! Your savings are growing like a digital forest. 🌲"}
            </p>
            <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
               <div 
                 className="bg-indigo-600 h-full transition-all duration-1000" 
                 style={{ width: `${Math.min(100, (stats.expense / (stats.income || 1)) * 100)}%` }} 
               />
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-bold uppercase text-zinc-400">Transaction History</h4>
            <span className="text-xs bg-zinc-100 px-3 py-1 rounded-full text-zinc-600 font-bold">
              {budget.transactions.length} total
            </span>
          </div>
          <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
            {budget.transactions.map(transaction => (
              <div 
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 transition-all border border-transparent hover:border-zinc-100 group"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    transaction.type === 'income' ? "bg-green-50 text-green-600" : "bg-rose-50 text-rose-600"
                  )}>
                    {transaction.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-zinc-800">{transaction.description}</p>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                      <span className="bg-zinc-100 px-2 py-0.5 rounded-md">{transaction.category}</span>
                      <span>•</span>
                      {new Date(transaction.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "font-black tracking-tight",
                    transaction.type === 'income' ? "text-green-600" : "text-zinc-800"
                  )}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </span>
                  <button 
                    onClick={() => deleteTransaction(transaction.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-rose-500 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {budget.transactions.length === 0 && (
              <div className="text-center py-10 text-zinc-300 italic">
                No movements logged yet...
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
