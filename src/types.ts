export type TransactionType = 'Income' | 'Expense';

export interface Transaction {
  id: string;
  cropId: string;
  date: string;
  type: TransactionType;
  category: string;
  description: string;
  quantity?: number;
  unit?: string;
  rate?: number;
  amount: number;
  paymentMethod: string;
  notes?: string;
  grade?: string;
}

export interface Crop {
  id: string;
  name: string;
  icon: string;
  targetIncome: number;
  totalIncome: number;
  totalExpenses: number;
  lastUpdated: string;
}
