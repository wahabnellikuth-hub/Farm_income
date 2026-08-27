import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { Transaction } from '../data/mockData';
import { getTransactions } from '../lib/db';
import { useAuth } from '../context/AuthContext';
import { cn } from '../components/Layout';

export default function CalendarView() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // August 2026 for mock data alignment

  useEffect(() => {
    if (user) {
      getTransactions(user.uid).then(t => {
        setTransactions(t);
        setLoading(false);
      });
    }
  }, [user]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getTransactionsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return transactions.filter(t => t.date === dateStr);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  if (loading) {
    return <div className="p-8 flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-farm-green-600" /></div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-farm-green-900">Farm Calendar</h1>
          <p className="text-gray-500">Track events, harvest dates, and transactions.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-md transition"><ChevronLeft className="w-5 h-5" /></button>
          <span className="font-semibold w-32 text-center text-gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-md transition"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-gray-200 border-b border-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-gray-50 py-3 text-center text-sm font-semibold text-gray-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {padding.map(p => (
            <div key={`pad-${p}`} className="bg-white min-h-[120px] p-2" />
          ))}
          
          {days.map(day => {
            const dayTransactions = getTransactionsForDay(day);
            return (
              <div key={day} className="bg-white min-h-[120px] p-2 hover:bg-gray-50 transition cursor-pointer group">
                <span className="text-sm font-medium text-gray-500 group-hover:text-farm-green-600">{day}</span>
                <div className="mt-2 space-y-1">
                  {dayTransactions.map((tx, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "text-xs px-2 py-1 rounded truncate",
                        tx.type === 'Income' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}
                      title={tx.description}
                    >
                      {tx.type === 'Income' ? '+' : '-'}{tx.amount}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
