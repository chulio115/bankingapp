import { sql, hasNeon, connectionString } from './neon';
import type { Income, Expense, CategoryConfig, FuelEntry } from '../types/finance';

interface DBIncome { id: string; name: string; amount: string; month: string; is_recurring: boolean | null; notes: string | null; }
interface DBExpense { id: string; name: string; amount: string; category_id: string | null; month: string; is_recurring: boolean; notes: string | null; debt_details: string | null; }
interface DBCategory { id: string; label: string; bg_color: string; text_color: string; dot_color: string; }
interface DBFuelEntry { id: string; date: string; price_per_liter: string; liters: string; total_amount: string; odometer: number | null; is_full_tank: boolean; station_name: string | null; expense_id: string | null; month: string; }

type LocalData = { incomes: Income[]; expenses: Expense[]; categories: CategoryConfig[] };
const emptyData = (): LocalData => ({ incomes: [], expenses: [], categories: [] });

export { hasNeon, connectionString };

export async function ensureUser(userId: string, email: string, name: string) {
  if (!sql) throw new Error('Keine Neon-Verbindung konfiguriert');
  const existing = await sql`SELECT id FROM users WHERE id = ${userId}`;
  if (existing.length === 0) {
    await sql`INSERT INTO users (id, email, name) VALUES (${userId}, ${email}, ${name})`;
  } else {
    await sql`UPDATE users SET email = ${email}, name = ${name} WHERE id = ${userId}`;
  }
}

export async function loadUserData(userId: string): Promise<LocalData> {
  console.log('[DB] loadUserData called for userId:', userId);
  if (!sql) {
    console.log('[DB] No SQL client, returning empty data');
    return emptyData();
  }
  try {
    const [cats, incs, exps] = await Promise.all([
      sql`SELECT * FROM categories WHERE user_id = ${userId}`,
      sql`SELECT * FROM incomes WHERE user_id = ${userId}`,
      sql`SELECT * FROM expenses WHERE user_id = ${userId}`,
    ]);
    console.log('[DB] Loaded data:', { categories: cats.length, incomes: incs.length, expenses: exps.length });
    return {
      categories: (cats as DBCategory[]).map((c): CategoryConfig => ({ id: c.id, label: c.label, bgColor: c.bg_color, textColor: c.text_color, dotColor: c.dot_color })),
      incomes: (incs as DBIncome[]).map((i): Income => ({ id: i.id, name: i.name, amount: parseFloat(i.amount), month: i.month, isRecurring: i.is_recurring || false, notes: i.notes || '' })),
      expenses: (exps as DBExpense[]).map((e): Expense => {
        let debtDetails;
        try {
          debtDetails = e.debt_details ? (typeof e.debt_details === 'string' ? JSON.parse(e.debt_details) : e.debt_details) : undefined;
        } catch {
          debtDetails = undefined;
        }
        return {
          id: e.id, name: e.name, amount: parseFloat(e.amount), category: e.category_id || '', month: e.month, isRecurring: e.is_recurring, notes: e.notes || '', debtDetails,
        };
      }),
    };
  } catch (error) {
    console.error('[DB] loadUserData error:', error);
    return emptyData();
  }
}

export async function addIncome(userId: string, income: Income) {
  if (!sql) return;
  console.log('[DB] addIncome:', { userId, incomeId: income.id, name: income.name, amount: income.amount });
  try {
    await sql`INSERT INTO incomes (id, user_id, name, amount, month, is_recurring, notes) VALUES (${income.id}, ${userId}, ${income.name}, ${income.amount}, ${income.month}, ${income.isRecurring || false}, ${income.notes || ''})`;
    console.log('[DB] addIncome success');
  } catch (e) {
    console.error('[DB] addIncome error:', e);
  }
}

export async function updateIncome(userId: string, income: Income) {
  if (!sql) return;
  console.log('[DB] updateIncome:', { userId, incomeId: income.id });
  try {
    await sql`UPDATE incomes SET name = ${income.name}, amount = ${income.amount}, month = ${income.month}, is_recurring = ${income.isRecurring || false}, notes = ${income.notes || ''} WHERE id = ${income.id} AND user_id = ${userId}`;
    console.log('[DB] updateIncome success');
  } catch (e) {
    console.error('[DB] updateIncome error:', e);
  }
}

export async function deleteIncome(userId: string, id: string) {
  if (!sql) return;
  console.log('[DB] deleteIncome:', { userId, id });
  try {
    await sql`DELETE FROM incomes WHERE id = ${id} AND user_id = ${userId}`;
    console.log('[DB] deleteIncome success');
  } catch (e) {
    console.error('[DB] deleteIncome error:', e);
  }
}

export async function addExpense(userId: string, expense: Expense) {
  if (!sql) return;
  console.log('[DB] addExpense:', { userId, expenseId: expense.id, name: expense.name, amount: expense.amount });
  try {
    await sql`INSERT INTO expenses (id, user_id, name, amount, category_id, month, is_recurring, notes, debt_details) VALUES (${expense.id}, ${userId}, ${expense.name}, ${expense.amount}, ${expense.category || null}, ${expense.month}, ${expense.isRecurring || false}, ${expense.notes || ''}, ${expense.debtDetails ? JSON.stringify(expense.debtDetails) : null})`;
    console.log('[DB] addExpense success');
  } catch (e) {
    console.error('[DB] addExpense error:', e);
  }
}

export async function updateExpense(userId: string, expense: Expense) {
  if (!sql) return;
  console.log('[DB] updateExpense:', { userId, expenseId: expense.id });
  try {
    await sql`UPDATE expenses SET name = ${expense.name}, amount = ${expense.amount}, category_id = ${expense.category || null}, month = ${expense.month}, is_recurring = ${expense.isRecurring || false}, notes = ${expense.notes || ''}, debt_details = ${expense.debtDetails ? JSON.stringify(expense.debtDetails) : null} WHERE id = ${expense.id} AND user_id = ${userId}`;
    console.log('[DB] updateExpense success');
  } catch (e) {
    console.error('[DB] updateExpense error:', e);
  }
}

export async function deleteExpense(userId: string, id: string) {
  if (!sql) return;
  console.log('[DB] deleteExpense:', { userId, id });
  try {
    await sql`DELETE FROM expenses WHERE id = ${id} AND user_id = ${userId}`;
    console.log('[DB] deleteExpense success');
  } catch (e) {
    console.error('[DB] deleteExpense error:', e);
  }
}

export async function addCategory(userId: string, category: CategoryConfig) {
  if (!sql) return;
  console.log('[DB] addCategory:', { userId, categoryId: category.id, label: category.label });
  try {
    await sql`INSERT INTO categories (id, user_id, label, bg_color, text_color, dot_color) VALUES (${category.id}, ${userId}, ${category.label}, ${category.bgColor}, ${category.textColor}, ${category.dotColor})`;
    console.log('[DB] addCategory success');
  } catch (e) {
    console.error('[DB] addCategory error:', e);
  }
}

// --- Fuel Entries ---

export async function loadFuelEntries(userId: string): Promise<FuelEntry[]> {
  if (!sql) return [];
  try {
    const rows = await sql`SELECT * FROM fuel_entries WHERE user_id = ${userId} ORDER BY date DESC`;
    return (rows as DBFuelEntry[]).map((r): FuelEntry => ({
      id: r.id,
      date: r.date,
      pricePerLiter: parseFloat(r.price_per_liter),
      liters: parseFloat(r.liters),
      totalAmount: parseFloat(r.total_amount),
      odometer: r.odometer || undefined,
      isFullTank: r.is_full_tank,
      stationName: r.station_name || undefined,
      expenseId: r.expense_id || undefined,
      month: r.month,
    }));
  } catch (e) {
    console.error('[DB] loadFuelEntries error:', e);
    return [];
  }
}

export async function addFuelEntry(userId: string, entry: FuelEntry) {
  if (!sql) return;
  try {
    await sql`INSERT INTO fuel_entries (id, user_id, date, price_per_liter, liters, total_amount, odometer, is_full_tank, station_name, expense_id, month)
      VALUES (${entry.id}, ${userId}, ${entry.date}, ${entry.pricePerLiter}, ${entry.liters}, ${entry.totalAmount}, ${entry.odometer || null}, ${entry.isFullTank}, ${entry.stationName || null}, ${entry.expenseId || null}, ${entry.month})`;
    console.log('[DB] addFuelEntry success');
  } catch (e) {
    console.error('[DB] addFuelEntry error:', e);
  }
}

export async function deleteFuelEntry(userId: string, id: string) {
  if (!sql) return;
  try {
    await sql`DELETE FROM fuel_entries WHERE id = ${id} AND user_id = ${userId}`;
    console.log('[DB] deleteFuelEntry success');
  } catch (e) {
    console.error('[DB] deleteFuelEntry error:', e);
  }
}
