import React, { useState } from 'react';
import { Appointment, AppointmentStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { toPersianDigits } from '../../utils/dateUtils';
import { SessionResultModal } from './SessionResultModal';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  FileText, 
  Ban, 
  ChevronRight, 
  AlertTriangle, 
  Award,
  Search,
  Filter
} from 'lucide-react';

export const MyAppointments: React.FC = () => {
  const { currentUser, appointments, cancelAppointment, isDark } = useApp();
  const [filterTab, setFilterTab] = useState<'all' | 'upcoming' | 'completed' | 'no_show' | 'cancelled'>('all');
  const [selectedAptForResult, setSelectedAptForResult] = useState<Appointment | null>(null);
  const [cancellingAptId, setCancellingAptId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');

  const userAppointments = appointments.filter((a) => a.userId === currentUser.id);

  const filteredAppointments = userAppointments.filter((a) => {
    if (filterTab === 'upcoming') {
      return a.status === 'confirmed' || a.status === 'in_progress' || a.status === 'pending';
    }
    if (filterTab === 'completed') {
      return a.status === 'completed';
    }
    if (filterTab === 'no_show') {
      return a.status === 'no_show';
    }
    if (filterTab === 'cancelled') {
      return a.status === 'cancelled';
    }
    return true;
  });

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center gap-1 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            در حال ویزیت / مشاوره
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            تایید شده و پیش‌رو
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            در انتظار
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            انجام شد و حاضر
          </span>
        );
      case 'no_show':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            عدم حضور (غیبت)
          </span>
        );
      case 'cancelled':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-400 border border-slate-600/50 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            لغو شده
          </span>
        );
    }
  };

  const handleCancelSubmit = (aptId: string) => {
    if (!cancelReason.trim()) {
      alert('لطفاً دلیل لغو نوبت را بنویسید.');
      return;
    }
    cancelAppointment(aptId, cancelReason.trim());
    setCancellingAptId(null);
    setCancelReason('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Tabs Bento Tile */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl border shadow-md transition-all ${
        isDark 
          ? 'bg-[#121622]/85 border-slate-700/60 backdrop-blur-xl text-slate-100 shadow-black/40' 
          : 'bg-white border-[#E5E5E5] text-[#333333]'
      }`}>
        <div>
          <h2 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#333333]'}`}>
            <span className="w-1.5 h-4 bg-[#CF2F2F] rounded-full inline-block"></span>
            <span>مدیریت و پیگیری نوبت‌های من</span>
          </h2>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
            مشاهده سوابق مراجعات، دریافت توصیه‌های پزشک/مشاور و وضعیت حضور و غیاب
          </p>
        </div>

        {/* Tab Filters */}
        <div className={`flex items-center gap-1.5 overflow-x-auto p-1 rounded-2xl border text-xs ${
          isDark ? 'bg-[#181F2C] border-slate-700/60' : 'bg-[#F8F8F8] border-[#E5E5E5]'
        }`}>
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterTab === 'all' 
                ? isDark ? 'bg-[#222B3D] text-white shadow-xs font-extrabold border border-slate-600/60' : 'bg-white text-[#333333] shadow-xs font-extrabold border border-[#E5E5E5]' 
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-[#6D6E70] hover:text-[#333333]'
            }`}
          >
            همه ({toPersianDigits(userAppointments.length)})
          </button>
          
          <button
            onClick={() => setFilterTab('upcoming')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterTab === 'upcoming' ? 'bg-[#CF2F2F] text-white shadow-xs font-extrabold' : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-[#6D6E70] hover:text-[#333333]'
            }`}
          >
            پیش‌رو ({toPersianDigits(userAppointments.filter((a) => a.status === 'confirmed' || a.status === 'in_progress').length)})
          </button>

          <button
            onClick={() => setFilterTab('completed')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterTab === 'completed' ? isDark ? 'bg-emerald-600 text-white shadow-xs font-extrabold' : 'bg-[#333333] text-white shadow-xs font-extrabold' : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-[#6D6E70] hover:text-[#333333]'
            }`}
          >
            انجام‌شده ({toPersianDigits(userAppointments.filter((a) => a.status === 'completed').length)})
          </button>

          <button
            onClick={() => setFilterTab('no_show')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterTab === 'no_show' ? 'bg-[#CF2F2F] text-white shadow-xs font-extrabold' : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-[#6D6E70] hover:text-[#333333]'
            }`}
          >
            عدم حضور ({toPersianDigits(userAppointments.filter((a) => a.status === 'no_show').length)})
          </button>
        </div>
      </div>

      {/* Appointment Cards List */}
      {filteredAppointments.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border space-y-3 shadow-md transition-all ${
          isDark ? 'bg-[#121622]/85 border-slate-700/60 backdrop-blur-xl text-slate-400' : 'bg-white border-[#E5E5E5] text-[#6D6E70]'
        }`}>
          <Calendar className="w-12 h-12 mx-auto opacity-40 text-slate-400" />
          <h4 className={`font-bold ${isDark ? 'text-white' : 'text-[#333333]'}`}>هیچ نوبتی در این بخش یافت نشد.</h4>
          <p className="text-xs">
            می‌توانید از بخش «رزرو نوبت جدید» برای دریافت وقت از پزشکان، مشاوران یا آرایشگر سازمانی اقدام نمایید.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => {
            const isUpcoming = apt.status === 'confirmed' || apt.status === 'in_progress' || apt.status === 'pending';
            const hasResult = apt.status === 'completed' && apt.sessionResult;

            return (
              <div
                key={apt.id}
                className={`rounded-3xl border transition-all p-5 sm:p-6 shadow-md hover:shadow-lg ${
                  apt.status === 'no_show'
                    ? isDark ? 'border-rose-800/60 bg-[#1A1218]/90' : 'border-rose-200 bg-[#FFF9F9]'
                    : apt.status === 'completed'
                    ? isDark ? 'border-slate-700/60 bg-[#121622]/85' : 'border-[#E5E5E5] bg-white'
                    : isDark ? 'border-slate-700/60 hover:border-[#CF2F2F]/60 bg-[#121622]/85' : 'border-[#E5E5E5] hover:border-[#CF2F2F]/30 bg-white'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left (Main info) */}
                  <div className="space-y-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(apt.status)}
                      <span className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-md border ${
                        isDark ? 'bg-[#181F2C] text-slate-300 border-slate-700/60' : 'bg-[#F8F8F8] text-[#6D6E70] border-[#E5E5E5]'
                      }`}>
                        کد پیگیری: {apt.trackingCode}
                      </span>
                      {apt.penaltyApplied && (
                        <span className="text-[#CF2F2F] text-xs font-bold bg-rose-500/10 px-2.5 py-0.5 rounded-md flex items-center gap-1 border border-rose-500/30">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          کسر ۲۵ امتیاز عدم حضور
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pt-1">
                      <h3 className={`font-bold text-base sm:text-lg ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                        {apt.specialistName}
                      </h3>
                      <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>
                        <MapPin className="w-3.5 h-3.5 text-[#CF2F2F]" />
                        {apt.specialistRoom}
                      </span>
                    </div>

                    <div className={`flex flex-wrap items-center gap-4 text-xs pt-1 ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>
                      <div className="flex items-center gap-1 font-semibold">
                        <Calendar className="w-4 h-4 text-[#CF2F2F]" />
                        <span className={isDark ? 'text-white' : 'text-[#333333]'}>{apt.dateShamsi}</span>
                      </div>
                      <div className={`flex items-center gap-1 font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                        isDark ? 'bg-[#181F2C] text-amber-400 border-slate-700/60' : 'bg-[#F8F8F8] text-[#333333] border-[#E5E5E5]'
                      }`}>
                        <Clock className="w-3.5 h-3.5 text-[#CF2F2F]" />
                        <span>{toPersianDigits(apt.timeSlot)}</span>
                      </div>
                    </div>

                    {/* Reason */}
                    <p className={`text-xs p-3 rounded-2xl border leading-relaxed mt-2 ${
                      isDark ? 'bg-[#181F2C] border-slate-700/50 text-slate-300' : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#6D6E70]'
                    }`}>
                      <strong className={isDark ? 'text-white' : 'text-[#333333]'}>علت مراجعه:</strong> {apt.userReason}
                    </p>

                    {/* If cancelled, show reason */}
                    {apt.cancellationReason && (
                      <p className="text-xs text-rose-400 italic">
                        علت لغو: {apt.cancellationReason}
                      </p>
                    )}
                  </div>

                  {/* Right Action buttons */}
                  <div className={`flex flex-wrap sm:flex-col items-stretch justify-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 ${
                    isDark ? 'border-slate-700/50' : 'border-[#E5E5E5]'
                  }`}>
                    
                    {/* View Doctor / Counselor Result button */}
                    {hasResult && (
                      <button
                        onClick={() => setSelectedAptForResult(apt)}
                        className="px-4 py-2 rounded-xl bg-[#CF2F2F] hover:bg-[#B72424] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                        <span>مشاهده نتیجه و توصیه‌های ویزیت</span>
                      </button>
                    )}

                    {/* If No-Show: Show notice */}
                    {apt.status === 'no_show' && (
                      <div className="text-center p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[#CF2F2F] text-xs">
                        <strong>غیبت بدون اطلاع ثبت شد</strong>
                        <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>امتیاز حضور شما کسر گردید.</p>
                      </div>
                    )}

                    {/* Cancel button if upcoming */}
                    {isUpcoming && (
                      <button
                        onClick={() => setCancellingAptId(apt.id)}
                        className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          isDark 
                            ? 'border-slate-700/60 text-slate-300 hover:bg-rose-500/10 hover:border-rose-500 hover:text-rose-400' 
                            : 'border-[#E5E5E5] hover:bg-[#FFF5F5] hover:border-[#CF2F2F] text-[#6D6E70] hover:text-[#CF2F2F]'
                        }`}
                      >
                        <Ban className="w-4 h-4 text-[#CF2F2F]" />
                        <span>لغو نوبت</span>
                      </button>
                    )}

                  </div>

                </div>

                {/* Cancel Confirmation Prompt Inline */}
                {cancellingAptId === apt.id && (
                  <div className={`mt-4 p-4 rounded-2xl space-y-3 animate-scale-up border ${
                    isDark ? 'bg-[#1C1622] border-rose-800/50' : 'bg-[#FFF9F9] border-[#F5C2C2]'
                  }`}>
                    <div className={`flex items-center gap-2 font-bold text-xs ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                      <AlertTriangle className="w-4 h-4 text-[#CF2F2F]" />
                      <span>آیا از لغو این نوبت اطمینان دارید؟ بازه زمانی به همکار دیگری تعلق خواهد گرفت.</span>
                    </div>
                    <input
                      type="text"
                      placeholder="علت لغو نوبت (مثال: تداخل با جلسه کاری مپنا)..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className={`w-full text-xs p-3 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] transition-all ${
                        isDark 
                          ? 'bg-[#121622] border-slate-700/60 text-slate-100 placeholder-slate-500' 
                          : 'border-[#E5E5E5] bg-white text-[#333333]'
                      }`}
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setCancellingAptId(null)}
                        className={`px-4 py-2 rounded-xl border text-xs font-medium cursor-pointer ${
                          isDark ? 'border-slate-700/60 text-slate-400 hover:bg-[#20293A]' : 'border-[#E5E5E5] text-[#6D6E70] hover:bg-[#F8F8F8]'
                        }`}
                      >
                        انصراف
                      </button>
                      <button
                        onClick={() => handleCancelSubmit(apt.id)}
                        className="px-4 py-2 rounded-xl bg-[#CF2F2F] hover:bg-[#B72424] text-white font-bold text-xs shadow-md cursor-pointer"
                      >
                        تایید و لغو نوبت
                      </button>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Session Result Modal */}
      {selectedAptForResult && (
        <SessionResultModal
          appointment={selectedAptForResult}
          onClose={() => setSelectedAptForResult(null)}
        />
      )}

    </div>
  );
};
