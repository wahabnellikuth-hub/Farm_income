import { mockCrops } from '../data/mockData';
import { Download, FileText, Printer, FileSpreadsheet } from 'lucide-react';
import { cn } from '../components/Layout';

export default function Reports() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const totalIncome = mockCrops.reduce((acc, crop) => acc + crop.totalIncome, 0);
  const totalExpenses = mockCrops.reduce((acc, crop) => acc + crop.totalExpenses, 0);
  const totalProfit = totalIncome - totalExpenses;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-farm-green-900">Combined Financial Report</h1>
          <p className="text-gray-500">Comprehensive overview of all agricultural activities.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
          <button className="flex items-center justify-center px-4 py-3 sm:py-2 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100 transition w-full sm:w-auto">
            <FileText className="w-5 h-5 sm:w-4 sm:h-4 mr-2" /> PDF Report
          </button>
          <button className="flex items-center justify-center px-4 py-3 sm:py-2 bg-green-50 text-green-700 rounded-lg border border-green-100 hover:bg-green-100 transition w-full sm:w-auto">
            <FileSpreadsheet className="w-5 h-5 sm:w-4 sm:h-4 mr-2" /> Export Excel
          </button>
          <button className="flex items-center justify-center px-4 py-3 sm:py-2 bg-gray-50 text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-100 transition w-full sm:w-auto">
            <Printer className="w-5 h-5 sm:w-4 sm:h-4 mr-2" /> Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm font-medium text-gray-500 mb-1">Overall Income</p>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm font-medium text-gray-500 mb-1">Overall Expenses</p>
          <p className="text-3xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm font-medium text-gray-500 mb-1">Net Profit</p>
          <p className="text-3xl font-bold text-farm-green-600">{formatCurrency(totalProfit)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Crop Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 font-medium">Crop</th>
                <th className="px-6 py-4 font-medium text-right">Income</th>
                <th className="px-6 py-4 font-medium text-right">Expense</th>
                <th className="px-6 py-4 font-medium text-right">Profit</th>
                <th className="px-6 py-4 font-medium text-center">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockCrops.map((crop) => {
                const profit = crop.totalIncome - crop.totalExpenses;
                const margin = crop.totalIncome > 0 ? (profit / crop.totalIncome) * 100 : 0;
                
                return (
                  <tr key={crop.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 flex items-center gap-2">
                      <span>{crop.icon}</span> {crop.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-green-600">{formatCurrency(crop.totalIncome)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-red-600">{formatCurrency(crop.totalExpenses)}</td>
                    <td className={cn(
                      "px-6 py-4 whitespace-nowrap text-right font-bold",
                      profit >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {formatCurrency(profit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium",
                        margin > 50 ? "bg-green-100 text-green-700" : margin > 20 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                      )}>
                        {margin.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
