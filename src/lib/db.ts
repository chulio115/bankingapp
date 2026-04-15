import { sql } from './neon';
import type { Income, Expense, CategoryConfig } from '../types/finance';

interface DBIncome {
  id: string;
  name: string;
  amount: string;
  month: string;
  notes: string | null;
}

interface DBExpense {
  id: string;
  name: string;
  amount: string;
  category_id: string | null;
  month: string;
  is_recurring: boolean;
  notes: string | null;
  debt_details: string | null;
}

interface DBCategory {
  id: string;
  label: string;
  bg_color: string;
  text_color: string;
  dot_color: string;
}

// Ensure user exists in Neon when they log in
export async function ensureUser(userId: string, email: string, name: string) {
  try {
    await sql`
      INSERT INTO users (id, email, name)
      VALUES (${userId}, ${email}, ${name})
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name
    `;
  } catch (error) {
    console.error('Error ensuring user:', error);
  }
}

// Load all data for a user
export async function loadUserData(userId: string) {
  try {
    const [categories, incomes, expenses] = await Promise.all([
      sql`SELECT * FROM categories WHERE user_id = ${userId}`,
      sql`SELECT * FROM incomes WHERE user_id = ${userId}`,
      sql`SELECT * FROM expenses WHERE user_id = ${userId}`,
    ]);

    return {
      categories: (categories as DBCategory[]).map((c): CategoryConfig => ({
        id: c.id,
        label: c.label,
        bgColor: c.bg_color,
        textColor: c.text_color,
        dotColor: c.dot_color,
      })),
      incomes: (incomes as DBIncome[]).map((i): Income => ({
        id: i.id,
        name: i.name,
        amount: parseFloat(i.amount),
        month: i.month,
        notes: i.notes || '',
      })),
      expenses: (expenses as DBExpense[]).map((e): Expense => ({
        id: e.id,
        name: e.name,
        amount: parseFloat(e.amount),
        category: e.category_id || '',
        month: e.month,
        isRecurring: e.is_recurring,
        notes: e.notes || '',
        debtDetails: e.debt_details ? JSON.parse(e.debt_details) : undefined,
      })),
    };
  } catch (error) {
    console.error('Error loading user data:', error);
    return { categories: [], incomes: [], expenses: [] };
  }
}

// Add income
export async function addIncome(userId: string, income: Income) {
  try {
    await sql`
      INSERT INTO incomes (id, user_id, name, amount, month, notes)
      VALUES (${income.id}, ${userId}, ${income.name}, ${income.amount}, ${income.month}, ${income.notes || ''})
    `;
  } catch (error) {
    console.error('Error adding income:', error);
  }
}

// Update income
export async function updateIncome(userId: string, income: Income) {
  try {
    await sql`
      UPDATE incomes
      SET name = ${income.name}, amount = ${income.amount}, month = ${income.month}, notes = ${income.notes || ''}
      WHERE id = ${income.id} AND user_id = ${userId}
    `;
  } catch (error) {
    console.error('Error updating income:', error);
  }
}

// Delete income
export async function deleteIncome(userId: string, id: string) {
  try {
    await sql`DELETE FROM incomes WHERE id = ${id} AND user_id = ${userId}`;
  } catch (error) {
    console.error('Error deleting income:', error);
  }
}

// Add expense
export async function addExpense(userId: string, expense: Expense) {
  try {
    await sql`
      INSERT INTO expenses (id, user_id, name, amount, category_id, month, is_recurring, notes, debt_details)
      VALUES (
        ${expense.id},
        ${userId},
        ${expense.name},
        ${expense.amount},
        ${expense.category || null},
        ${expense.month},
        ${expense.isRecurring || false},
        ${expense.notes || ''},
        ${expense.debtDetails ? JSON.stringify(expense.debtDetails) : null}
      )
    `;
  } catch (error) {
    console.error('Error adding expense:', error);
  }
}

// Update expense
export async function updateExpense(userId: string, expense: Expense) {
  try {
    await sql`
      UPDATE expenses
      SET name = ${expense.name},
          amount = ${expense.amount},
          category_id = ${expense.category || null},
          month = ${expense.month},
          is_recurring = ${expense.isRecurring || false},
          notes = ${expense.notes || ''},
          debt_details = ${expense.debtDetails ? JSON.stringify(expense.debtDetails) : null}
      WHERE id = ${expense.id} AND user_id = ${userId}
    `;
  } catch (error) {
    console.error('Error updating expense:', error);
  }
}

// Delete expense
export async function deleteExpense(userId: string, id: string) {
  try {
    await sql`DELETE FROM expenses WHERE id = ${id} AND user_id = ${userId}`;
  } catch (error) {
    console.error('Error deleting expense:', error);
  }
}

// Add category
export async function addCategory(userId: string, category: CategoryConfig) {
  try {
    await sql`
      INSERT INTO categories (id, user_id, label, bg_color, text_color, dot_color)
      VALUES (${category.id}, ${userId}, ${category.label}, ${category.bgColor}, ${category.textColor}, ${category.dotColor})
    `;
  } catch (error) {
    console.error('Error adding category:', error);
  }
}
