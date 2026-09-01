import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { TransactionType } from '../../types';

interface AddTransactionFormProps {
  type: TransactionType;
  onSubmit: (data: { date: string; amount: number; description: string; category: string; paymentMethod: string; quantity?: number; grade?: string; }) => Promise<void>;
}

export function AddTransactionForm({ type, onSubmit }: AddTransactionFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [grade, setGrade] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [loading, setLoading] = useState(false);

  const categories = type === 'Income' 
    ? ['Sales', 'Subsidies', 'Other Income']
    : ['Labour', 'Fertilizer', 'Seeds', 'Pesticides', 'Fuel', 'Machinery', 'Transport', 'Other Expense'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !category) return;
    
    try {
      setLoading(true);
      await onSubmit({
        date,
        amount: Number(amount),
        description,
        category,
        paymentMethod,
        quantity: quantity ? Number(quantity) : undefined,
        grade: grade || undefined
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input 
          type="date" 
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:outline-none bg-white appearance-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
          <input 
            type="number" 
            required
            min="0"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <input 
          type="text" 
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Sold 100kg Wheat"
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (kg) <span className="text-gray-400 font-normal text-xs">(Optional)</span></label>
          <input 
            type="number" 
            min="0"
            step="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g. 50"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quality Grade <span className="text-gray-400 font-normal text-xs">(Optional)</span></label>
          <select 
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:outline-none bg-white appearance-none"
          >
            <option value="">None</option>
            <option value="Grade 1">Grade 1</option>
            <option value="Grade 2">Grade 2</option>
            <option value="Grade 3">Grade 3</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select 
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:outline-none bg-white appearance-none"
          >
            <option value="" disabled>Select...</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
          <select 
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:outline-none bg-white appearance-none"
          >
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="UPI">UPI</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3.5 text-white rounded-xl font-medium transition flex items-center justify-center disabled:opacity-50 ${
            type === 'Income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          Save {type}
        </button>
      </div>
    </form>
  );
}
