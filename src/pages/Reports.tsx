import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, FileSpreadsheet, Printer, Loader2 } from 'lucide-react';
import type { Crop } from '../types';
import { getCrops } from '../lib/db';
import { useAuth } from '../context/AuthContext';
import { cn } from '../components/Layout';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function Reports() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const cropId = searchParams.get('cropId');
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getCrops(user.uid).then((c) => {
        if (cropId) {
          setCrops(c.filter(crop => crop.id === cropId));
        } else {
          setCrops(c);
        }
        setLoading(false);
      });
    }
  }, [user, cropId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  if (loading) {
    return <div className="p-8 flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-farm-green-600" /></div>;
  }

  const totalIncome = crops.reduce((acc, crop) => acc + crop.totalIncome, 0);
  const totalExpenses = crops.reduce((acc, crop) => acc + crop.totalExpenses, 0);
  const totalProfit = totalIncome - totalExpenses;

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Farm Financial Report', 14, 15);
    
    // Add Summary
    doc.setFontSize(11);
    doc.text(`Total Income: ${formatCurrency(totalIncome)}`, 14, 25);
    doc.text(`Total Expenses: ${formatCurrency(totalExpenses)}`, 14, 32);
    doc.text(`Net Profit: ${formatCurrency(totalProfit)}`, 14, 39);

    const tableColumn = ["Crop", "Income", "Expense", "Profit", "Margin"];
    const tableRows = crops.map(crop => {
      const profit = (crop.totalIncome || 0) - (crop.totalExpenses || 0);
      const margin = crop.totalIncome ? ((profit / crop.totalIncome) * 100).toFixed(1) + '%' : '0%';
      return [
        crop.name,
        formatCurrency(crop.totalIncome || 0),
        formatCurrency(crop.totalExpenses || 0),
        formatCurrency(profit),
        margin
      ];
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
    });

    doc.save('farm_financial_report.pdf');
  };

  const handleExportExcel = () => {
    const summaryData = [
      ["Summary", ""],
      ["Total Income", totalIncome],
      ["Total Expenses", totalExpenses],
      ["Net Profit", totalProfit],
      [],
    ];

    const cropData = crops.map(crop => {
      const profit = (crop.totalIncome || 0) - (crop.totalExpenses || 0);
      const margin = crop.totalIncome ? ((profit / crop.totalIncome) * 100).toFixed(1) + '%' : '0%';
      return {
        "Crop": crop.name,
        "Income": crop.totalIncome || 0,
        "Expense": crop.totalExpenses || 0,
        "Profit": profit,
        "Margin": margin
      };
    });

    const ws = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.sheet_add_json(ws, cropData, { origin: -1 });
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Financial Report");
    
    XLSX.writeFile(wb, "farm_financial_report.xlsx");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-24 lg:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-farm-green-900">Combined Financial Report</h1>
          <p className="text-gray-500">Comprehensive overview of all agricultural activities.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
          <button onClick={handleExportPDF} className="flex items-center justify-center px-4 py-3 sm:py-2 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100 transition w-full sm:w-auto print:hidden">
            <FileText className="w-5 h-5 sm:w-4 sm:h-4 mr-2" /> PDF Report
          </button>
          <button onClick={handleExportExcel} className="flex items-center justify-center px-4 py-3 sm:py-2 bg-green-50 text-green-700 rounded-lg border border-green-100 hover:bg-green-100 transition w-full sm:w-auto print:hidden">
            <FileSpreadsheet className="w-5 h-5 sm:w-4 sm:h-4 mr-2" /> Export Excel
          </button>
          <button onClick={handlePrint} className="flex items-center justify-center px-4 py-3 sm:py-2 bg-gray-50 text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-100 transition w-full sm:w-auto print:hidden">
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
              {crops.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No crops data available.
                  </td>
                </tr>
              ) : (
                crops.map((crop) => {
                  const profit = (crop.totalIncome || 0) - (crop.totalExpenses || 0);
                  const margin = crop.totalIncome ? (profit / crop.totalIncome) * 100 : 0;
                  
                  return (
                    <tr key={crop.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 flex items-center gap-2">
                        <span>{crop.icon}</span> {crop.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-green-600">{formatCurrency(crop.totalIncome || 0)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-red-600">{formatCurrency(crop.totalExpenses || 0)}</td>
                      <td className={cn(
                        "px-6 py-4 whitespace-nowrap text-right font-bold",
                        profit >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {formatCurrency(Math.abs(profit))}
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
