export type CategoryType =
  | 'abo'
  | 'fixkosten'
  | 'schulden'
  | 'versicherung'
  | 'sonstiges'
  | string;

export interface DebtDetails {
  totalAmount: number;
  remainingAmount: number;
  monthlyRate: number;
  startDate: string;
  endDate: string;
  referenceNumber?: string;
  contactPhone?: string;
  contactName?: string;
}

export interface Income {
  id: string;
  name: string;
  amount: number;
  month: string;
  isRecurring?: boolean;
  notes?: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: CategoryType;
  month: string;
  isRecurring: boolean;
  notes?: string;
  debtDetails?: DebtDetails;
}

export interface FuelEntry {
  id: string;
  date: string;           // YYYY-MM-DD
  pricePerLiter: number;  // €/L
  liters: number;
  totalAmount: number;
  odometer?: number;      // km
  isFullTank: boolean;
  stationName?: string;
  expenseId?: string;     // FK → expenses
  month: string;          // YYYY-MM
}

export interface CategoryConfig {
  id: CategoryType;
  label: string;
  bgColor: string;
  textColor: string;
  dotColor: string;
}

export const DEFAULT_CATEGORIES: CategoryConfig[] = [
  { id: 'abo', label: 'Abo', bgColor: '#2a2a55', textColor: '#AFA9EC', dotColor: '#AFA9EC' },
  { id: 'fixkosten', label: 'Fixkosten', bgColor: '#1a2a33', textColor: '#85B7EB', dotColor: '#85B7EB' },
  { id: 'schulden', label: 'Schulden', bgColor: '#2a3322', textColor: '#97C459', dotColor: '#97C459' },
  { id: 'versicherung', label: 'Versicherung', bgColor: '#2a2233', textColor: '#D4537E', dotColor: '#D4537E' },
  { id: 'sonstiges', label: 'Sonstiges', bgColor: '#2a2a22', textColor: '#EF9F27', dotColor: '#EF9F27' },
  { id: 'tanken', label: 'Tanken', bgColor: '#1a2a2a', textColor: '#5DCAA5', dotColor: '#5DCAA5' },
];
