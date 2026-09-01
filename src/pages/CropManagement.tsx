import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Crop, Transaction, TransactionType } from '../types';
import { getCrops, getTransactions, addTransaction } from '../lib/db';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { AddTransactionForm } from '../components/forms/AddTransactionForm';
import { 
  PlusCircle, 
  MinusCircle, 
  FileText, 
  BarChart2, 
  Target,
  ArrowLeft,
  Search,
  Filter,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import { cn } from '../components/Layout';

export default function CropManagement() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [crop, setCrop] = useState<Crop | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState<TransactionType>('Income');

  const openTxModal = (type: TransactionType) => {
    setTxModalType(type);
    setIsAddTxModalOpen(true);
  };

  const handleAddTransaction = async (data: { date: string; amount: number; description: string; category: string; paymentMethod: string; quantity?: number; grade?: string; }) => {
    if (!user || !crop) return;
    await addTransaction(user.uid, {
      ...data,
      cropId: crop.id,
      type: txModalType
    });
    setIsAddTxModalOpen(false);
    
    // Refresh data
    const [allCrops, allTransactions] = await Promise.all([
      getCrops(user.uid),
      getTransactions(user.uid)
    ]);
    const foundCrop = allCrops.find(c => c.id === id);
    setCrop(foundCrop || null);
    setTransactions(allTransactions.filter(t => t.cropId === id));
  };

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    if (user && id) {
      Promise.all([
        getCrops(user.uid),
        getTransactions(user.uid)
      ]).then(([allCrops, allTransactions]) => {
        const foundCrop = allCrops.find(c => c.id === id);
        setCrop(foundCrop || null);
        setTransactions(allTransactions.filter(t => t.cropId === id));
        setLoading(false);
      });
    }
  }, [user, id]);

  if (loading) {
    return <div className="p-8 flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-farm-green-600" /></div>;
  }

  if (!crop) {
    return <div className="p-6 text-center text-gray-500">Crop not found</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const remaining = crop.targetIncome - crop.totalIncome;
  const progress = Math.min((crop.totalIncome / crop.targetIncome) * 100, 100);

  const filteredTransactions = transactions.filter(t => {
    if (filterType !== 'All' && t.type !== filterType) return false;
    if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-farm-green-900 flex items-center gap-3">
              <span className="text-4xl">{crop.icon}</span> 
              {crop.name} Management
            </h1>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <button onClick={() => openTxModal('Income')} className="hidden sm:flex items-center justify-center px-4 py-3 sm:py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition w-full sm:w-auto">
            <PlusCircle className="w-5 h-5 sm:w-4 sm:h-4 mr-2" /> Add Income
          </button>
          <button onClick={() => openTxModal('Expense')} className="hidden sm:flex items-center justify-center px-4 py-3 sm:py-2 bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 transition w-full sm:w-auto">
            <MinusCircle className="w-5 h-5 sm:w-4 sm:h-4 mr-2" /> Add Expense
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <button className="flex items-center justify-center px-4 py-3 sm:py-2 bg-white border border-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition">
          <FileText className="w-5 h-5 sm:w-4 sm:h-4 mr-2 text-blue-600" /> Generate Report
        </button>
        <button className="flex items-center justify-center px-4 py-3 sm:py-2 bg-white border border-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition">
          <BarChart2 className="w-5 h-5 sm:w-4 sm:h-4 mr-2 text-purple-600" /> View Statistics
        </button>
      </div>

      {/* Target Card */}
      <div className="bg-gradient-to-r from-farm-green-800 to-farm-green-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold opacity-90 flex items-center gap-2">
              <Target className="w-5 h-5" /> Target Income
            </h2>
            <p className="text-3xl sm:text-4xl font-bold mt-2">{formatCurrency(crop.targetIncome)}</p>
          </div>
          <button className="text-sm px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition">
            Edit Target
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm sm:text-base">
            <span>Current: <strong className="font-semibold">{formatCurrency(crop.totalIncome)}</strong></span>
            <span>Remaining: <strong className="font-semibold">{remaining > 0 ? formatCurrency(remaining) : 'Goal Reached!'}</strong></span>
          </div>
          <div className="w-full bg-black/20 rounded-full h-3 backdrop-blur-sm p-0.5">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center font-medium italic opacity-90">
            {progress >= 100 
              ? "🎉 Excellent! You've reached your goal." 
              : `🌱 You are ${progress.toFixed(1)}% towards your target. Keep going!`}
          </p>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Transaction History</h2>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-9 pr-4 py-3 sm:py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-farm-green-500 w-full sm:w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="relative w-full sm:w-auto">
                <select 
                  className="pl-8 pr-4 py-3 sm:py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-farm-green-500 appearance-none bg-white w-full sm:w-auto"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="All">All Types</option>
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
                <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Details</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
                <th className="px-6 py-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium",
                        tx.type === 'Income' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">{tx.description}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {tx.quantity ? <span className="block font-medium">{tx.quantity} kg</span> : null}
                      {tx.grade ? <span className="block text-farm-green-600">{tx.grade}</span> : null}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{tx.category}</td>
                    <td className={cn(
                      "px-6 py-4 whitespace-nowrap text-right font-bold",
                      tx.type === 'Income' ? "text-green-600" : "text-red-600"
                    )}>
                      {tx.type === 'Income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600 transition"><Edit className="w-4 h-4" /></button>
                        <button className="p-1 text-gray-400 hover:text-red-600 transition"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden flex flex-col divide-y divide-gray-100">
            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No transactions found.</div>
            ) : (
              filteredTransactions.map((tx) => (
                <div key={tx.id} className="p-4 bg-white flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{tx.description}</h4>
                      <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()} • {tx.category}</p>
                      {(tx.quantity || tx.grade) && (
                        <p className="text-xs mt-1">
                          {tx.quantity ? <span className="text-gray-600 font-medium mr-2">{tx.quantity} kg</span> : null}
                          {tx.grade ? <span className="text-farm-green-600">{tx.grade}</span> : null}
                        </p>
                      )}
                    </div>
                    <span className={cn(
                      "font-bold",
                      tx.type === 'Income' ? "text-green-600" : "text-red-600"
                    )}>
                      {tx.type === 'Income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-medium",
                      tx.type === 'Income' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {tx.type}
                    </span>
                    <div className="flex gap-2">
                      <button className="p-1 text-gray-400 hover:text-blue-600 transition"><Edit className="w-4 h-4" /></button>
                      <button className="p-1 text-gray-400 hover:text-red-600 transition"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="sm:hidden fixed bottom-20 right-4 flex flex-col gap-3 z-40">
        <button
          onClick={() => openTxModal('Expense')}
          className="p-3 bg-red-600 text-white rounded-full shadow-xl hover:bg-red-700 transition active:scale-95"
        >
          <MinusCircle className="h-6 w-6" />
        </button>
        <button
          onClick={() => openTxModal('Income')}
          className="p-3 bg-green-600 text-white rounded-full shadow-xl hover:bg-green-700 transition active:scale-95"
        >
          <PlusCircle className="h-6 w-6" />
        </button>
      </div>

      <Modal 
        isOpen={isAddTxModalOpen} 
        onClose={() => setIsAddTxModalOpen(false)}
        title={`Add ${txModalType}`}
      >
        <AddTransactionForm type={txModalType} onSubmit={handleAddTransaction} />
      </Modal>
    </div>
  );
}
