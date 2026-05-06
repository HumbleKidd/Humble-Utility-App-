import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, Tag, Calendar, 
  Trash2, Pin, PinOff, Edit3, 
  ChevronLeft, FileText, CornerDownRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Memo } from '../types';
import { cn, formatDate } from '../lib/utils';

interface MemosProps {
  memos: Memo[];
  setMemos: (memos: Memo[]) => void;
}

export default function Memos({ memos, setMemos }: MemosProps) {
  const [search, setSearch] = useState('');
  const [activeMemo, setActiveMemo] = useState<Memo | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const filteredMemos = memos
    .filter(m => 
      m.title.toLowerCase().includes(search.toLowerCase()) || 
      m.content.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.lastModifiedAt - a.lastModifiedAt;
    });

  const addMemo = () => {
    const newMemo: Memo = {
      id: crypto.randomUUID(),
      title: 'New Memo',
      content: '',
      tags: [],
      lastModifiedAt: Date.now(),
      isPinned: false,
    };
    setMemos([newMemo, ...memos]);
    setActiveMemo(newMemo);
    setIsEditing(true);
  };

  const updateMemo = (id: string, updates: Partial<Memo>) => {
    setMemos(memos.map(m => m.id === id ? { ...m, ...updates, lastModifiedAt: Date.now() } : m));
    if (activeMemo?.id === id) {
      setActiveMemo({ ...activeMemo, ...updates });
    }
  };

  const deleteMemo = (id: string) => {
    setMemos(memos.filter(m => m.id !== id));
    if (activeMemo?.id === id) setActiveMemo(null);
  };

  const togglePin = (id: string) => {
    setMemos(memos.map(m => m.id === id ? { ...m, isPinned: !m.isPinned } : m));
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden lg:gap-6">
      {/* Sidebar List */}
      <motion.aside 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          "w-full lg:w-80 flex flex-col border-r border-zinc-200/60 bg-white/50 backdrop-blur-sm lg:rounded-2xl lg:border overflow-hidden transition-all",
          activeMemo ? "hidden lg:flex" : "flex"
        )}
      >
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-zinc-800">Memos 📝</h2>
            <button onClick={addMemo} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
              <Plus size={20} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input 
              type="text" 
              placeholder="Search notes..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredMemos.map(memo => (
            <button
              key={memo.id}
              onClick={() => { setActiveMemo(memo); setIsEditing(false); }}
              className={cn(
                "group w-full text-left p-4 rounded-xl transition-all relative overflow-hidden",
                activeMemo?.id === memo.id 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                  : "hover:bg-zinc-100 text-zinc-600"
              )}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold truncate pr-4">{memo.title || 'Untitled'}</h3>
                  {memo.isPinned && <Pin size={12} className={activeMemo?.id === memo.id ? "text-indigo-200" : "text-indigo-500"} />}
                </div>
                <p className={cn(
                  "text-xs line-clamp-2 mb-2",
                  activeMemo?.id === memo.id ? "text-indigo-100" : "text-zinc-400"
                )}>
                  {memo.content || 'Empty memo...'}
                </p>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold">
                  <Calendar size={10} />
                  {formatDate(memo.lastModifiedAt)}
                </div>
              </div>
            </button>
          ))}
          {filteredMemos.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
              <FileText size={48} strokeWidth={1} className="mb-4 opacity-20" />
              <p className="text-sm">No memos found</p>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Editor/Viewer */}
      <main className={cn(
        "flex-1 flex flex-col bg-white lg:rounded-2xl lg:border border-zinc-200/60 overflow-hidden min-w-0 transition-all",
        !activeMemo && "hidden lg:flex items-center justify-center bg-zinc-50/50"
      )}>
        <AnimatePresence mode="wait">
          {activeMemo ? (
            <motion.div 
              key={activeMemo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col h-full"
            >
              <div className="flex items-center justify-between p-4 border-bottom border-zinc-100">
                <button 
                  onClick={() => setActiveMemo(null)}
                  className="lg:hidden p-2 -ml-2 text-zinc-400 hover:text-zinc-600"
                >
                  <ChevronLeft />
                </button>
                <div className="flex-1 ml-2 lg:ml-0">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    Last edited {formatDate(activeMemo.lastModifiedAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <button 
                    onClick={() => togglePin(activeMemo.id)}
                    className={cn("p-2 rounded-lg hover:bg-zinc-100 transition-colors", activeMemo.isPinned && "text-indigo-600 bg-indigo-50")}
                  >
                    {activeMemo.isPinned ? <PinOff size={20} /> : <Pin size={20} />}
                  </button>
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className={cn("p-2 rounded-lg hover:bg-zinc-100 transition-colors", isEditing && "text-indigo-600 bg-indigo-50")}
                  >
                    <Edit3 size={20} />
                  </button>
                  <button 
                    onClick={() => deleteMemo(activeMemo.id)}
                    className="p-2 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-hide">
                {isEditing ? (
                  <div className="space-y-6 max-w-3xl mx-auto">
                    <input 
                      type="text" 
                      placeholder="Title"
                      className="w-full text-4xl font-black tracking-tight border-none focus:ring-0 placeholder:text-zinc-200"
                      value={activeMemo.title}
                      onChange={e => updateMemo(activeMemo.id, { title: e.target.value })}
                    />
                    <textarea 
                      placeholder="Write your thoughts in markdown..."
                      className="w-full min-h-[400px] text-lg leading-relaxed border-none focus:ring-0 resize-none placeholder:text-zinc-200"
                      value={activeMemo.content}
                      onChange={e => updateMemo(activeMemo.id, { content: e.target.value })}
                    />
                  </div>
                ) : (
                  <div className="max-w-3xl mx-auto prose prose-indigo">
                    <h1 className="text-4xl font-black tracking-tight mb-8 text-zinc-800">
                      {activeMemo.title || 'Untitled'}
                    </h1>
                    {activeMemo.content ? (
                      <div className="text-zinc-600 text-lg leading-relaxed whitespace-pre-wrap">
                        <ReactMarkdown>
                          {activeMemo.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-zinc-400 italic">No content yet. Click edit to start writing ✨</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="text-center p-10">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
                <FileText size={32} />
              </div>
              <h3 className="text-lg font-bold text-zinc-800">Select a memo</h3>
              <p className="text-sm text-zinc-500 max-w-[200px] mx-auto mt-2">
                Click a note from the list or create a new one to get started.
              </p>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
