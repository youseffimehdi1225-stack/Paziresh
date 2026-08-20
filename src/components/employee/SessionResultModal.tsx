import React from 'react';
import { Appointment } from '../../types';
import { useApp } from '../../context/AppContext';
import { toPersianDigits } from '../../utils/dateUtils';
import { 
  X, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  Printer, 
  Award,
  Stethoscope,
  HeartPulse,
  Scale,
  Scissors,
  Brain,
  Apple
} from 'lucide-react';

interface SessionResultModalProps {
  appointment: Appointment;
  onClose: () => void;
}

export const SessionResultModal: React.FC<SessionResultModalProps> = ({ appointment, onClose }) => {
  const { isDark } = useApp();
  const result = appointment.sessionResult;

  const getCategoryIcon = () => {
    switch (appointment.specialistCategory) {
      case 'medical':
        return <Stethoscope className="w-5 h-5 text-emerald-500" />;
      case 'counseling':
        return <Brain className="w-5 h-5 text-blue-500" />;
      case 'legal':
        return <Scale className="w-5 h-5 text-amber-500" />;
      case 'barber':
        return <Scissors className="w-5 h-5 text-purple-500" />;
      case 'nutrition':
      default:
        return <Apple className="w-5 h-5 text-rose-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border transition-all text-right animate-scale-up ${
        isDark 
          ? 'bg-[#121622]/95 border-slate-700/60 backdrop-blur-xl text-slate-100 shadow-black/50' 
          : 'bg-white border-[#E5E5E5] text-[#333333]'
      }`}>
        
        {/* Header with Corporate Brand Letterhead */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isDark ? 'bg-[#161B28] border-slate-700/50' : 'bg-[#F8F8F8] border-[#E5E5E5]'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm ${
              isDark ? 'bg-[#181F2C] border-slate-700/60' : 'bg-white border-[#E5E5E5]'
            }`}>
              {getCategoryIcon()}
            </div>
            <div>
              <h3 className={`font-bold text-base sm:text-lg ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                برگه رسمی گزارش و نتیجه ویزیت سازمانی
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>
                ثبت شده توسط: {appointment.specialistName} • {appointment.specialistRoom}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDark ? 'border-slate-700/60 text-slate-400 hover:text-white hover:bg-[#1E2638]' : 'border-[#E5E5E5] text-[#6D6E70] hover:text-black hover:bg-[#E5E5E5]'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Document */}
        <div className="p-6 space-y-5 text-xs sm:text-sm max-h-[75vh] overflow-y-auto text-right">
          
          {/* Status Badge Bento Tile */}
          <div className={`flex items-center justify-between p-4 rounded-2xl border ${
            isDark ? 'bg-[#181F2C] border-slate-700/60 text-slate-200' : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#333333]'
          }`}>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <span className={`font-bold text-xs sm:text-sm ${isDark ? 'text-white' : 'text-[#333333]'}`}>وضعیت حضور: تایید شده و ویزیت انجام شد</span>
                <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                  امتیاز خوش‌قولی کاربر به روز شده و در سوابق سازمانی ثبت گردید.
                </p>
              </div>
            </div>
            <span className={`font-mono text-xs font-bold px-3 py-1 rounded-lg border shadow-xs ${
              isDark ? 'bg-[#121622] border-slate-700/60 text-amber-400' : 'bg-white border-[#E5E5E5] text-[#333333]'
            }`}>
              کد پیگیری: {appointment.trackingCode}
            </span>
          </div>

          {/* Patient Details Bento Tile */}
          <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl border text-xs ${
            isDark ? 'bg-[#181F2C] border-slate-700/60 text-slate-200' : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#333333]'
          }`}>
            <div>
              <span className={`block mb-0.5 text-[11px] ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>نام مراجع:</span>
              <strong className={`font-bold ${isDark ? 'text-white' : 'text-[#333333]'}`}>{appointment.userName}</strong>
            </div>
            <div>
              <span className={`block mb-0.5 text-[11px] ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>کد پرسنلی:</span>
              <span className={`font-mono font-bold ${isDark ? 'text-amber-400' : 'text-[#333333]'}`}>{toPersianDigits(appointment.userPersonnelCode)}</span>
            </div>
            <div>
              <span className={`block mb-0.5 text-[11px] ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>بخش / شرکت مپنا:</span>
              <span className="font-medium truncate block">{appointment.userDepartment}</span>
            </div>
            <div>
              <span className={`block mb-0.5 text-[11px] ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>تاریخ جلسه:</span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#333333]'}`}>{appointment.dateShamsi}</span>
            </div>
            <div>
              <span className={`block mb-0.5 text-[11px] ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>ساعت ویزیت:</span>
              <span className={`font-mono font-semibold ${isDark ? 'text-amber-400' : 'text-[#333333]'}`}>{toPersianDigits(appointment.timeSlot)}</span>
            </div>
            <div>
              <span className={`block mb-0.5 text-[11px] ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>متخصص معالج:</span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#333333]'}`}>{appointment.specialistName}</span>
            </div>
          </div>

          {/* Section 1: Diagnosis / Session Summary Bento Tile */}
          <div className="space-y-1.5">
            <h4 className={`font-bold flex items-center gap-1.5 text-xs sm:text-sm ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
              <FileText className="w-4 h-4 text-[#CF2F2F]" />
              <span>خلاصه شرح حال، تشخیص یا نتیجه جلسه:</span>
            </h4>
            <div className={`p-4 rounded-2xl border shadow-sm leading-relaxed ${
              isDark ? 'bg-[#181F2C] border-slate-700/60 text-slate-100' : 'bg-white border-[#E5E5E5] text-[#333333]'
            }`}>
              {result?.diagnosisOrSummary || 'شرح حال ثبت نشده است.'}
            </div>
          </div>

          {/* Section 2: Recommendations Bento Tile */}
          <div className="space-y-1.5">
            <h4 className={`font-bold flex items-center gap-1.5 text-xs sm:text-sm ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
              <Award className="w-4 h-4 text-[#CF2F2F]" />
              <span>توصیه‌ها و اقدامات لازم برای همکار:</span>
            </h4>
            <div className={`p-4 rounded-2xl border leading-relaxed ${
              isDark ? 'bg-[#181F2C] border-slate-700/60 text-slate-200' : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#333333]'
            }`}>
              {result?.recommendations || 'مورد خاصی قید نشده است.'}
            </div>
          </div>

          {/* Section 3: Prescription or Actions (if any) */}
          {result?.prescriptionOrAction && (
            <div className="space-y-1.5">
              <h4 className={`font-bold flex items-center gap-1.5 text-xs sm:text-sm ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                <HeartPulse className="w-4 h-4 text-[#CF2F2F]" />
                <span>نسخه دارویی / خدمات یا ارجاع اداری:</span>
              </h4>
              <div className={`p-4 rounded-2xl border leading-relaxed font-medium ${
                isDark ? 'bg-[#181F2C] border-slate-700/60 text-slate-200' : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#333333]'
              }`}>
                {result.prescriptionOrAction}
              </div>
            </div>
          )}

          {/* Official Signature Stamp Bento Tile */}
          <div className={`pt-4 border-t flex items-center justify-between text-xs ${
            isDark ? 'border-slate-700/50 text-slate-400' : 'border-[#E5E5E5] text-[#6D6E70]'
          }`}>
            <div>
              <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>تاییدیه الکترونیکی کلینیک و امور رفاهی مپنا</span>
              <p className="text-[10px] mt-0.5">
                ثبت سامانه در تاریخ: {result?.recordedAt ? new Date(result.recordedAt).toLocaleDateString('fa-IR') : 'معتبر'}
              </p>
            </div>
            
            <div className={`text-left border border-dashed rounded-2xl px-3.5 py-2 font-semibold text-[11px] ${
              isDark ? 'border-rose-500/50 bg-rose-500/10 text-rose-400' : 'border-[#CF2F2F]/40 bg-[#FFF9F9] text-[#CF2F2F]'
            }`}>
              <span>مهر الکترونیکی: {appointment.specialistName}</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between ${
          isDark ? 'bg-[#161B28] border-slate-700/50' : 'bg-[#F8F8F8] border-[#E5E5E5]'
        }`}>
          <button
            onClick={() => window.print()}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isDark ? 'border-slate-700/60 bg-[#181F2C] hover:bg-[#20293A] text-slate-300' : 'border-[#E5E5E5] bg-white hover:bg-[#F8F8F8] text-[#6D6E70]'
            }`}
          >
            <Printer className="w-4 h-4 text-[#CF2F2F]" />
            <span>چاپ گواهی حضور و پرونده</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#CF2F2F] hover:bg-[#B72424] text-white text-xs sm:text-sm font-bold shadow-md transition-colors cursor-pointer"
          >
            بستن
          </button>
        </div>

      </div>
    </div>
  );
};
