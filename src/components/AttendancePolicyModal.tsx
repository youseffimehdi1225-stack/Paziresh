import React from 'react';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, UserX, Clock, Award, FileText } from 'lucide-react';
import { toPersianDigits } from '../utils/dateUtils';
import { useApp } from '../context/AppContext';

interface AttendancePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AttendancePolicyModal: React.FC<AttendancePolicyModalProps> = ({ isOpen, onClose }) => {
  const { isDark } = useApp();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border transition-all text-right animate-scale-up ${
        isDark 
          ? 'bg-[#121622]/95 border-slate-700/60 backdrop-blur-xl text-slate-100 shadow-black/50' 
          : 'bg-white border-[#E5E5E5] text-[#333333]'
      }`}>
        
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isDark ? 'bg-[#161B28] border-slate-700/50' : 'bg-[#F8F8F8] border-[#E5E5E5]'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm ${
              isDark ? 'bg-[#181F2C] border-slate-700/60 text-[#CF2F2F]' : 'bg-white border-[#E5E5E5] text-[#CF2F2F]'
            }`}>
              <ShieldAlert className="w-5 h-5 text-[#CF2F2F]" />
            </div>
            <div>
              <h3 className={`font-bold text-base sm:text-lg ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                آیین‌نامه انضباطی نوبت‌دهی و تعهد حضور سازمانی
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                مدیریت منابع انسانی و امور رفاهی گروه مپنا
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

        {/* Content */}
        <div className="p-6 space-y-5 text-sm max-h-[75vh] overflow-y-auto text-right">
          
          {/* Motivation Callout Bento Tile */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
            isDark ? 'bg-[#181F2C] border-slate-700/60' : 'bg-[#F8F8F8] border-[#E5E5E5]'
          }`}>
            <AlertTriangle className="w-5 h-5 text-[#CF2F2F] shrink-0 mt-0.5" />
            <div className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-[#333333]'}`}>
              <strong className={`font-bold block mb-1 ${isDark ? 'text-white' : 'text-[#333333]'}`}>چرا ثبت حضور و عدم غیبت حیاتی است؟</strong>
              با توجه به محدودیت ظرفیت زمانی پزشکان، روانشناسان، وکلا و پیرایشگران سازمانی و وجود بیش از ۱۰۰۰ پرسنل در ستاد و شرکت‌های تابعه مپنا، رزرو نوبت و عدم مراجعه موجب تضییع وقت متخصص و محروم ماندن سایر همکاران نیازمند خدمات می‌گردد.
            </div>
          </div>

          {/* Scoring Rules Bento Tiles */}
          <div className="space-y-3">
            <h4 className={`font-bold flex items-center gap-2 text-xs sm:text-sm ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
              <Award className="w-4 h-4 text-[#CF2F2F]" />
              <span>قوانین امتیاز خوش‌قولی (Attendance Score)</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-[#181F2C] border-slate-700/60' : 'bg-[#F8F8F8] border-[#E5E5E5]'
              }`}>
                <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  حضور به موقع در نوبت
                </div>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>
                  امتیاز پایه ۱۰۰؛ با هر حضور موفقیت‌آمیز و ثبت نتیجه توسط پزشک/مشاور، امتیاز کاربر در بالاترین سطح حفظ یا ارتقا می‌یابد.
                </p>
              </div>

              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-[#181F2C] border-slate-700/60' : 'bg-[#F8F8F8] border-[#E5E5E5]'
              }`}>
                <div className="flex items-center gap-2 text-[#CF2F2F] font-bold text-xs mb-1">
                  <UserX className="w-4 h-4 text-[#CF2F2F]" />
                  عدم حضور (No-Show)
                </div>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>
                  در صورت عدم مراجعه و ثبت غیبت توسط متخصص، <span className="font-bold text-[#CF2F2F]">۲۵ امتیاز کسر</span> می‌گردد.
                </p>
              </div>
            </div>
          </div>

          {/* Penalty & Blocking Policy Bento Tile */}
          <div className={`p-4 rounded-2xl border space-y-2 ${
            isDark ? 'bg-rose-950/30 border-rose-800/60' : 'bg-[#FFF9F9] border-[#F5C2C2]'
          }`}>
            <div className="flex items-center gap-2 text-[#CF2F2F] font-bold text-xs sm:text-sm">
              <ShieldAlert className="w-4 h-4 text-[#CF2F2F]" />
              محرومیت پس از ۳ بار غیبت متوالی
            </div>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>
              کاربرانی که تعداد غیبت‌های ثبت‌شده آنان به ۳ بار برسد، به صورت سیستمی در لیست مسدودیت موقت قرار گرفته و امکان رزرو نوبت جدید تا زمان مراجعه به مدیریت منابع انسانی و رفع مسدودی نخواهند داشت.
            </p>
          </div>

          {/* How to Cancel Bento Tile */}
          <div className={`space-y-2 p-4 rounded-2xl border ${
            isDark ? 'bg-[#181F2C] border-slate-700/60' : 'bg-[#F8F8F8] border-[#E5E5E5]'
          }`}>
            <h4 className={`font-bold flex items-center gap-2 text-xs sm:text-sm ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
              <Clock className="w-4 h-4 text-[#CF2F2F]" />
              <span>نحوه لغو مجاز نوبت</span>
            </h4>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>
              چنانچه امکان حضور در موعد مقرر برای شما مقدور نیست، حتماً حداقل <strong className={isDark ? 'text-white' : 'text-[#333333]'}>۲ ساعت پیش از موعد</strong> از طریق بخش «نوبت‌های من» اقدام به لغو نوبت فرمایید تا بازه زمانی آزاد شده و به دیگر همکاران اختصاص یابد. لغو به موقع هیچ‌گونه نمره منفی نخواهد داشت.
            </p>
          </div>

          {/* Session Summary & Certifications Bento Tile */}
          <div className={`space-y-2 p-4 rounded-2xl border ${
            isDark ? 'bg-[#181F2C] border-slate-700/60' : 'bg-[#F8F8F8] border-[#E5E5E5]'
          }`}>
            <h4 className={`font-bold flex items-center gap-2 text-xs sm:text-sm ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
              <FileText className="w-4 h-4 text-[#CF2F2F]" />
              <span>ثبت نتایج و گواهی مراجعه</span>
            </h4>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>
              پس از پایان جلسه، خلاصه توصیه‌ها، نسخه‌ها یا مشاوره‌های انجام‌شده توسط متخصص در کارتابل شما ثبت شده و می‌توانید گواهی رسمی مراجعه به بهداری یا مشاوره را دریافت و چاپ نمایید.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex justify-end ${
          isDark ? 'bg-[#161B28] border-slate-700/50' : 'bg-[#F8F8F8] border-[#E5E5E5]'
        }`}>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#CF2F2F] hover:bg-[#B72424] text-white font-bold text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
          >
            متوجه شدم و می‌پذیرم
          </button>
        </div>

      </div>
    </div>
  );
};
