import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../data/mockData';
import { SpecialistCard } from './SpecialistCard';
import { BookingModal } from './BookingModal';
import { MyAppointments } from './MyAppointments';
import { Specialist, SpecialistCategory } from '../../types';
import { toPersianDigits } from '../../utils/dateUtils';
import { 
  Search, 
  Calendar, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  HeartHandshake, 
  Clock, 
  Building2, 
  Stethoscope, 
  Brain, 
  Scale, 
  Scissors, 
  Apple,
  Filter,
  UserCheck
} from 'lucide-react';

interface EmployeeBookingViewProps {
  onOpenPolicy: () => void;
}

export const EmployeeBookingView: React.FC<EmployeeBookingViewProps> = ({ onOpenPolicy }) => {
  const { 
    currentUser, 
    specialists, 
    appointments, 
    selectedSpecialistForBooking, 
    setSelectedSpecialistForBooking,
    isDark
  } = useApp();

  const [activeTab, setActiveTab] = useState<'book_services' | 'my_appointments'>('book_services');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const upcomingCount = appointments.filter(
    (a) => a.userId === currentUser.id && (a.status === 'confirmed' || a.status === 'in_progress')
  ).length;

  const completedCount = appointments.filter(
    (a) => a.userId === currentUser.id && a.status === 'completed'
  ).length;

  // Filter specialists
  const filteredSpecialists = specialists.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch =
      s.fullName.includes(searchQuery) ||
      s.title.includes(searchQuery) ||
      s.specialty.includes(searchQuery) ||
      s.roomNumber.includes(searchQuery);

    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'medical':
        return <Stethoscope className="w-4 h-4" />;
      case 'counseling':
        return <Brain className="w-4 h-4" />;
      case 'legal':
        return <Scale className="w-4 h-4" />;
      case 'barber':
        return <Scissors className="w-4 h-4" />;
      case 'nutrition':
      default:
        return <Apple className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Bento Grid Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Main Welcome Hero Bento Tile (8 cols) */}
        <div className={`lg:col-span-8 rounded-3xl p-6 sm:p-8 shadow-md border flex flex-col justify-between relative overflow-hidden transition-all ${
          isDark 
            ? 'bg-gradient-to-br from-[#161B28]/95 via-[#182030]/85 to-[#121622]/95 border-slate-700/60 backdrop-blur-xl text-slate-100 shadow-black/40' 
            : 'bg-[#F8F8F8] text-[#333333] border-[#E5E5E5] shadow-xs'
        }`}>
          {/* Subtle background brand imprint */}
          <div className={`absolute -left-6 -bottom-6 opacity-5 pointer-events-none text-8xl font-black font-mono select-none ${
            isDark ? 'text-white' : 'text-[#6D6E70]'
          }`}>
            MAPNA
          </div>

          <div className="relative z-10 space-y-3">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-semibold border ${
              isDark ? 'bg-[#121622]/80 border-slate-700/60 text-slate-300' : 'bg-white border-[#E5E5E5] text-[#6D6E70]'
            }`}>
              <span className="w-2 h-2 rounded-full bg-[#CF2F2F] animate-pulse"></span>
              <span>پرتال خدمات سلامت، مشاوره و رفاهی مپنا</span>
            </div>
            
            <h1 className={`text-xl sm:text-2xl lg:text-3xl font-extrabold leading-tight ${
              isDark ? 'text-white' : 'text-[#333333]'
            }`}>
              درود بر شما، {currentUser.fullName}
            </h1>
            
            <p className={`text-xs sm:text-sm leading-relaxed max-w-xl ${
              isDark ? 'text-slate-300' : 'text-[#6D6E70]'
            }`}>
              امکان رزرو نوبت حضوری پزشک، روانشناس، وکیل پایه یک و پیرایشگر در ساختمان‌های ستاد و شرکت‌های تابعه مپنا فراهم می‌باشد.
            </p>
          </div>

          {/* Quick Tab Selector inside Hero Tile */}
          <div className={`relative z-10 flex flex-wrap items-center gap-2.5 mt-6 pt-5 border-t ${
            isDark ? 'border-slate-700/50' : 'border-[#E5E5E5]'
          }`}>
            <button
              onClick={() => setActiveTab('book_services')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'book_services'
                  ? 'bg-[#CF2F2F] text-white shadow-md font-extrabold'
                  : isDark
                  ? 'bg-[#181F2C] hover:bg-[#20293A] text-slate-300 border border-slate-700/60'
                  : 'bg-white hover:bg-[#F2F2F2] text-[#6D6E70] border border-[#E5E5E5]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>رزرو نوبت جدید از متخصصین ({toPersianDigits(specialists.length)})</span>
            </button>

            <button
              onClick={() => setActiveTab('my_appointments')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'my_appointments'
                  ? 'bg-[#CF2F2F] text-white shadow-md font-extrabold'
                  : isDark
                  ? 'bg-[#181F2C] hover:bg-[#20293A] text-slate-300 border border-slate-700/60'
                  : 'bg-white hover:bg-[#F2F2F2] text-[#6D6E70] border border-[#E5E5E5]'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>نوبت‌های من</span>
              {upcomingCount > 0 && (
                <span className={`w-5 h-5 rounded-full text-xs font-black flex items-center justify-center font-mono ${
                  activeTab === 'my_appointments' ? 'bg-white text-[#CF2F2F]' : 'bg-[#CF2F2F] text-white'
                }`}>
                  {toPersianDigits(upcomingCount)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* User Attendance Reputation Bento Tile (4 cols) */}
        <div className={`lg:col-span-4 rounded-3xl p-6 shadow-md border flex flex-col justify-between space-y-4 transition-all ${
          isDark 
            ? 'bg-[#121622]/85 border-slate-700/60 backdrop-blur-xl text-slate-100 shadow-black/40' 
            : 'bg-white border-[#E5E5E5] text-[#333333]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>
              <span className="w-1.5 h-4 bg-[#CF2F2F] rounded-full inline-block"></span>
              شاخص خوش‌قولی و انضباط
            </span>
            <button
              onClick={onOpenPolicy}
              className="text-[11px] font-bold text-[#CF2F2F] hover:underline cursor-pointer"
            >
              آیین‌نامه
            </button>
          </div>

          <div className="flex items-center gap-4 my-auto">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-xl border ${
              currentUser.attendanceScore >= 80
                ? isDark
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400 font-mono'
                  : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#333333]'
                : currentUser.attendanceScore >= 50
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-500 font-mono'
                : 'bg-rose-500/10 border-rose-500/40 text-[#CF2F2F] font-mono'
            }`}>
              {toPersianDigits(currentUser.attendanceScore)}٪
            </div>
            
            <div className="text-xs space-y-1">
              <strong className={`block font-bold text-sm ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                {currentUser.attendanceScore >= 80 ? 'کاربر متعهد و منظم' : currentUser.attendanceScore >= 50 ? 'نیازمند دقت بیشتر' : 'در آستانه مسدودیت'}
              </strong>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                {toPersianDigits(currentUser.noShowCount)} غیبت ثبت‌شده در سوابق
              </p>
            </div>
          </div>

          {/* Blocked alert or summary */}
          {currentUser.isBlockedForNoShow ? (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-[#CF2F2F] text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#CF2F2F] shrink-0" />
              <span>حساب به دلیل ۳ غیبت مسدود است.</span>
            </div>
          ) : (
            <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
              isDark ? 'bg-[#181F2C] border-slate-700/60 text-slate-300' : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#6D6E70]'
            }`}>
              <span>وضعیت حساب کاربری:</span>
              <span className="font-bold text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                فعال و مجاز به رزرو
              </span>
            </div>
          )}
        </div>

      </div>

      {/* VIEW 1: BOOK SERVICES / SPECIALIST DIRECTORY */}
      {activeTab === 'book_services' && (
        <div className="space-y-6">
          
          {/* Bento Filter Bar & Search Tile */}
          <div className={`p-5 rounded-3xl border shadow-md space-y-4 transition-all ${
            isDark 
              ? 'bg-[#121622]/85 border-slate-700/60 backdrop-blur-xl text-slate-100 shadow-black/40' 
              : 'bg-white border-[#E5E5E5] text-[#333333]'
          }`}>
            
            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              <input
                type="text"
                placeholder="جستجو بر اساس نام پزشک، مشاور، وکیل، تخصص یا اتاق استقرار در مپنا..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full text-xs sm:text-sm pr-10 pl-4 py-2.5 rounded-2xl border focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] transition-all ${
                  isDark
                    ? 'bg-[#181F2C] border-slate-700/60 text-slate-100 placeholder-slate-500'
                    : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#333333] placeholder-[#6D6E70]'
                }`}
              />
            </div>

            {/* Category Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-2xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#CF2F2F] text-white shadow-xs font-extrabold'
                    : isDark
                    ? 'bg-[#181F2C] hover:bg-[#20293A] text-slate-300 border border-slate-700/60'
                    : 'bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#6D6E70]'
                }`}
              >
                همه خدمات سازمانی ({toPersianDigits(specialists.length)})
              </button>

              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const count = specialists.filter((s) => s.category === cat.id).length;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-2xl font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#CF2F2F] text-white shadow-xs font-bold'
                        : isDark
                        ? 'bg-[#181F2C] hover:bg-[#20293A] text-slate-300 border border-slate-700/60'
                        : 'bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#6D6E70]'
                    }`}
                  >
                    {getCategoryIcon(cat.id)}
                    <span>{cat.title}</span>
                    <span className="text-[10px] opacity-80 font-mono">({toPersianDigits(count)})</span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Specialists Bento Grid */}
          {filteredSpecialists.length === 0 ? (
            <div className={`p-12 text-center rounded-3xl border space-y-3 shadow-md transition-all ${
              isDark ? 'bg-[#121622]/85 border-slate-700/60 backdrop-blur-xl text-slate-300' : 'bg-white border-[#E5E5E5] text-[#6D6E70]'
            }`}>
              <Search className="w-12 h-12 text-slate-400 mx-auto opacity-50" />
              <h4 className={`font-bold ${isDark ? 'text-white' : 'text-[#333333]'}`}>هیچ متخصصی مطابق جستجوی شما یافت نشد.</h4>
              <p className="text-xs">
                لطفاً عبارت جستجو یا دسته‌بندی انتخابی را تغییر دهید.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSpecialists.map((spec) => (
                <SpecialistCard
                  key={spec.id}
                  specialist={spec}
                  onBook={(s) => setSelectedSpecialistForBooking(s)}
                />
              ))}
            </div>
          )}

        </div>
      )}

      {/* VIEW 2: MY APPOINTMENTS */}
      {activeTab === 'my_appointments' && (
        <MyAppointments />
      )}

      {/* Booking Modal */}
      {selectedSpecialistForBooking && (
        <BookingModal
          specialist={selectedSpecialistForBooking}
          onClose={() => setSelectedSpecialistForBooking(null)}
        />
      )}

    </div>
  );
};
