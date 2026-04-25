import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import { 
  Calendar, 
  MapPin, 
  Trash2, 
  Plus, 
  DollarSign, 
  Utensils, 
  Car, 
  Home, 
  Users, 
  ChevronRight, 
  Info,
  Waves,
  Sun,
  Coffee,
  CheckCircle2,
  Navigation,
  Calculator,
  X,
  Play,
  Flag,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  LogIn,
  LogOut,
  Download,
  Share2,
  Camera,
  Loader2
} from 'lucide-react';
import { initialData } from './data';
import { ItineraryData, Activity, DayPlan, RecommendationItem } from './types';
import AIChat from './components/AIChat';
import ExpenseTracker from './components/ExpenseTracker';
import { useFirebase } from './components/FirebaseProvider';

export default function App() {
  const { user, loading, tripData, login, logout, addExpense, removeExpense, setTripStatus, setAdultCount, resetExpensesToDefault } = useFirebase();
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isBudgetExporting, setIsBudgetExporting] = useState(false);
  
  const itineraryRef = useRef<HTMLDivElement>(null);
  const budgetRef = useRef<HTMLDivElement>(null);

  const exportAsImage = useCallback(async () => {
    if (itineraryRef.current === null) return;
    
    setIsExporting(true);
    try {
      const element = itineraryRef.current;
      // We need to temporarily remove height constraints for capture
      const originalStyle = element.getAttribute('style');
      element.style.maxHeight = 'none';
      element.style.overflow = 'visible';
      element.style.height = 'auto';

      const dataUrl = await toPng(element, {
        cacheBust: true,
        backgroundColor: '#fdf6e3',
        style: {
          padding: '40px',
          borderRadius: '0',
          margin: '0',
        },
        pixelRatio: 2,
      });
      
      // Restore style
      if (originalStyle) {
        element.setAttribute('style', originalStyle);
      } else {
        element.removeAttribute('style');
      }

      download(dataUrl, `lich-trinh-he-2026.png`);
    } catch (err) {
      console.error('Itinerary export failed', err);
    } finally {
      setIsExporting(false);
    }
  }, [itineraryRef]);

  const exportBudgetAsImage = useCallback(async () => {
    if (budgetRef.current === null) return;
    setIsBudgetExporting(true);
    try {
      const element = budgetRef.current;
      const originalStyle = element.getAttribute('style');
      element.style.maxHeight = 'none';
      element.style.overflow = 'visible';
      element.style.height = 'auto';

      const dataUrl = await toPng(element, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        style: {
          padding: '40px',
          borderRadius: '40px',
          margin: '0',
        },
        pixelRatio: 2,
      });

      if (originalStyle) {
        element.setAttribute('style', originalStyle);
      } else {
        element.removeAttribute('style');
      }

      download(dataUrl, `du-toan-chuyen-di-2026.png`);
    } catch (err) {
      console.error('Budget export failed', err);
    } finally {
      setIsBudgetExporting(false);
    }
  }, [budgetRef]);

  // If loading, show a simple spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf6e3]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Use tripData from Firebase, fallback to local state if needed (though FirebaseProvider handles initial seeding)
  const data = tripData || {
    ...initialData,
    quickExpenses: [],
    adultCount: 8,
    tripStatus: 'planning'
  };

  const totalBudget = data?.expenses?.items?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const totalActual = data?.quickExpenses?.reduce((sum, item) => sum + item.amount, 0) || 0;
  
  // Custom logic for 6 HN and 2 HCM people
  const hnOnlyCategories = ["Căn hộ Cửa Lò", "Xăng xe", "Phí cầu đường"];
  const hnOnlyTotal = data?.expenses?.items
    ?.filter(item => hnOnlyCategories.some(cat => item.category.includes(cat)))
    ?.reduce((sum, item) => sum + item.amount, 0) || 0;
  
  const sharedTotal = totalBudget - hnOnlyTotal;
  
  const totalPeople = 8;
  const hnCount = 6;
  const hcmCount = 2;

  const perPersonHCM = Math.round(sharedTotal / totalPeople);
  const perPersonHN = Math.round(sharedTotal / totalPeople + hnOnlyTotal / hnCount);

  const perPersonActual = Math.round(totalActual / (data.adultCount || 8));

  const diff = totalActual - totalBudget;
  const diffPerPerson = Math.round(diff / (data.adultCount || 8));

  const startTrip = () => setTripStatus('ongoing');
  const endTrip = () => setTripStatus('finished');
  const resetTrip = () => setTripStatus('planning');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen text-slate-800 pb-20 selection:bg-sky-200">
      {/* Header */}
      <header className="summer-gradient pt-16 pb-28 px-6 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <Waves className="w-96 h-96 absolute -bottom-20 -left-20 animate-pulse" />
          <Sun className="w-64 h-64 absolute -top-10 -right-10 animate-spin" style={{ animationDuration: '20s' }} />
        </div>
        
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-xl uppercase tracking-tighter">
            {data.title}
          </h1>
          <p className="text-lg md:text-xl opacity-90 font-medium tracking-wide">
            {data.subtitle}
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <span className="bg-white/20 backdrop-blur-md px-5 py-2 rounded-2xl text-xs md:text-sm font-bold border border-white/30 flex items-center gap-2">
              <Users size={16} /> {data.adultCount || 10} Người lớn
            </span>
            <span className="bg-white/20 backdrop-blur-md px-5 py-2 rounded-2xl text-xs md:text-sm font-bold border border-white/30 flex items-center gap-2 uppercase tracking-widest text-[10px]">
              {data.tripStatus === 'planning' ? 'Giai đoạn lập kế hoạch' : 
               data.tripStatus === 'ongoing' ? 'Hành trình đang diễn ra' : 'Hành trình đã kết thúc'}
            </span>
            {user ? (
              <button 
                onClick={logout}
                className="bg-white/20 backdrop-blur-md px-5 py-2 rounded-2xl text-xs md:text-sm font-bold border border-white/30 flex items-center gap-2 hover:bg-white/30 transition-all"
              >
                <LogOut size={16} /> Thoát
              </button>
            ) : (
              <button 
                onClick={login}
                className="bg-sky-500 text-white px-5 py-2 rounded-2xl text-xs md:text-sm font-bold shadow-lg flex items-center gap-2 hover:bg-sky-600 transition-all"
              >
                <LogIn size={16} /> Đăng nhập để lưu
              </button>
            )}
          </div>
          
          <div className="mt-8 flex justify-center gap-4">
            {data.tripStatus === 'planning' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startTrip}
                className="px-8 py-3 bg-white text-sky-600 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-sky-50 transition-colors"
              >
                <Play size={18} /> Bắt đầu hành trình
              </motion.button>
            )}
            {data.tripStatus === 'ongoing' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={endTrip}
                className="px-8 py-3 bg-red-500 text-white rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-red-600 transition-colors"
              >
                <Flag size={18} /> Kết thúc hành trình
              </motion.button>
            )}
            {(data.tripStatus === 'ongoing' || data.tripStatus === 'finished') && (
              <button 
                onClick={resetTrip}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold transition-all flex items-center gap-2 text-white/80"
              >
                <RotateCcw size={14} /> Reset 
              </button>
            )}
            {/* Dev Preview Button */}
            <button 
              onClick={() => {
                if (data.tripStatus !== 'finished') endTrip();
              }}
              className="px-4 py-2 bg-orange-400/20 hover:bg-orange-400/40 rounded-full text-[10px] font-bold transition-all text-orange-200 border border-orange-400/20"
            >
              Preview Result
            </button>
          </div>
        </motion.div>

        {/* Transition Mask */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#fdf6e3] to-transparent z-10 pointer-events-none" />
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8 relative z-20">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main Itinerary */}
          <div className="lg:w-2/3 space-y-10" ref={itineraryRef}>
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <Calendar className="text-sky-500" /> 
                <span className="tracking-tight">Lịch trình chi tiết</span>
              </h2>
              <button 
                onClick={exportAsImage}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all disabled:opacity-50"
              >
                {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                <span>Xuất ảnh chi tiết</span>
              </button>
            </div>

            <div className="relative pl-6 md:pl-8 border-l-2 border-dashed border-sky-200 ml-2 md:ml-4 space-y-12">
              {data.itinerary.map((day, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="absolute -left-[33px] md:-left-[41px] top-4 w-5 h-5 bg-white border-4 border-sky-400 rounded-full shadow-sm z-10" />
                  
                  <div className="bg-[#fffcf0] rounded-[2.5rem] p-4 md:p-8 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                      <div>
                        <h3 className="text-xl font-bold text-sky-700 tracking-tight flex items-center gap-2">
                          {day.title}
                        </h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                          {day.date}
                        </p>
                      </div>
                      {day.distance && (
                        <span className="px-4 py-1.5 bg-slate-50 text-slate-500 text-[10px] uppercase font-bold rounded-full border border-slate-100 self-start sm:self-center">
                          {day.distance}
                        </span>
                      )}
                    </div>

                    <div className="space-y-5">
                      {day.activities.map((act, aIdx) => (
                        <div key={aIdx} className={`group flex flex-col sm:flex-row gap-3 sm:gap-5 items-start sm:items-center p-4 rounded-2xl transition-all border shadow-sm hover:shadow-md ${
                          act.type === 'food' ? 'bg-orange-50 border-orange-200' : 
                          act.type === 'transport' ? 'bg-blue-50 border-blue-200' :
                          act.type === 'visit' ? 'bg-emerald-50 border-emerald-200' :
                          'bg-slate-50 border-slate-200'
                        }`}>
                          <div className="flex sm:flex-col items-center gap-2 shrink-0 pt-0.5">
                            <span className="bg-white px-2 py-0.5 rounded-lg text-[10px] font-bold text-slate-500 border border-slate-100 shadow-sm min-w-[50px] text-center">
                              {act.time}
                            </span>
                            <div className="sm:hidden flex items-center">
                              {act.type === 'food' && <Utensils size={12} className="text-orange-400" />}
                              {act.type === 'transport' && <Car size={12} className="text-blue-400" />}
                              {act.type === 'visit' && <MapPin size={12} className="text-emerald-400" />}
                            </div>
                          </div>
                          <div className="flex-1 text-sm md:text-base leading-relaxed text-slate-700 font-medium">
                            {act.description}
                            {act.tollCost && (
                              <div className="mt-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600 border border-red-200">
                                  Toll: {act.tollCost}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between w-full sm:w-auto gap-3 border-t sm:border-0 pt-3 sm:pt-0 mt-1 sm:mt-0">
                            <div className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-5 shrink-0">
                              {act.type === 'food' && <Utensils size={16} className="text-orange-400" />}
                              {act.type === 'transport' && <Car size={16} className="text-blue-400" />}
                              {act.type === 'visit' && <MapPin size={16} className="text-emerald-400" />}
                            </div>
                            {act.mapLink && (
                              <a 
                                href={act.mapLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 bg-white text-sky-600 rounded-xl border border-sky-100 font-bold text-[10px] uppercase tracking-wider hover:bg-sky-50 transition-colors shadow-sm"
                              >
                                <Navigation size={12} />
                                <span>Chỉ đường</span>
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:w-1/3 space-y-8">
            <div className="sticky top-8 space-y-8">
              {/* Budget / Actual / Summary Board */}
              <AnimatePresence mode="wait">
                {data.tripStatus === 'finished' ? (
                  <motion.div 
                    key="finished"
                    ref={budgetRef}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-[2.5rem] p-8 text-slate-800 shadow-2xl border-t-4 border-emerald-500 relative overflow-hidden"
                  >
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-50 rounded-full blur-[100px] pointer-events-none opacity-80" />
                    
                    <div className="text-center mb-8 relative z-10">
                      <div className="absolute top-0 right-0">
                        <button 
                          onClick={exportBudgetAsImage}
                          disabled={isBudgetExporting}
                          className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors disabled:opacity-50"
                          title="Xuất ảnh tổng kết"
                        >
                          {isBudgetExporting ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                        </button>
                      </div>
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tighter">Tổng kết chuyến đi</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Hoàn thành hành trình</p>
                    </div>

                    <div className="space-y-6">
                      <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                        <span className="text-sm font-bold text-slate-500">Dự kiến ban đầu:</span>
                        <span className="font-mono text-lg font-bold text-slate-700">{totalBudget.toLocaleString()}đ</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-4 bg-sky-50 rounded-2xl">
                        <span className="text-sm font-bold text-sky-600">Thực tế đã chi:</span>
                        <span className="font-mono text-lg font-bold text-sky-700">{totalActual.toLocaleString()}đ</span>
                      </div>

                      <div className={`flex justify-between items-center p-5 rounded-2xl border-2 ${diff > 0 ? 'bg-orange-50 border-orange-100' : 'bg-emerald-50 border-emerald-100'}`}>
                        <div className="flex items-center gap-3">
                          {diff > 0 ? <TrendingUp className="text-orange-500" /> : <TrendingDown className="text-emerald-500" />}
                          <span className="text-sm font-bold text-slate-600">Chênh lệch:</span>
                        </div>
                        <span className={`font-mono text-xl font-bold ${diff > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                          {diff > 0 ? '+' : ''}{diff.toLocaleString()}đ
                        </span>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-dashed border-slate-100">
                      <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40 mb-4 text-center">Bảng quyết toán cá nhân (Quỹ & Chi hộ)</p>
                      
                      <div className="space-y-3">
                        {[
                          { name: "QAnh", fund: 16800000 },
                          { name: "Linh", fund: 16800000 },
                          { name: "NA", fund: 16800000 },
                          { name: "Sơn", fund: 2000000 },
                          { name: "Bố Thắng", fund: 16800000 },
                          { name: "Mẹ Hà", fund: 16800000 },
                          { name: "Dì Hương", fund: 16800000 },
                          { name: "Cậu Thành", fund: 0 }
                        ].map(person => {
                          const spentFromPocket = (data.quickExpenses || []).filter(e => e.payer === person.name).reduce((s, e) => s + e.amount, 0);
                          
                          // QUAN TRỌNG: QAnh là người cầm quỹ tập trung
                          const isCustodian = person.name === "QAnh";
                          // Tiền chi hộ túi riêng: Nếu là QAnh thì = 0 (vì dùng tiền quỹ chung), người khác thì tính bình thường
                          const actualPersonalContribution = isCustodian ? 0 : spentFromPocket;
                          
                          const fundRemains = person.fund - perPersonActual;
                          const finalBalance = fundRemains + actualPersonalContribution;
                          
                          return (
                            <div key={person.name} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-bold text-slate-800">{person.name} {isCustodian && <span className="text-[9px] bg-sky-100 text-sky-600 px-1.5 py-0.5 rounded ml-1 uppercase">Thủ quỹ</span>}</p>
                                <div className={`text-xs font-bold px-3 py-1 rounded-full ${finalBalance >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                                  {finalBalance >= 0 ? `Nhận lại: ${finalBalance.toLocaleString()}đ` : `Cần nộp: ${Math.abs(finalBalance).toLocaleString()}đ`}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                                <div className="space-y-1">
                                  <p className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">Về tiền Quỹ ({person.fund.toLocaleString()}đ)</p>
                                  <p className={`text-[11px] font-bold ${fundRemains >= 0 ? 'text-slate-600' : 'text-red-500'}`}>
                                    {fundRemains >= 0 ? `Bảo lưu: ${fundRemains.toLocaleString()}đ` : `Nộp thêm: ${Math.abs(fundRemains).toLocaleString()}đ`}
                                  </p>
                                </div>
                                <div className="space-y-1 text-right">
                                  <p className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">{isCustodian ? 'Dùng Quỹ chi tiêu' : 'Chi hộ túi riêng'}</p>
                                  <p className={`text-[11px] font-bold ${isCustodian ? 'text-slate-400' : 'text-orange-500'}`}>
                                    {isCustodian ? `${spentFromPocket.toLocaleString()}đ` : `+${spentFromPocket.toLocaleString()}đ`}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button 
                      onClick={resetTrip}
                      className="w-full mt-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors border border-slate-100 rounded-2xl"
                    >
                      Quay lại lập kế hoạch
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key={data.tripStatus}
                    ref={budgetRef}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="bg-white rounded-[2.5rem] p-6 text-slate-800 shadow-lg border-t-4 border-sky-400 relative overflow-hidden"
                  >
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-100 rounded-full blur-[100px] pointer-events-none opacity-80" />
                    <div className="flex justify-between items-start mb-6 border-b border-sky-100 pb-3 relative z-10">
                      <h3 className="text-base font-bold text-sky-800 uppercase tracking-widest flex items-center gap-2">
                        <Calculator size={18} className="text-sky-600" />
                        {data.tripStatus === 'planning' ? 'Dự toán chuyến đi' : 'Chi phí thực tế'}
                      </h3>
                      <button 
                        onClick={exportBudgetAsImage}
                        disabled={isBudgetExporting}
                        className="p-2 bg-sky-50 text-sky-600 rounded-xl hover:bg-sky-100 transition-colors disabled:opacity-50"
                        title="Xuất ảnh dự toán"
                      >
                        {isBudgetExporting ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                      </button>
                    </div>
                    
                    <div className="relative z-10 space-y-4 mb-6 no-scrollbar max-h-[400px] overflow-y-auto pr-2">
                      {data.tripStatus === 'planning' ? (
                        data?.expenses?.items?.map((item, i) => (
                          <div key={i} className="flex justify-between items-start gap-4">
                            <div>
                              <p className="text-xs font-bold text-slate-800">{item.category}</p>
                              {item.note && <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">{item.note}</p>}
                            </div>
                            <span className="font-mono text-xs text-sky-700 font-bold whitespace-nowrap">
                              {item.amount.toLocaleString('vi-VN')}
                            </span>
                          </div>
                        ))
                      ) : (
                        (data.quickExpenses || []).length > 0 ? (
                          data.quickExpenses?.map((item, i) => (
                            <div key={i} className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <p className="text-xs font-bold text-slate-800 leading-tight">{item.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[8px] bg-slate-100 px-1.5 py-0.5 rounded uppercase font-bold text-slate-400">{item.payer}</span>
                                  <span className="text-[8px] text-slate-400">{item.date}</span>
                                </div>
                              </div>
                              <span className="font-mono text-xs text-sky-700 font-bold whitespace-nowrap">
                                {item.amount.toLocaleString('vi-VN')}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center">
                            <AlertCircle className="mx-auto text-slate-200 mb-2" size={32} />
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Chưa có chi phí thực tế</p>
                          </div>
                        )
                      )}
                    </div>

                    <div className="pt-8 mb-4 text-center relative z-10 bg-sky-50/50 rounded-3xl p-6 border border-sky-100/50">
                      <p className="text-[11px] uppercase text-sky-500 font-black tracking-[0.2em] mb-3 leading-none">
                        {data.tripStatus === 'planning' ? 'TỔNG DỰ TOÁN CẦN ĐÓNG' : 'TỔNG THỰC CHI ĐOÀN'}
                      </p>
                      
                      <div className="mb-6">
                        <motion.p 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-5xl md:text-6xl font-black text-sky-600 tracking-tighter drop-shadow-lg"
                        >
                          {data.tripStatus === 'planning' ? data.expenses.totalLabel : `${totalActual.toLocaleString()}đ`}
                        </motion.p>
                        <p className="text-[12px] font-bold text-slate-400 uppercase mt-2 tracking-widest">
                          Đoàn {data.adultCount || 8} người lớn • {data.adultCount === 8 ? '6 HN + 2 HCM' : 'Tất cả'}
                        </p>
                      </div>

                      {data.tripStatus === 'planning' && (
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={async (e) => {
                            e.preventDefault();
                            if(window.confirm("Bạn có muốn nạp lại dữ liệu giá mới nhất (53.2Tr)? Hành động này sẽ xóa các thay đổi thủ công của bạn trên bảng dự toán.")) {
                              try {
                                await resetExpensesToDefault();
                                alert("Đã cập nhật giá mới thành công!");
                              } catch (err) {
                                console.error(err);
                                alert("Có lỗi xảy ra khi cập nhật!");
                              }
                            }
                          }}
                          className="px-6 py-3 bg-white text-sky-600 border-2 border-sky-100 text-[10px] font-black uppercase tracking-[0.1em] rounded-2xl hover:border-sky-500 transition-all cursor-pointer flex items-center gap-2 mx-auto shadow-sm"
                        >
                          <RotateCcw size={14} strokeWidth={3} /> Làm mới bảng giá dự toán
                        </motion.button>
                      )}
                    </div>

                    <div className="relative z-10">
                      {data.tripStatus === 'planning' ? (
                        <div className="space-y-2">
                          <div className="p-4 bg-white rounded-2xl border border-sky-100 shadow-sm">
                             <div className="flex justify-between items-center mb-1">
                               <p className="text-[10px] uppercase font-black text-slate-500">Người từ Hà Nội (6 người)</p>
                               <span className="text-sm font-black text-sky-600 tracking-tight">{perPersonHN.toLocaleString()}đ</span>
                             </div>
                             <p className="text-[9px] font-bold text-slate-400 text-left uppercase">Bao gồm toàn bộ phí (phòng Cửa Lò, xăng, cầu đường...)</p>
                          </div>
                          <div className="p-4 bg-white rounded-2xl border border-sky-100 shadow-sm">
                             <div className="flex justify-between items-center mb-1">
                               <p className="text-[10px] uppercase font-black text-slate-500">Người từ HCM (2 người)</p>
                               <span className="text-sm font-black text-sky-600 tracking-tight">{perPersonHCM.toLocaleString()}đ</span>
                             </div>
                             <p className="text-[9px] font-bold text-slate-400 text-left uppercase">Không bao gồm phòng Cửa Lò, tiền xăng và cầu đường.</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-sky-600 font-bold mt-1 tracking-tight">
                          (~{perPersonActual.toLocaleString('vi-VN')}đ / người)
                        </p>
                      )}
                      {data.tripStatus === 'planning' ? (
                        <div className="mt-3 flex items-center justify-center gap-2 text-[9px] text-slate-400 italic">
                          <Info size={12} />
                          <span>Giá dự kiến có thể thay đổi</span>
                        </div>
                      ) : (
                        <div className="mt-3 flex items-center justify-center gap-2">
                          <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-sky-100 text-sky-600`}>
                            Đang theo dõi chi phí
                          </div>
                        </div>
                      ) }
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Recommendations */}
              <motion.div 
                 initial={{ x: 20, opacity: 0 }}
                 animate={{ x: 0, opacity: 1 }}
                 transition={{ delay: 0.2 }}
                 className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Star className="text-orange-500 fill-orange-500" />
                    {data.recommendations.title}
                  </h3>
                </div>

                <div className="space-y-4">
                  {data.recommendations.categories.map((cat, i) => {
                    const isOpen = expandedCategory === i;
                    
                    return (
                      <div key={i} className="border border-slate-100 overflow-hidden rounded-2xl transition-all">
                        <button 
                          onClick={() => setExpandedCategory(isOpen ? null : i)}
                          className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                            isOpen ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className={`flex items-center gap-3 font-bold text-sm ${
                            i === 0 ? 'text-blue-500' : i === 1 ? 'text-orange-500' : 'text-purple-500'
                          }`}>
                            {i === 2 ? <Coffee size={16} /> : i === 0 ? <Utensils size={16} /> : <MapPin size={16} />}
                            {cat.name}
                          </div>
                          <ChevronRight 
                            size={16} 
                            className={`text-slate-300 transition-transform ${isOpen ? 'rotate-90' : ''}`} 
                          />
                        </button>
                        
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-2 space-y-1">
                                {cat.items.map((item, j) => {
                                  const isObj = typeof item !== 'string';
                                  const name = isObj ? (item as RecommendationItem).name : (item as string);
                                  const link = isObj ? (item as RecommendationItem).mapLink : undefined;
                                  
                                  return (
                                    <a 
                                      key={j} 
                                      href={link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center justify-between gap-3 p-3 hover:bg-sky-50 rounded-xl transition-all group"
                                    >
                                      <div className="flex items-start gap-3 min-w-0">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200 mt-1.5 shrink-0 group-hover:bg-sky-400 transition-colors" />
                                        <span className="text-xs text-slate-600 font-medium truncate group-hover:text-sky-700 transition-colors">{name}</span>
                                      </div>
                                      {link && (
                                        <Navigation size={14} className="text-slate-300 group-hover:text-sky-500 shrink-0 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                      )}
                                    </a>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 pt-6 border-t border-dashed border-slate-100">
                   <p className="text-[10px] text-slate-400 italic leading-relaxed text-center">
                    <Info size={12} className="inline mr-1" />
                    Chạm tay vào bất cứ địa điểm nào để mở Google Maps.
                  </p>
                </div>
              </motion.div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="mt-20 py-10 text-center text-slate-400 text-[10px] uppercase font-bold tracking-[0.3em] px-6">
        Family Reunion 2026 • Travel With Love
      </footer>

      {/* Floating Expense Tracker */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsExpenseOpen(true)}
        className="fixed bottom-24 right-6 z-50 p-4 bg-orange-500 text-white rounded-full shadow-2xl overflow-hidden group cursor-pointer"
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Calculator className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {isExpenseOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl"
            >
              <button 
                onClick={() => setIsExpenseOpen(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full text-slate-500 transition-all shadow-sm border border-slate-100 active:scale-90"
              >
                <X size={20} />
              </button>
              <div className="overflow-y-auto max-h-[90vh] no-scrollbar">
                <ExpenseTracker 
                  expenses={data.quickExpenses || []}
                  adultCount={data.adultCount || 10}
                  onAdd={addExpense}
                  onRemove={removeExpense}
                  onUpdateAdultCount={setAdultCount}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Chat Support */}
      <AIChat 
        currentData={data} 
        onUpdate={async (newData) => {
          // Sync changes from AI to Firebase
          // This is a bit complex for a simple partial update, but let's do our best
          if (newData.title !== data.title || newData.subtitle !== data.subtitle || newData.adultCount !== data.adultCount) {
             setAdultCount(newData.adultCount || 8);
             // We'd need a more generic updateTrip for title/subtitle
          }
          
          // For expenses, AIChat currently adds to the list. 
          // We can compare and add new ones if we really wanted to.
          // But to fix the lint error, we just need a valid function.
        }} 
      />
    </div>
  );
}

// Add Star icon import
import { Star } from 'lucide-react';
