import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Wallet, IndianRupee, Plus, Activity, Loader2 } from 'lucide-react';
import type { Crop } from '../data/mockData';
import { getCrops } from '../lib/db';
import { useAuth } from '../context/AuthContext';
import { cn } from '../components/Layout';

export default function Dashboard() {
  const { user } = useAuth();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getCrops(user.uid).then(data => {
        setCrops(data);
        setLoading(false);
      });
    }
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const totalIncome = crops.reduce((acc, crop) => acc + (crop.totalIncome || 0), 0);
  const totalExpenses = crops.reduce((acc, crop) => acc + (crop.totalExpenses || 0), 0);
  const totalProfit = totalIncome - totalExpenses;
  
  const totalTransactions = 124; // Still mocked for now

  if (loading) {
    return <div className="p-8 flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-farm-green-600" /></div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-farm-green-900">Farm Overview</h1>
        <p className="text-gray-500">Track your agricultural financial performance.</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-lg text-green-600">
            <IndianRupee className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Income</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totalIncome)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-red-100 rounded-lg text-red-600">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Expenses</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-farm-green-100 rounded-lg text-farm-green-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Profit</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totalProfit)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Transactions</p>
            <p className="text-xl font-bold text-gray-900">{totalTransactions}</p>
          </div>
        </div>
      </div>

      {/* Crop Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Your Crops</h2>
          <button className="flex items-center text-sm font-medium text-farm-green-600 hover:text-farm-green-700 bg-farm-green-50 px-3 py-1.5 rounded-lg transition-colors">
            <Plus className="h-4 w-4 mr-1" />
            Add Crop
          </button>
        </div>

        {crops.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-sm">
            <p className="text-gray-500 mb-4">You haven't added any crops yet, or the database hasn't been seeded.</p>
            <Link to="/settings" className="text-farm-green-600 font-medium hover:underline">Go to Settings to Seed Mock Data</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {crops.map((crop) => {
              const cropIncome = crop.totalIncome || 0;
              const cropExpenses = crop.totalExpenses || 0;
              const cropTarget = crop.targetIncome || 1;
              const cropProfit = cropIncome - cropExpenses;
              const progress = Math.min((cropIncome / cropTarget) * 100, 100);

              return (
                <Link 
                  key={crop.id} 
                  to={`/crop/${crop.id}`}
                  className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{crop.icon}</span>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-farm-green-700 transition-colors">{crop.name}</h3>
                    </div>
                    <span className={cn(
                      "text-xs font-semibold px-2 py-1 rounded-full flex items-center",
                      cropProfit >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {cropProfit >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {formatCurrency(Math.abs(cropProfit))}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Income:</span>
                      <span className="font-medium text-green-600">{formatCurrency(cropIncome)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Expenses:</span>
                      <span className="font-medium text-red-600">{formatCurrency(cropExpenses)}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Target Progress</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-farm-green-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {crop.lastUpdated && <p className="text-xs text-gray-400 mt-2 text-right">Updated: {new Date(crop.lastUpdated).toLocaleDateString()}</p>}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
