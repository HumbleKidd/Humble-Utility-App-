/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, FileText, CheckCircle, 
  Wallet, Settings, Menu, X, Sparkles,
  Calendar, ChevronRight
} from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { AppData, Todo, Memo, BudgetState } from './types';
import { cn } from './lib/utils';

// Components
import Memos from './components/Memos';
import Tasks from './components/Tasks';
import Budget from './components/Budget';

type Tab = 'dashboard' | 'memos' | 'tasks' | 'budget';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // App State with Local Persistence
  const [todos, setTodos] = useLocalStorage<Todo[]>('nova_todos', []);
  const [memos, setMemos] = useLocalStorage<Memo[]>('nova_memos', []);
  const [budget, setBudget] = useLocalStorage<BudgetState>('nova_budget', {
    transactions: [],
    monthlyLimit: 2000,
  });

  const tabs: { id: Tab; label: string; icon: any; color: string }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard, color: 'text-zinc-400' },
    { id: 'memos', label: 'Memos', icon: FileText, color: 'text-indigo-500' },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle, color: 'text-amber-500' },
    { id: 'budget', label: 'Budget', icon: Wallet, color: 'text-emerald-500' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'memos': return <Memos memos={memos} setMemos={setMemos} />;
      case 'tasks': return <Tasks todos={todos} setTodos={setTodos} />;
      case 'budget': return <Budget budget={budget} setBudget={setBudget} />;
      case 'dashboard': return <DashboardOverview stats={{ todos, memos, budget }} onNavigate={setActiveTab} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#fbfbfb]">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-20 xl:w-64 flex-col border-r border-zinc-200/60 p-4 sticky top-0 h-screen bg-white/50 backdrop-blur-sm z-30">
        <div className="mb-10 px-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="text-white" size={24} />
          </div>
          <span className="text-xl font-black tracking-tighter hidden xl:block text-zinc-800">NOVA</span>
        </div>

        <nav className="flex-1 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-4 p-3 rounded-xl transition-all relative group",
                activeTab === tab.id 
                  ? "bg-indigo-50 text-indigo-600 shadow-sm" 
                  : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              )}
            >
              <tab.icon size={22} className={cn("transition-colors", activeTab === tab.id ? "text-indigo-600" : "group-hover:text-zinc-600")} />
              <span className="hidden xl:block font-bold tracking-tight text-sm uppercase tracking-widest">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div layoutId="activeTab" className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-zinc-100 space-y-2">
          <button 
            onClick={() => {
              const data = { todos, memos, budget };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `nova-backup-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
            }}
            className="w-full flex items-center gap-4 p-3 rounded-xl text-zinc-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all group"
          >
            <Settings size={22} />
            <span className="hidden xl:block font-bold text-sm uppercase tracking-widest">Export JSON</span>
          </button>
          
          <button 
            onClick={() => {
              if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                setTodos([]);
                setMemos([]);
                setBudget({ transactions: [], monthlyLimit: 2000 });
                window.location.reload();
              }
            }}
            className="w-full flex items-center gap-4 p-3 rounded-xl text-zinc-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
          >
            <X size={22} />
            <span className="hidden xl:block font-bold text-sm uppercase tracking-widest">Clear Data</span>
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl border border-zinc-200/60 px-6 py-4 rounded-3xl shadow-2xl flex gap-8 z-50">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "p-2 rounded-xl transition-all relative",
              activeTab === tab.id ? "text-indigo-600 scale-125" : "text-zinc-300"
            )}
          >
            <tab.icon size={24} />
            {activeTab === tab.id && (
              <motion.div layoutId="mobileActive" className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 relative">
        <header className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-800 capitalize">
              Good morning, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Explorer</span>
            </h1>
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mt-1">
              Ready to conquer the day? ✨
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center bg-white px-4 py-2 rounded-xl border border-zinc-100 text-sm font-bold text-zinc-500 shadow-sm">
              <Calendar size={16} className="mr-2" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function DashboardOverview({ stats, onNavigate }: { stats: { todos: Todo[], memos: Memo[], budget: BudgetState }, onNavigate: (tab: Tab) => void }) {
  const activeTodosCount = stats.todos.filter(t => !t.completed).length;
  const pinnedMemosCount = stats.memos.filter(m => m.isPinned).length;
  const totalBalance = stats.budget.transactions
    .reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Hero Welcome */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <QuickActionCard 
          icon={FileText} 
          label="Memos" 
          count={stats.memos.length} 
          sublabel={`${pinnedMemosCount} pinned`}
          color="indigo" 
          onClick={() => onNavigate('memos')}
        />
        <QuickActionCard 
          icon={CheckCircle} 
          label="Tasks" 
          count={stats.todos.length} 
          sublabel={`${activeTodosCount} active`}
          color="amber" 
          onClick={() => onNavigate('tasks')}
        />
        <QuickActionCard 
          icon={Wallet} 
          label="Balance" 
          count={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalBalance)} 
          sublabel="Current month"
          color="emerald" 
          onClick={() => onNavigate('budget')}
        />
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-bold text-zinc-800 mb-6 flex items-center justify-between">
              Recent Activity
              <span className="text-xs text-zinc-400 font-normal uppercase tracking-widest">Last 24h</span>
            </h3>
            <div className="space-y-4">
               {stats.todos.slice(0, 3).map(todo => (
                 <div key={todo.id} className="flex items-center gap-4 text-sm">
                   <div className={cn("w-2 h-2 rounded-full", todo.completed ? "bg-green-400" : "bg-zinc-200")} />
                   <p className={cn("flex-1", todo.completed && "line-through text-zinc-400")}>{todo.text}</p>
                   <span className="text-xs text-zinc-400 uppercase font-black">{todo.priority}</span>
                 </div>
               ))}
               {stats.todos.length === 0 && <p className="text-zinc-400 italic text-sm">No tasks yet...</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card bg-zinc-900 text-white overflow-hidden relative">
              <div className="relative z-10 p-2">
                <h4 className="text-amber-400 font-black uppercase text-xs tracking-widest mb-2">Focus Mode ⚡️</h4>
                <p className="text-lg leading-snug font-medium mb-4">You have {activeTodosCount} tasks remaining today. Stay focused!</p>
                <button 
                  onClick={() => onNavigate('tasks')}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-all border border-white/10"
                >
                  Go to Tasks
                </button>
              </div>
              <Sparkles className="absolute bottom-[-10px] right-[-10px] text-white/5 w-24 h-24" />
            </div>
            
            <div className="card group cursor-pointer hover:border-indigo-200" onClick={() => onNavigate('memos')}>
              <h4 className="text-indigo-600 font-black uppercase text-xs tracking-widest mb-4">Recent Memo 📝</h4>
              {stats.memos[0] ? (
                <div>
                  <h5 className="font-bold text-zinc-800 text-lg mb-1">{stats.memos[0].title || 'Untitled'}</h5>
                  <p className="text-sm text-zinc-500 line-clamp-2">{stats.memos[0].content}</p>
                </div>
              ) : (
                <p className="text-zinc-400 italic text-sm">No memos found...</p>
              )}
            </div>
          </div>
        </div>

        <div className="card space-y-6">
          <h4 className="text-lg font-bold text-zinc-800 flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" />
            Productivity Stats
          </h4>
          <div className="space-y-6">
            <StatRow label="Task Efficiency" value={(stats.todos.length > 0 ? (stats.todos.filter(t => t.completed).length / stats.todos.length * 100) : 0).toFixed(0) + '%'} progress={stats.todos.length > 0 ? (stats.todos.filter(t => t.completed).length / stats.todos.length * 100) : 0} />
            <StatRow label="Notes Organized" value={stats.memos.length} progress={Math.min(100, (stats.memos.length / 20) * 100)} />
            <StatRow label="Spending Ratio" value={(totalBalance > 0 ? (stats.budget.transactions.filter(t => t.type === 'expense').length / stats.budget.transactions.length * 100) : 0).toFixed(0) + '%'} progress={stats.budget.transactions.length > 0 ? (stats.budget.transactions.filter(t => t.type === 'expense').length / stats.budget.transactions.length * 100) : 0} />
          </div>
          <div className="pt-6 border-t border-zinc-100 italic text-[10px] text-zinc-400 uppercase font-black text-center">
             Offline local sync active • Last save 2s ago
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({ icon: Icon, label, count, sublabel, color, onClick }: { icon: any, label: string, count: string | number, sublabel: string, color: string, onClick: () => void }) {
  const colors: Record<string, string> = {
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
  };

  return (
    <motion.button 
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={cn("card text-left group transition-all", colors[color])}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon size={24} strokeWidth={2.5} />
        <ChevronRight size={16} className="opacity-40 group-hover:translate-x-1 transition-transform" />
      </div>
      <h3 className="text-zinc-400 text-xs font-black uppercase tracking-widest mb-1">{label}</h3>
      <div className="flex items-end gap-2 text-zinc-800">
        <span className="text-3xl font-black leading-none">{count}</span>
        <span className="text-[10px] font-bold text-zinc-400 mb-1 uppercase whitespace-nowrap">{sublabel}</span>
      </div>
    </motion.button>
  );
}

function StatRow({ label, value, progress }: { label: string, value: string | number, progress: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-800">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-zinc-800 rounded-full"
        />
      </div>
    </div>
  );
}
