import React, { useState } from 'react';
import { useApp, getRoleLabel } from '../context/AppContext';
import { toPersianDigits } from '../utils/dateUtils';
import { MapnaLogo } from './MapnaLogo';
import { 
  Building2, 
  Calendar, 
  UserCheck, 
  ShieldCheck, 
  Stethoscope, 
  Brain, 
  Scale, 
  Scissors, 
  Award, 
  ChevronDown, 
  LogOut, 
  Sparkles, 
  Info, 
  Clock, 
  User as UserIcon, 
  AlertTriangle,
  UserPlus,
  BookmarkCheck
} from 'lucide-react';
import { UserRole } from '../types';
import { ThemeSwitcher } from './common/ThemeSwitcher';

interface NavbarProps {
  onOpenPolicy: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenPolicy }) => {
  const { 
    currentUser, 
    setCurrentUser, 
    users, 
    activeView, 
    setActiveView, 
    appointments, 
    isDark 
  } = useApp();
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchUserQuery, setSearchUserQuery] = useState('');

  // Quick switch user list (curated list of key actors + search)
  const filteredUsers = users
    .filter(
      (u) =>
        u.fullName.includes(searchUserQuery) ||
        u.personnelCode.includes(searchUserQuery) ||
        u.department.includes(searchUserQuery)
    )
    .slice(0, 15);

  const myUpcomingCount = appointments.filter(
    (a) => a.userId === currentUser.id && (a.status === 'confirmed' || a.status === 'in_progress' || a.status === 'pending')
  ).length;

  const isSpecialist = ['doctor', 'counselor', 'lawyer', 'barber', 'nutritionist'].includes(currentUser.role);
  const isAdmin = currentUser.role === 'admin';

  return (
    <header className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
      isDark 
        ? 'bg-[#10141D]/90 text-slate-100 border-slate-800/80 backdrop-blur-xl shadow-lg shadow-black/20' 
        : 'bg-white text-[#333333] border-[#E5E5E5] shadow-xs'
    }`}>
      {/* Top Corporate Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 py-2">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-4">
            <MapnaLogo size="md" />
            <div className={`hidden sm:block border-r pr-4 mr-2 ${isDark ? 'border-slate-800' : 'border-[#E5E5E5]'}`}>
              <div className="flex items-center gap-2">
                <h1 className={`font-extrabold text-base sm:text-lg tracking-tight ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                  سامانه رزرواسیون سازمانی مپنا
                </h1>
                <span className={`hidden md:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                  isDark ? 'bg-[#181F2C] text-slate-300 border border-slate-700/60' : 'bg-[#F2F2F2] text-[#6D6E70]'
                }`}>
                  امور رفاهی و سلامت
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                رزرو نوبت پزشک، مشاور روانشناختی، وکیل و پیرایشگاه کارکنان
              </p>
            </div>
          </div>

          {/* User Profile & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Universal Theme Switcher (Light / Dark Glassmorphism) */}
            <ThemeSwitcher variant="compact" />
            
            {/* Admin/Specialist self-booking quick action button */}
            {(isAdmin || isSpecialist) && (
              <button
                type="button"
                onClick={() => setActiveView('employee')}
                className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border shadow-xs cursor-pointer ${
                  activeView === 'employee'
                    ? 'bg-[#CF2F2F] text-white border-[#CF2F2F]'
                    : isDark
                    ? 'bg-[#181F2C] hover:bg-[#20293A] text-slate-200 border-slate-700/60'
                    : 'bg-[#FFF5F5] hover:bg-[#FFEBEB] text-[#CF2F2F] border-[#F5C2C2]'
                }`}
                title="ثبت نوبت رفاهی و پزشکی برای شخص خودم"
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-[#CF2F2F]" />
                <span>نوبت رفاهی خودم</span>
                {myUpcomingCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                    {toPersianDigits(myUpcomingCount)}
                  </span>
                )}
              </button>
            )}

            {/* Attendance Score Chip for current user */}
            <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
              isDark ? 'bg-[#181F2C]/80 border-slate-700/60' : 'bg-[#F8F8F8] border-[#E5E5E5]'
            }`}>
              <Award className={`w-4 h-4 ${currentUser.attendanceScore >= 80 ? 'text-emerald-500' : currentUser.attendanceScore >= 50 ? 'text-amber-500' : 'text-[#CF2F2F]'}`} />
              <span className={isDark ? 'text-slate-400' : 'text-[#6D6E70]'}>امتیاز خوش‌قولی:</span>
              <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                {toPersianDigits(currentUser.attendanceScore)}٪
              </span>
              {currentUser.noShowCount > 0 && (
                <span className="text-white text-[11px] bg-[#CF2F2F] px-2 py-0.5 rounded-md font-bold">
                  {toPersianDigits(currentUser.noShowCount)} غیبت
                </span>
              )}
            </div>

            {/* Attendance Policy button */}
            <button
              onClick={onOpenPolicy}
              title="قوانین حضور و غیاب نوبت‌ها"
              className={`p-2 sm:px-3 sm:py-2 rounded-xl transition-colors border text-xs flex items-center gap-1.5 font-medium cursor-pointer ${
                isDark
                  ? 'bg-[#181F2C]/80 hover:bg-[#20293A] text-slate-300 border-slate-700/60'
                  : 'bg-white hover:bg-[#F8F8F8] text-[#6D6E70] hover:text-[#333333] border-[#E5E5E5]'
              }`}
            >
              <Info className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`} />
              <span className="hidden md:inline">آیین‌نامه انضباطی</span>
            </button>

            {/* Current User Dropdown & Instant Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border transition-all text-right group cursor-pointer ${
                  isDark
                    ? 'bg-[#181F2C]/80 hover:bg-[#20293A] border-slate-700/60'
                    : 'bg-[#F8F8F8] hover:bg-[#F2F2F2] border-[#E5E5E5]'
                }`}
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="w-8 h-8 rounded-lg object-cover border border-[#CF2F2F]/40"
                  referrerPolicy="no-referrer"
                />
                <div className="hidden sm:block text-right">
                  <div className={`text-xs font-bold transition-colors flex items-center gap-1 ${
                    isDark ? 'text-slate-100 group-hover:text-amber-400' : 'text-[#333333] group-hover:text-[#CF2F2F]'
                  }`}>
                    <span>{currentUser.fullName}</span>
                    {currentUser.isBlockedForNoShow && (
                      <span className="text-white text-[10px] bg-[#CF2F2F] px-1.5 py-0.2 rounded font-bold">مسدود</span>
                    )}
                  </div>
                  <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                    {getRoleLabel(currentUser.role)} • کد: {toPersianDigits(currentUser.personnelCode)}
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 transition-colors ${isDark ? 'text-slate-400 group-hover:text-white' : 'text-[#6D6E70] group-hover:text-[#333333]'}`} />
              </button>

              {/* User Switcher Dropdown Modal */}
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)} 
                  />
                  <div className={`absolute left-0 mt-2 w-80 sm:w-96 rounded-3xl shadow-2xl border z-50 overflow-hidden text-right animate-scale-up ${
                    isDark 
                      ? 'bg-[#121622]/95 border-slate-700/60 backdrop-blur-xl text-slate-100 shadow-black/60' 
                      : 'bg-white border-[#E5E5E5] text-[#333333]'
                  }`}>
                    
                    {/* Header */}
                    <div className={`p-4 border-b ${
                      isDark ? 'bg-[#161B28] border-slate-700/50' : 'bg-[#F8F8F8] border-[#E5E5E5]'
                    }`}>
                      <div className="flex items-center gap-3">
                        <img
                          src={currentUser.avatarUrl}
                          alt={currentUser.fullName}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-[#CF2F2F]"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1">
                          <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-[#333333]'}`}>{currentUser.fullName}</h4>
                          <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>{currentUser.department}</p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-[#6D6E70]">
                            <span className={isDark ? 'text-slate-300' : 'text-[#6D6E70]'}>کد: {toPersianDigits(currentUser.personnelCode)}</span>
                            <span>•</span>
                            <span className="font-semibold text-[#CF2F2F]">{getRoleLabel(currentUser.role)}</span>
                          </div>
                        </div>
                      </div>

                      <div className={`mt-3 pt-2 border-t flex items-center justify-between text-xs ${
                        isDark ? 'border-slate-700/50' : 'border-[#E5E5E5]'
                      }`}>
                        <span className={isDark ? 'text-slate-300' : 'text-[#6D6E70]'}>امتیاز تعهد و حضور:</span>
                        <span className={`font-bold px-2 py-0.5 rounded border ${
                          isDark ? 'bg-[#181F2C] text-white border-slate-700/60' : 'bg-white text-[#333333] border-[#E5E5E5]'
                        }`}>
                          {toPersianDigits(currentUser.attendanceScore)} از ۱۰۰
                        </span>
                      </div>
                    </div>

                    {/* Fast Switch Section for Testing / Role Experience */}
                    <div className={`p-3 border-b ${
                      isDark ? 'bg-[#121622] border-slate-700/50' : 'bg-white border-[#E5E5E5]'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold flex items-center gap-1.5 ${
                          isDark ? 'text-slate-300' : 'text-[#6D6E70]'
                        }`}>
                          <span className="w-1.5 h-3 bg-[#CF2F2F] rounded-full inline-block"></span>
                          تغییر حساب کاربری و نقش (دمو سازمانی)
                        </span>
                        <span className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>از ۱۰۰۰ پرسنل</span>
                      </div>
                      <input
                        type="text"
                        placeholder="جستجوی نام، واحد یا کد پرسنلی..."
                        value={searchUserQuery}
                        onChange={(e) => setSearchUserQuery(e.target.value)}
                        className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] transition-all ${
                          isDark
                            ? 'bg-[#181F2C] border-slate-700/60 text-slate-100 placeholder-slate-500'
                            : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#333333] placeholder-[#6D6E70]'
                        }`}
                      />
                    </div>

                    {/* User list */}
                    <div className={`max-h-64 overflow-y-auto divide-y ${
                      isDark ? 'divide-slate-800/80' : 'divide-[#F2F2F2]'
                    }`}>
                      {filteredUsers.map((u) => {
                        const isSelected = u.id === currentUser.id;
                        return (
                          <button
                            key={u.id}
                            onClick={() => {
                              setCurrentUser(u);
                              setShowUserMenu(false);
                            }}
                            className={`w-full p-3 text-right flex items-center gap-3 transition-colors cursor-pointer ${
                              isSelected
                                ? isDark ? 'bg-[#1C2433] font-bold border-r-2 border-[#CF2F2F]' : 'bg-[#F8F8F8] font-bold border-r-2 border-[#CF2F2F]'
                                : isDark ? 'hover:bg-[#181F2C]' : 'hover:bg-[#F8F8F8]'
                            }`}
                          >
                            <img
                              src={u.avatarUrl}
                              alt={u.fullName}
                              className="w-9 h-9 rounded-xl object-cover border border-[#CF2F2F]/30"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className={`text-xs font-bold truncate ${isDark ? 'text-slate-100' : 'text-[#333333]'}`}>
                                  {u.fullName}
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                  isDark ? 'bg-[#181F2C] text-slate-300' : 'bg-[#F2F2F2] text-[#6D6E70]'
                                }`}>
                                  {toPersianDigits(u.personnelCode)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] mt-0.5">
                                <span className={`truncate max-w-[160px] ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>{u.department}</span>
                                <span className={`font-semibold ${
                                  u.role === 'admin' ? 'text-[#CF2F2F]' :
                                  u.role === 'doctor' ? 'text-emerald-500' :
                                  u.role === 'counselor' ? 'text-blue-500' :
                                  u.role === 'lawyer' ? 'text-amber-500' :
                                  isDark ? 'text-slate-400' : 'text-[#6D6E70]'
                                }`}>
                                  {getRoleLabel(u.role).split(' ')[0]}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <div className={`p-2.5 text-center border-t ${
                      isDark ? 'bg-[#161B28] border-slate-700/50 text-slate-400' : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#6D6E70]'
                    }`}>
                      <p className="text-[11px]">
                        برای بررسی دسترسی‌ها، پزشک، مشاور، وکیل یا ادمین را انتخاب کنید.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>

        {/* Navigation Links Bar */}
        <div className={`flex items-center gap-2 sm:gap-4 overflow-x-auto py-2 border-t scrollbar-none text-xs sm:text-sm font-medium ${
          isDark ? 'border-slate-800' : 'border-[#F2F2F2]'
        }`}>
          
          {/* Employee Booking Tab */}
          <button
            onClick={() => setActiveView('employee')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeView === 'employee'
                ? isDark
                  ? 'text-white font-bold bg-[#CF2F2F] shadow-sm'
                  : 'text-[#CF2F2F] font-bold bg-[#FDF2F2] border border-[#F5C2C2]'
                : isDark
                ? 'text-slate-300 hover:text-white hover:bg-[#181F2C]'
                : 'text-[#6D6E70] hover:text-[#333333] hover:bg-[#F8F8F8]'
            }`}
          >
            <Calendar className={`w-4 h-4 ${activeView === 'employee' ? (isDark ? 'text-white' : 'text-[#CF2F2F]') : 'text-slate-400'}`} />
            <span>رزرو نوبت و خدمات رفاهی</span>
          </button>

          {/* Specialist Workspace Tab (Available for Doctors, Counselors, Lawyers, Barbers or Admin) */}
          {(isSpecialist || currentUser.role === 'admin') && (
            <button
              onClick={() => setActiveView('specialist')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeView === 'specialist'
                  ? isDark
                    ? 'text-white font-bold bg-[#CF2F2F] shadow-sm'
                    : 'text-[#CF2F2F] font-bold bg-[#FDF2F2] border border-[#F5C2C2]'
                  : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-[#181F2C]'
                  : 'text-[#6D6E70] hover:text-[#333333] hover:bg-[#F8F8F8]'
              }`}
            >
              <Stethoscope className={`w-4 h-4 ${activeView === 'specialist' ? (isDark ? 'text-white' : 'text-[#CF2F2F]') : 'text-slate-400'}`} />
              <span>میز کار متخصص ({currentUser.role === 'admin' ? 'پزشک / مشاور' : getRoleLabel(currentUser.role)})</span>
            </button>
          )}

          {/* Admin Management Tab */}
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveView('admin')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeView === 'admin'
                  ? isDark
                    ? 'text-white font-bold bg-[#CF2F2F] shadow-sm'
                    : 'text-[#CF2F2F] font-bold bg-[#FDF2F2] border border-[#F5C2C2]'
                  : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-[#181F2C]'
                  : 'text-[#6D6E70] hover:text-[#333333] hover:bg-[#F8F8F8]'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${activeView === 'admin' ? (isDark ? 'text-white' : 'text-[#CF2F2F]') : 'text-slate-400'}`} />
              <span>مدیریت پرسنلی و نقش‌ها (ادمین)</span>
            </button>
          )}

          {/* View switcher info tag */}
          <div className={`mr-auto hidden md:flex items-center gap-2 text-xs px-3 py-1 rounded-full border ${
            isDark ? 'text-slate-300 bg-[#181F2C] border-slate-700/60' : 'text-[#6D6E70] bg-[#F8F8F8] border-[#E5E5E5]'
          }`}>
            <span className="w-2 h-2 rounded-full bg-[#CF2F2F] animate-pulse"></span>
            <span>نمای فعال: {
              activeView === 'employee' ? 'پرتال کارمندان مپنا' :
              activeView === 'specialist' ? 'میز کار ثبت نتایج و ویزیت' : 'داشبورد مدیریتی منابع انسانی'
            }</span>
          </div>

        </div>
      </div>
    </header>
  );
};
