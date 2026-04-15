import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Income, Expense, CategoryConfig } from '../types/finance';
import { DEFAULT_CATEGORIES } from '../types/finance';
import { getCurrentMonth } from '../utils/formatters';

interface FinanceState {
  currentMonth: string;
  incomes: Income[];
  expenses: Expense[];
  categories: CategoryConfig[];
  setCurrentMonth: (month: string) => void;
  addIncome: (income: Income) => void;
  updateIncome: (income: Income) => void;
  deleteIncome: (id: string) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  addCategory: (category: CategoryConfig) => void;
  removeCategory: (id: string) => void;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      currentMonth: getCurrentMonth(),
      incomes: [],
      expenses: [],
      categories: [...DEFAULT_CATEGORIES],

      setCurrentMonth: (month) => set({ currentMonth: month }),

      addIncome: (income) =>
        set((state) => ({ incomes: [...state.incomes, income] })),
      updateIncome: (income) =>
        set((state) => ({
          incomes: state.incomes.map((i) => (i.id === income.id ? income : i)),
        })),
      deleteIncome: (id) =>
        set((state) => ({
          incomes: state.incomes.filter((i) => i.id !== id),
        })),

      addExpense: (expense) =>
        set((state) => ({ expenses: [...state.expenses, expense] })),
      updateExpense: (expense) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === expense.id ? expense : e,
          ),
        })),
      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      addCategory: (category) =>
        set((state) => ({ categories: [...state.categories, category] })),
      removeCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),
    }),
    {
      name: 'haushalt-finance-storage',
    },
  ),
);
