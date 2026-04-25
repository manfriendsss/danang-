import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Calculator, 
  User, 
  DollarSign, 
  ArrowRightLeft,
  Receipt,
  UserPlus
} from 'lucide-react';
import { QuickExpense } from '../types';

interface ExpenseTrackerProps {
  expenses: QuickExpense[];
  adultCount: number;
  onAdd: (expense: Omit<QuickExpense, 'id'>) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onUpdateAdultCount: (count: number) => void;
}

export default function ExpenseTracker({ expenses, adultCount, onAdd, onRemove, onUpdateAdultCount }: ExpenseTrackerProps) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [payer, setPayer] = useState('QAnh');
  const [isAdding, setIsAdding] = useState(false);

  const payers = ["QAnh", "Linh", "NA", "Sơn", "Bố Thắng", "Mẹ Hà", "Dì Hương", "Cậu Thành"];

  const formatCurrency = (value: string) => {
    const number = value.replace(/\D/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setAmount(rawValue);
  };

  const handleAdd = async () => {
    if (!desc || !amount || !payer || isAdding) return;
    setIsAdding(true);
    try {
      await onAdd({
        description: desc,
        amount: parseFloat(amount),
        payer: payer,
        date: new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
      });
      setDesc('');
      setAmount('');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa khoản chi này?")) {
      await onRemove(id);
    }
  };

  const total = (expenses || []).reduce((sum, e) => sum + e.amount, 0);
  const perPerson = total / (adultCount || 1);

  // Group by payer to see who spent how much
  const payerTotals: Record<string, number> = {};
  (expenses || []).forEach(e => {
    payerTotals[e.payer] = (payerTotals[e.payer] || 0) + e.amount;
  });

  // Group by date
  const groupedExpenses: Record<string, QuickExpense[]> = {};
  (expenses || []).forEach(e => {
    if (!groupedExpenses[e.date]) groupedExpenses[e.date] = [];
    groupedExpenses[e.date].push(e);
  });

  return (
    <div className="bg-white rounded-[2.5rem] p-5 pt-8 md:p-8 md:pt-10 shadow-sm border border-slate-100 overflow-hidden relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pr-10">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calculator className="text-orange-500" />
            Chia tiền nhanh
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Ghi chú & tính toán thu chi đoàn</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 shrink-0">
           <User size={14} className="text-slate-400" />
           <input 
              type="number" 
              value={adultCount} 
              onChange={(e) => onUpdateAdultCount(parseInt(e.target.value) || 1)}
              className="w-12 bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 text-center p-0"
           />
           <span className="text-[10px] text-slate-400 font-bold uppercase pr-2">Người lớn</span>
        </div>
      </div>

      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8 p-3 md:p-5 bg-slate-50/50 rounded-[2rem] border border-slate-100">
        <div className="md:col-span-2">
          <input 
            type="text" 
            placeholder="Mô tả chi tiêu (ví dụ: Mua hải sản)" 
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="space-y-3">
          <input 
            type="text" 
            inputMode="numeric"
            placeholder="Số tiền" 
            value={formatCurrency(amount)}
            onChange={handleAmountChange}
            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-orange-500 outline-none transition-all shadow-sm"
          />
          <select 
            value={payer}
            onChange={(e) => setPayer(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none appearance-none cursor-pointer shadow-sm font-medium"
          >
            <option value="" disabled>Ai trả?</option>
            {payers.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={handleAdd}
          disabled={isAdding}
          className={`h-full flex items-center justify-center p-4 bg-orange-500 text-white rounded-[1.5rem] hover:bg-orange-600 transition-all shadow-md cursor-pointer active:scale-95 ${isAdding ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isAdding ? (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            <Plus size={24} strokeWidth={3} />
          )}
        </button>
      </div>

      {/* Expense List */}
      <div className="mb-6 space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
        {Object.entries(groupedExpenses).sort((a, b) => b[0].localeCompare(a[0])).map(([date, items]) => (
          <div key={date} className="space-y-2">
            <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-2">{date}</h4>
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center shrink-0">
                    <Receipt size={18} />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-700">{item.description}</h5>
                    <p className="text-[10px] font-bold text-sky-600 uppercase tracking-tight">{item.payer}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm font-bold text-slate-800">{item.amount.toLocaleString()}đ</span>
                  <button 
                    onClick={() => handleRemove(item.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
        {expenses.length === 0 && (
          <div className="py-12 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
            <Receipt className="mx-auto text-slate-200 mb-2" size={40} />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Chưa có chi phí nào</p>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-2">
        <div className="bg-orange-50 border border-orange-100 p-3 md:p-4 rounded-2xl">
          <p className="text-[10px] text-orange-600 uppercase font-bold tracking-widest leading-none mb-1.5 md:mb-2">Tổng chi</p>
          <p className="text-lg md:text-2xl font-bold text-slate-800 tracking-tighter truncate">
            {total.toLocaleString('vi-VN')}
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-100 p-3 md:p-4 rounded-2xl">
          <p className="text-[10px] text-blue-600 uppercase font-bold tracking-widest leading-none mb-1.5 md:mb-2">Trung bình</p>
          <p className="text-lg md:text-2xl font-bold text-slate-800 tracking-tighter truncate">
            {Math.round(perPerson).toLocaleString('vi-VN')}
          </p>
        </div>
      </div>

      {/* Payer Summary */}
      {Object.keys(payerTotals).length > 0 && (
        <div className="mt-8 pt-6 border-t border-dashed border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
            <UserPlus size={14} /> Trạng thái ví
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(payerTotals).map(([name, val]) => {
              return (
                <div key={name} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px]">
                  <span className="font-bold text-slate-600">{name}:</span>{' '}
                  <span className="text-slate-500">{(val as number).toLocaleString()}đ</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
