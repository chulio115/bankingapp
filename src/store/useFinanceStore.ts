import { create } from 'zustand';
import type { Income, Expense, CategoryConfig } from '../types/finance';
import { DEFAULT_CATEGORIES } from '../types/finance';
import { getCurrentMonth } from '../utils/formatters';
import {
  loadUserData,
  addIncome as dbAddIncome,
  updateIncome as dbUpdateIncome,
  deleteIncome as dbDeleteIncome,
  addExpense as dbAddExpense,
  updateExpense as dbUpdateExpense,
  deleteExpense as dbDeleteExpense,
  addCategory as dbAddCategory,
} from '../lib/db';
import { useAuthStore } from './useAuthStore';

interface FinanceState {
  currentMonth: string;
  incomes: Income[];
  expenses: Expense[];
  categories: CategoryConfig[];
  isLoading: boolean;
  setCurrentMonth: (month: string) => void;
  loadData: (userId: string) => Promise<void>;
  addIncome: (income: Income) => Promise<void>;
  updateIncome: (income: Income) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  addExpense: (expense: Expense) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addCategory: (category: CategoryConfig) => Promise<void>;
  removeCategory: (id: string) => void;
}

export const useFinanceStore = create<FinanceState>()((set) => ({
  currentMonth: getCurrentMonth(),
  incomes: [],
  expenses: [],
  categories: [...DEFAULT_CATEGORIES],
  isLoading: true,

  setCurrentMonth: (month) => set({ currentMonth: month }),

  loadData: async (userId: string) => {
    set({ isLoading: true });
    try {
      const data = await loadUserData(userId);
      set({
        incomes: data.incomes,
        expenses: data.expenses,
        categories: data.categories.length > 0 ? data.categories : [...DEFAULT_CATEGORIES],
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      set({ isLoading: false });
    }
  },

  addIncome: async (income) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    set((state) => ({ incomes: [...state.incomes, income] }));
    try { await dbAddIncome(user.id, income); }
    catch (e) { console.error('addIncome DB error:', e); }
  },

  updateIncome: async (income) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    set((state) => ({ incomes: state.incomes.map((i) => (i.id === income.id ? income : i)) }));
    try { await dbUpdateIncome(user.id, income); }
    catch (e) { console.error('updateIncome DB error:', e); }
  },

  deleteIncome: async (id) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    set((state) => ({ incomes: state.incomes.filter((i) => i.id !== id) }));
    try { await dbDeleteIncome(user.id, id); }
    catch (e) { console.error('deleteIncome DB error:', e); }
  },

  addExpense: async (expense) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    set((state) => ({ expenses: [...state.expenses, expense] }));
    try { await dbAddExpense(user.id, expense); }
    catch (e) { console.error('addExpense DB error:', e); }
  },

  updateExpense: async (expense) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    set((state) => ({ expenses: state.expenses.map((e) => e.id === expense.id ? expense : e) }));
    try { await dbUpdateExpense(user.id, expense); }
    catch (e) { console.error('updateExpense DB error:', e); }
  },

  deleteExpense: async (id) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) }));
    try { await dbDeleteExpense(user.id, id); }
    catch (e) { console.error('deleteExpense DB error:', e); }
  },

  addCategory: async (category) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    set((state) => ({ categories: [...state.categories, category] }));
    try { await dbAddCategory(user.id, category); }
    catch (e) { console.error('addCategory DB error:', e); }
  },

  removeCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    })),
}));
