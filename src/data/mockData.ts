export type TransactionType = 'Income' | 'Expense';

export interface Transaction {
  id: string;
  cropId: string;
  date: string;
  type: TransactionType;
  category: string; // 'Labour', 'Fertilizer', 'Income Source', etc.
  description: string;
  quantity?: number;
  unit?: string;
  rate?: number;
  amount: number;
  paymentMethod: string;
  notes?: string;
}

export interface Crop {
  id: string;
  name: string;
  icon: string; // Lucide icon name or emoji
  targetIncome: number;
  totalIncome: number;
  totalExpenses: number;
  lastUpdated: string;
}

export const mockCrops: Crop[] = [
  {
    id: 'nutmeg',
    name: 'Nutmeg',
    icon: '🌰',
    targetIncome: 500000,
    totalIncome: 320000,
    totalExpenses: 80000,
    lastUpdated: '2026-08-26',
  },
  {
    id: 'coconut',
    name: 'Coconut',
    icon: '🥥',
    targetIncome: 200000,
    totalIncome: 85000,
    totalExpenses: 25000,
    lastUpdated: '2026-08-25',
  },
  {
    id: 'arecanut',
    name: 'Areca Nut',
    icon: '🌴',
    targetIncome: 300000,
    totalIncome: 150000,
    totalExpenses: 45000,
    lastUpdated: '2026-08-27',
  },
  {
    id: 'rubber',
    name: 'Rubber',
    icon: '🌳',
    targetIncome: 600000,
    totalIncome: 450000,
    totalExpenses: 120000,
    lastUpdated: '2026-08-24',
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: 't1',
    cropId: 'nutmeg',
    date: '2026-08-25',
    type: 'Income',
    category: 'Sales',
    description: 'Sold Grade A Nutmeg',
    quantity: 100,
    unit: 'kg',
    rate: 600,
    amount: 60000,
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 't2',
    cropId: 'nutmeg',
    date: '2026-08-26',
    type: 'Expense',
    category: 'Labour',
    description: 'Harvesting wages',
    amount: 5000,
    paymentMethod: 'Cash',
  }
];
