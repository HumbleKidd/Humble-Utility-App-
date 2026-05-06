export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  category: string;
  createdAt: number;
}

export interface Memo {
  id: string;
  title: string;
  content: string;
  tags: string[];
  lastModifiedAt: number;
  isPinned: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: number;
}

export interface BudgetState {
  transactions: Transaction[];
  monthlyLimit: number;
}

export interface AppData {
  todos: Todo[];
  memos: Memo[];
  budget: BudgetState;
}
