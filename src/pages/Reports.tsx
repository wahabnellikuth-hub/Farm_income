import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, FileSpreadsheet, Printer, Loader2 } from 'lucide-react';
import type { Crop, Transaction } from '../types';
import { getCrops, getTransactions } from '../lib/db';
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([
        getCrops(user.uid),
        getTransactions(user.uid)
      ]).then(([c, t]) => {
        if (cropId) {
          setCrops(c.filter(crop => crop.id === cropId));
          setTransactions(t.filter(tx => tx.cropId === cropId));
        } else {
          setCrops(c);
          setTransactions(t);
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

  // Calculate real totals dynamically from transactions to ensure 100% accuracy
  const cropTotals = crops.reduce((acc, crop) => {
    const cropTxs = transactions.filter(t => t.cropId === crop.id);
    const income = cropTxs.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
    const expense = cropTxs.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
    acc[crop.id] = { income, expense };
    return acc;
  }, {} as Record<string, { income: number, expense: number }>);

  const totalIncome = Object.values(cropTotals).reduce((sum, curr) => sum + curr.income, 0);
  const totalExpenses = Object.values(cropTotals).reduce((sum, curr) => sum + curr.expense, 0);
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
      const totals = cropTotals[crop.id] || { income: 0, expense: 0 };
      const profit = totals.income - totals.expense;
      const margin = totals.income ? ((profit / totals.income) * 100).toFixed(1) + '%' : '0%';
      return [
        crop.name,
        formatCurrency(totals.income),
        formatCurrency(totals.expense),
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
      const totals = cropTotals[crop.id] || { income: 0, expense: 0 };
      const profit = totals.income - totals.expense;
      const margin = totals.income ? ((profit / totals.income) * 100).toFixed(1) + '%' : '0%';
      return {
        "Crop": crop.name,
        "Income": totals.income,
        "Expense": totals.expense,
        "Profit": profit,
        "Margin": margin
      };
    });

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.sheet_add_json(wsSummary, cropData, { origin: -1 });
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

    // Master Ledger
    const masterLedgerData = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let masterBalance = 0;
    const masterLedgerSheetData = masterLedgerData.map(tx => {
      masterBalance += tx.type === 'Income' ? tx.amount : -tx.amount;
      return {
        "Date": tx.date.split('T')[0],
        "Crop": crops.find(c => c.id === tx.cropId)?.name || 'Unknown',
        "Type": tx.type,
        "Category": tx.category,
        "Description": tx.description,
        "Quantity (kg)": tx.quantity || '-',
        "Grade": tx.grade || '-',
        "Rate (₹)": tx.rate || '-',
        "Income (₹)": tx.type === 'Income' ? tx.amount : 0,
        "Expense (₹)": tx.type === 'Expense' ? tx.amount : 0,
        "Balance (₹)": masterBalance,
        "Payment Method": tx.paymentMethod
      };
    });

    if (masterLedgerSheetData.length > 0) {
      // Add a totals row
      masterLedgerSheetData.push({
        "Date": "TOTALS",
        "Crop": "",
        "Type": "",
        "Category": "",
        "Description": "",
        "Quantity (kg)": "",
        "Grade": "",
        "Rate (₹)": "",
        "Income (₹)": totalIncome,
        "Expense (₹)": totalExpenses,
        "Balance (₹)": masterBalance,
        "Payment Method": ""
      });
      const wsMasterLedger = XLSX.utils.json_to_sheet(masterLedgerSheetData);
      XLSX.utils.book_append_sheet(wb, wsMasterLedger, "Master Ledger");
    }

    // Individual Crop Sheets
    crops.forEach(crop => {
      const cropTxs = transactions.filter(t => t.cropId === crop.id).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      if (cropTxs.length > 0) {
        let balance = 0;
        const cropSheetData = cropTxs.map(tx => {
          balance += tx.type === 'Income' ? tx.amount : -tx.amount;
          return {
            "Date": tx.date.split('T')[0],
            "Type": tx.type,
            "Category": tx.category,
            "Description": tx.description,
            "Quantity (kg)": tx.quantity || '-',
            "Grade": tx.grade || '-',
            "Rate (₹)": tx.rate || '-',
            "Income (₹)": tx.type === 'Income' ? tx.amount : 0,
            "Expense (₹)": tx.type === 'Expense' ? tx.amount : 0,
            "Balance (₹)": balance,
            "Payment Method": tx.paymentMethod
          };
        });
        // Add a totals row for the crop
        const totals = cropTotals[crop.id] || { income: 0, expense: 0 };
        cropSheetData.push({
          "Date": "TOTALS",
          "Type": "",
          "Category": "",
          "Description": "",
          "Quantity (kg)": "",
          "Grade": "",
          "Rate (₹)": "",
          "Income (₹)": totals.income,
          "Expense (₹)": totals.expense,
          "Balance (₹)": balance,
          "Payment Method": ""
        });
        
        const wsCrop = XLSX.utils.json_to_sheet(cropSheetData);
        let sheetName = crop.name.substring(0, 31).replace(/[\\/*?:\[\]]/g, '');
        
        let finalSheetName = sheetName;
        let counter = 1;
        while (wb.SheetNames.includes(finalSheetName)) {
          finalSheetName = `${sheetName.substring(0, 28)}_${counter}`;
          counter++;
        }
        
        XLSX.utils.book_append_sheet(wb, wsCrop, finalSheetName);
      }
    });

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
                  const totals = cropTotals[crop.id] || { income: 0, expense: 0 };
                  const profit = totals.income - totals.expense;
                  const margin = totals.income ? (profit / totals.income) * 100 : 0;
                  
                  return (
                    <tr key={crop.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 flex items-center gap-2">
                        <span>{crop.icon}</span> {crop.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-green-600">{formatCurrency(totals.income)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-red-600">{formatCurrency(totals.expense)}</td>
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
