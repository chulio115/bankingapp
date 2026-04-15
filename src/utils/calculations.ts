import type { Income, Expense, CategoryConfig } from '../types/finance';

export function totalIncome(incomes: Income[], month: string): number {
  return incomes
    .filter((i) => i.month === month)
    .reduce((sum, i) => sum + i.amount, 0);
}

export function totalExpenses(expenses: Expense[], month: string): number {
  return expenses
    .filter((e) => e.month === month)
    .reduce((sum, e) => sum + e.amount, 0);
}

export function freeMoney(incomes: Income[], expenses: Expense[], month: string): number {
  return totalIncome(incomes, month) - totalExpenses(expenses, month);
}

export function sumByCategory(
  expenses: Expense[],
  month: string,
): Record<string, number> {
  const result: Record<string, number> = {};
  expenses
    .filter((e) => e.month === month)
    .forEach((e) => {
      result[e.category] = (result[e.category] || 0) + e.amount;
    });
  return result;
}

export function remainingMonths(endDate: string): number {
  const now = new Date();
  const end = new Date(endDate);
  const months =
    (end.getFullYear() - now.getFullYear()) * 12 +
    (end.getMonth() - now.getMonth());
  return Math.max(0, months);
}

export function debtProgress(totalAmount: number, remainingAmount: number): number {
  if (totalAmount <= 0) return 0;
  const paid = totalAmount - remainingAmount;
  return Math.min(100, Math.max(0, (paid / totalAmount) * 100));
}

export function getCategoryChartData(
  expenses: Expense[],
  month: string,
  categories: CategoryConfig[],
): { name: string; value: number; fill: string }[] {
  const sums = sumByCategory(expenses, month);
  return Object.entries(sums)
    .filter(([, value]) => value > 0)
    .map(([catId, value]) => {
      const cat = categories.find((c) => c.id === catId);
      return {
        name: cat?.label || catId,
        value,
        fill: cat?.textColor || '#8888aa',
      };
    });
}
