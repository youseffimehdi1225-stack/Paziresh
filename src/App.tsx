import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { AttendancePolicyModal } from './components/AttendancePolicyModal';
import { EmployeeBookingView } from './components/employee/EmployeeBookingView';
import { SpecialistWorkspace } from './components/specialist/SpecialistWorkspace';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { MapnaLogo } from './components/MapnaLogo';
import { 
  Building2, 
  HeartHandshake, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  Info,
  Calendar,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { toPersianDigits } from './utils/dateUtils';

const MainContent: React.FC = () => {
  const { activeView, isDark } = useApp();
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col font-['Vazirmatn',sans-serif] transition-colors duration-300 relative ${
      isDark ? 'bg-[#0B0F17] text-slate-100 dark selection:bg-[#CF2F2F] selection:text-white' : 'bg-[#FAFBFD] text-[#333333]'
    }`}>
      
      {/* Subtle Atmospheric Backdrop in Dark Mode */}
      {isDark && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
          <div className="absolute -top-40 right-1/4 w-96 h-96 bg-[#CF2F2F]/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        </div>
      )}

      {/* Top Corporate Navbar */}
      <div className="relative z-30">
        <Navbar onOpenPolicy={() => setIsPolicyOpen(true)} />
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {activeView === 'employee' && (
          <EmployeeBookingView onOpenPolicy={() => setIsPolicyOpen(true)} />
        )}
        {activeView === 'specialist' && (
          <SpecialistWorkspace />
        )}
        {activeView === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Corporate Footer (Glassmorphic in dark mode) */}
      <footer className={`text-xs border-t mt-16 py-10 transition-colors duration-300 relative z-10 ${
        isDark 
          ? 'bg-[#10141D]/90 text-slate-400 border-slate-800/80 backdrop-blur-md' 
          : 'bg-[#F8F8F8] text-[#6D6E70] border-[#E5E5E5]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className={`flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b ${
            isDark ? 'border-slate-800' : 'border-[#E5E5E5]'
          }`}>
            
            <div className="flex items-center gap-4">
              <MapnaLogo size="sm" />
              <div className={`border-r pr-4 ${isDark ? 'border-slate-700' : 'border-[#E5E5E5]'}`}>
                <h4 className={`font-bold text-xs sm:text-sm ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                  سامانه جامع خدمات رفاهی، سلامت و مشاوره‌ای گروه مپنا
                </h4>
                <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                  معاونت منابع انسانی و پشتیبانی • مدیریت امور رفاهی و سلامت کارکنان
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <button
                onClick={() => setIsPolicyOpen(true)}
                className={`transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-rose-400' : 'text-[#6D6E70] hover:text-[#CF2F2F]'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>آیین‌نامه انضباطی نوبت‌دهی</span>
              </button>
              <span>•</span>
              <div className={`flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                <Phone className="w-3.5 h-3.5 text-[#CF2F2F]" />
                <span>داخلی پشتیبانی و درمانگاه: <strong className={`font-mono ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>{toPersianDigits('4200')}</strong></span>
              </div>
            </div>

          </div>

          <div className={`flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] ${
            isDark ? 'text-slate-400' : 'text-[#6D6E70]'
          }`}>
            <p>
              کلیه حقوق این سامانه متعلق به <strong className={isDark ? 'text-slate-200' : 'text-[#333333]'}>گروه مپنا (MAPNA Group)</strong> می‌باشد.
            </p>
            <p className="font-mono">
              نسخه سازمانی ۲.۶ • پایگاه پرسنلی ۱۰۰۰ کاربر
            </p>
          </div>
        </div>
      </footer>

      {/* Global Modals & Toasts */}
      <Toast />
      <AttendancePolicyModal
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
