import { sql, hasNeon } from './neon';
import type { Income, Expense, CategoryConfig } from '../types/finance';

interface DBIncome { id: string; name: string; amount: string; month: string; notes: string | null; }
interface DBExpense { id: string; name: string; amount: string; category_id: string | null; month: string; is_recurring: boolean; notes: string | null; debt_details: string | null; }
interface DBCategory { id: string; label: string; bg_color: string; text_color: string; dot_color: string; }

type LocalData = { incomes: Income[]; expenses: Expense[]; categories: CategoryConfig[] };

const LS_KEY = (userId: string) => `haushalt_${userId}`;
const lsLoad = (userId: string): LocalData => {
  try { const raw = localStorage.getItem(LS_KEY(userId)); return raw ? JSON.parse(raw) : { incomes: [], expenses: [], categories: [] }; }
  catch { return { incomes: [], expenses: [], categories: [] }; }
};
const lsSave = (userId: string, data: LocalData) => localStorage.setItem(LS_KEY(userId), JSON.stringify(data));

export async function ensureUser(userId: string, email: string, name: string) {
  if (!hasNeon || !sql) return;
  try {
    await sql`
      INSERT INTO users (id, email, name)
      VALUES (${userId}, ${email}, ${name})
      ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name
    `;
  } catch (error) { console.error('ensureUser error:', error); }
}

export async function loadUserData(userId: string): Promise<LocalData> {
  if (!hasNeon || !sql) return lsLoad(userId);
  try {
    const [cats, incs, exps] = await Promise.all([
      sql`SELECT * FROM categories WHERE user_id = ${userId}`,
      sql`SELECT * FROM incomes WHERE user_id = ${userId}`,
      sql`SELECT * FROM expenses WHERE user_id = ${userId}`,
    ]);
    return {
      categories: (cats as DBCategory[]).map((c): CategoryConfig => ({ id: c.id, label: c.label, bgColor: c.bg_color, textColor: c.text_color, dotColor: c.dot_color })),
      incomes: (incs as DBIncome[]).map((i): Income => ({ id: i.id, name: i.name, amount: parseFloat(i.amount), month: i.month, notes: i.notes || '' })),
      expenses: (exps as DBExpense[]).map((e): Expense => ({ id: e.id, name: e.name, amount: parseFloat(e.amount), category: e.category_id || '', month: e.month, isRecurring: e.is_recurring, notes: e.notes || '', debtDetails: e.debt_details ? JSON.parse(e.debt_details) : undefined })),
    };
  } catch (error) {
    console.error('loadUserData error, falling back to localStorage:', error);
    return lsLoad(userId);
  }
}

export async function addIncome(userId: string, income: Income) {
  if (!hasNeon || !sql) { const d = lsLoad(userId); d.incomes.push(income); lsSave(userId, d); return; }
  try { await sql`INSERT INTO incomes (id, user_id, name, amount, month, notes) VALUES (${income.id}, ${userId}, ${income.name}, ${income.amount}, ${income.month}, ${income.notes || ''})`; }
  catch (error) { console.error('addIncome error:', error); const d = lsLoad(userId); d.incomes.push(income); lsSave(userId, d); }
}

export async function updateIncome(userId: string, income: Income) {
  if (!hasNeon || !sql) { const d = lsLoad(userId); d.incomes = d.incomes.map((i) => i.id === income.id ? income : i); lsSave(userId, d); return; }
  try { await sql`UPDATE incomes SET name = ${income.name}, amount = ${income.amount}, month = ${income.month}, notes = ${income.notes || ''} WHERE id = ${income.id} AND user_id = ${userId}`; }
  catch (error) { console.error('updateIncome error:', error); const d = lsLoad(userId); d.incomes = d.incomes.map((i) => i.id === income.id ? income : i); lsSave(userId, d); }
}

export async function deleteIncome(userId: string, id: string) {
  if (!hasNeon || !sql) { const d = lsLoad(userId); d.incomes = d.incomes.filter((i) => i.id !== id); lsSave(userId, d); return; }
  try { await sql`DELETE FROM incomes WHERE id = ${id} AND user_id = ${userId}`; }
  catch (error) { console.error('deleteIncome error:', error); const d = lsLoad(userId); d.incomes = d.incomes.filter((i) => i.id !== id); lsSave(userId, d); }
}

export async function addExpense(userId: string, expense: Expense) {
  if (!hasNeon || !sql) { const d = lsLoad(userId); d.expenses.push(expense); lsSave(userId, d); return; }
  try {
    await sql`INSERT INTO expenses (id, user_id, name, amount, category_id, month, is_recurring, notes, debt_details) VALUES (${expense.id}, ${userId}, ${expense.name}, ${expense.amount}, ${expense.category || null}, ${expense.month}, ${expense.isRecurring || false}, ${expense.notes || ''}, ${expense.debtDetails ? JSON.stringify(expense.debtDetails) : null})`;
  } catch (error) { console.error('addExpense error:', error); const d = lsLoad(userId); d.expenses.push(expense); lsSave(userId, d); }
}

export async function updateExpense(userId: string, expense: Expense) {
  if (!hasNeon || !sql) { const d = lsLoad(userId); d.expenses = d.expenses.map((e) => e.id === expense.id ? expense : e); lsSave(userId, d); return; }
  try {
    await sql`UPDATE expenses SET name = ${expense.name}, amount = ${expense.amount}, category_id = ${expense.category || null}, month = ${expense.month}, is_recurring = ${expense.isRecurring || false}, notes = ${expense.notes || ''}, debt_details = ${expense.debtDetails ? JSON.stringify(expense.debtDetails) : null} WHERE id = ${expense.id} AND user_id = ${userId}`;
  } catch (error) { console.error('updateExpense error:', error); const d = lsLoad(userId); d.expenses = d.expenses.map((e) => e.id === expense.id ? expense : e); lsSave(userId, d); }
}

export async function deleteExpense(userId: string, id: string) {
  if (!hasNeon || !sql) { const d = lsLoad(userId); d.expenses = d.expenses.filter((e) => e.id !== id); lsSave(userId, d); return; }
  try { await sql`DELETE FROM expenses WHERE id = ${id} AND user_id = ${userId}`; }
  catch (error) { console.error('deleteExpense error:', error); const d = lsLoad(userId); d.expenses = d.expenses.filter((e) => e.id !== id); lsSave(userId, d); }
}

export async function addCategory(userId: string, category: CategoryConfig) {
  if (!hasNeon || !sql) { const d = lsLoad(userId); d.categories.push(category); lsSave(userId, d); return; }
  try { await sql`INSERT INTO categories (id, user_id, label, bg_color, text_color, dot_color) VALUES (${category.id}, ${userId}, ${category.label}, ${category.bgColor}, ${category.textColor}, ${category.dotColor})`; }
  catch (error) { console.error('addCategory error:', error); const d = lsLoad(userId); d.categories.push(category); lsSave(userId, d); }
}
