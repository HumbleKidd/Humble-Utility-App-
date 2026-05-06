import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, CheckCircle2, Circle, 
  Trash2, AlertCircle, ChevronDown, 
  SortAsc, Calendar, Search
} from 'lucide-react';
import { Todo, Priority } from '../types';
import { cn } from '../lib/utils';

interface TasksProps {
  todos: Todo[];
  setTodos: (todos: Todo[]) => void;
}

const PRIORITY_MAP: Record<Priority, { label: string; color: string; icon: any }> = {
  low: { label: 'Low', color: 'text-zinc-400', icon: Circle },
  medium: { label: 'Medium', color: 'text-amber-500', icon: AlertCircle },
  high: { label: 'High', color: 'text-rose-500', icon: AlertCircle },
};

export default function Tasks({ todos, setTodos }: TasksProps) {
  const [newTodo, setNewTodo] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredTodos = todos
    .filter(t => {
      if (filter === 'active') return !t.completed;
      if (filter === 'completed') return t.completed;
      return true;
    })
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    const todo: Todo = {
      id: crypto.randomUUID(),
      text: newTodo,
      completed: false,
      priority,
      category: 'General',
      createdAt: Date.now(),
    };
    
    setTodos([todo, ...todos]);
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      {/* Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Tasks', value: stats.total, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Active', value: stats.active, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Completed', value: stats.completed, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn("p-6 rounded-2xl border border-zinc-200/60 bg-white", stat.bg)}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-1">
              {stat.label}
            </span>
            <span className={cn("text-3xl font-black", stat.color)}>{stat.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Input Section */}
      <motion.form 
        onSubmit={addTodo}
        className="bg-white p-2 rounded-2xl border border-zinc-200/60 shadow-xl focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all flex flex-col sm:flex-row gap-2"
      >
        <input 
          type="text" 
          placeholder="I want to... ✨"
          className="flex-1 px-4 py-3 bg-transparent border-none focus:ring-0 text-lg"
          value={newTodo}
          onChange={e => setNewTodo(e.target.value)}
        />
        <div className="flex gap-2 p-1">
          <select 
            value={priority}
            onChange={e => setPriority(e.target.value as Priority)}
            className="px-4 py-2 bg-zinc-100 border-none rounded-xl text-sm font-semibold text-zinc-600 cursor-pointer focus:ring-2 focus:ring-indigo-500/10"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </motion.form>

      {/* List Filters */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-2 overflow-x-auto">
        <div className="flex gap-6">
          {(['all', 'active', 'completed'] as const).map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "text-sm font-bold uppercase tracking-wider transition-all relative pb-2 px-1",
                filter === f ? "text-indigo-600" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              {f}
              {filter === f && (
                <motion.div layoutId="filterBar" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
              )}
            </button>
          ))}
        </div>
        <div className="text-zinc-400 flex items-center gap-2">
          <SortAsc size={16} />
          <span className="text-xs font-bold uppercase">Sorted by priority</span>
        </div>
      </div>

      {/* Todo List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTodos.map(todo => (
            <motion.div 
              key={todo.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className={cn(
                "group flex items-center gap-4 p-4 rounded-xl border border-zinc-100 bg-white transition-all",
                todo.completed && "opacity-60 bg-zinc-50 border-zinc-100 shadow-none"
              )}
            >
              <button 
                onClick={() => toggleTodo(todo.id)}
                className={cn(
                  "transition-all transform hover:scale-110",
                  todo.completed ? "text-green-500" : "text-zinc-300 hover:text-indigo-500"
                )}
              >
                {todo.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </button>
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-lg font-medium truncate transition-all",
                  todo.completed && "line-through text-zinc-400"
                )}>
                  {todo.text}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={cn(
                    "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest",
                    PRIORITY_MAP[todo.priority].color
                  )}>
                    {React.createElement(PRIORITY_MAP[todo.priority].icon, { size: 10 })}
                    {PRIORITY_MAP[todo.priority].label}
                  </span>
                  <span className="text-zinc-300">•</span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(todo.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredTodos.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-zinc-200 rounded-3xl">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="text-zinc-300" />
            </div>
            <h3 className="text-lg font-bold text-zinc-800">No tasks found 🍃</h3>
            <p className="text-zinc-500 max-w-[200px] mx-auto mt-2 text-sm">
              Your garden is quiet. Time to plant some goals!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
