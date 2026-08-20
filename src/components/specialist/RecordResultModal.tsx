import React, { useState } from 'react';
import { Appointment, SessionResult } from '../../types';
import { useApp } from '../../context/AppContext';
import { toPersianDigits } from '../../utils/dateUtils';
import { 
  X, 
  FileText, 
  CheckCircle2, 
  UserX, 
  AlertTriangle, 
  HeartPulse, 
  Award, 
  Calendar, 
  Lock, 
  Stethoscope, 
  Brain, 
  Scale, 
  Scissors, 
  Apple,
  Save,
  History,
  Pill,
  Sparkles
} from 'lucide-react';

interface RecordResultModalProps {
  appointment: Appointment;
  onClose: () => void;
  isInitialNoShow?: boolean;
  onOpenMedicalHistory?: () => void;
}

export const RecordResultModal: React.FC<RecordResultModalProps> = ({
  appointment,
  onClose,
  isInitialNoShow = false,
  onOpenMedicalHistory,
}) => {
  const { recordSessionResult, isDark } = useApp();

  const [isNoShow, setIsNoShow] = useState<boolean>(isInitialNoShow);
  const [diagnosisOrSummary, setDiagnosisOrSummary] = useState<string>(
    appointment.sessionResult?.diagnosisOrSummary || ''
  );
  const [recommendations, setRecommendations] = useState<string>(
    appointment.sessionResult?.recommendations || ''
  );
  const [prescriptionOrAction, setPrescriptionOrAction] = useState<string>(
    appointment.sessionResult?.prescriptionOrAction || ''
  );
  const [privateNotes, setPrivateNotes] = useState<string>(
    appointment.sessionResult?.privateNotes || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isNoShow) {
      const result: SessionResult = {
        diagnosisOrSummary: diagnosisOrSummary.trim() || 'همکار در موعد مقرر مراجعه ننمود و غیبت ثبت گردید.',
        recommendations: 'ثبت در سوابق انضباطی نوبت‌دهی و کسر ۲۵ امتیاز تعهد حضور.',
        recordedAt: new Date().toISOString(),
        attended: false,
      };
      recordSessionResult(appointment.id, result, true);
    } else {
      if (!diagnosisOrSummary.trim()) {
        alert('لطفاً شرح یا نتیجه جلسه را وارد نمایید.');
        return;
      }

      const result: SessionResult = {
        diagnosisOrSummary: diagnosisOrSummary.trim(),
        recommendations: recommendations.trim() || 'مراقبت‌های روتین شغلی و استراحت متناوب حین کار رعایت گردد.',
        prescriptionOrAction: prescriptionOrAction.trim() || undefined,
        privateNotes: privateNotes.trim() || undefined,
        recordedAt: new Date().toISOString(),
        attended: true,
      };
      recordSessionResult(appointment.id, result, false);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border transition-all text-right ${
        isDark 
          ? 'bg-[#121622]/95 border-slate-700/60 backdrop-blur-xl text-slate-100 shadow-black/50' 
          : 'bg-white border-[#E5E5E5] text-[#333333]'
      }`}>
        
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isDark ? 'bg-[#161B28] border-slate-700/50' : 'bg-[#F8F8F8] border-[#E5E5E5]'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#CF2F2F] text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-black text-base sm:text-lg ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                ثبت نتیجه ویزیت و گزارش خدمت
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>
                مراجع: <strong className={isDark ? 'text-white' : 'text-[#333333]'}>{appointment.userName}</strong> (کد پرسنلی: {toPersianDigits(appointment.userPersonnelCode)})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenMedicalHistory && (
              <button
                type="button"
                onClick={onOpenMedicalHistory}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                  isDark
                    ? 'bg-blue-950/50 hover:bg-blue-900/70 text-blue-300 border-blue-800/60'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200'
                }`}
                title="مشاهده سوابق ویزیت‌های قبلی، داروها و پرونده پزشکی این همکار"
              >
                <History className="w-3.5 h-3.5 text-blue-500" />
                <span>سوابق پزشکی</span>
              </button>
            )}

            <button
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isDark 
                  ? 'border-slate-700/60 hover:bg-[#1E2638] text-slate-400 hover:text-white' 
                  : 'border-[#E5E5E5] hover:bg-[#E5E5E5] text-[#6D6E70] hover:text-black'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs sm:text-sm text-right">
          
          {/* Patient Quick Info Bento Tile */}
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 rounded-2xl border text-xs ${
            isDark ? 'bg-[#181F2C] border-slate-700/50' : 'bg-[#F8F8F8] border-[#E5E5E5]'
          }`}>
            <div>
              <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>نام همکار:</span>
              <strong className={`font-bold ${isDark ? 'text-white' : 'text-[#333333]'}`}>{appointment.userName}</strong>
            </div>
            <div>
              <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>واحد سازمانی:</span>
              <span className={`truncate block font-medium ${isDark ? 'text-slate-300' : 'text-[#333333]'}`}>{appointment.userDepartment}</span>
            </div>
            <div>
              <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>زمان نوبت:</span>
              <span className="font-mono text-[#CF2F2F] font-bold">{toPersianDigits(appointment.timeSlot)}</span>
            </div>
            <div>
              <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>کد رهگیری:</span>
              <span className={`font-mono font-bold ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>{appointment.trackingCode}</span>
            </div>
          </div>

          {/* Stated Reason from Employee Bento Tile */}
          <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
            isDark ? 'bg-[#181F2C] border-slate-700/50 text-slate-300' : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#333333]'
          }`}>
            <span className="font-bold text-[#CF2F2F]">علت مراجعه اعلام‌شده توسط همکار:</span> {appointment.userReason}
          </div>

          {/* Attendance Toggle: Attended vs No-Show */}
          <div className="space-y-2">
            <label className={`block font-bold ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>وضعیت حضور همکار در نوبت:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsNoShow(false)}
                className={`p-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  !isNoShow
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                    : isDark
                    ? 'bg-[#181F2C] hover:bg-[#222B3D] text-slate-300 border-slate-700/50'
                    : 'bg-[#F8F8F8] hover:bg-[#F2F2F2] text-[#6D6E70] border-[#E5E5E5]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>حاضر شد و خدمت انجام گرفت</span>
              </button>

              <button
                type="button"
                onClick={() => setIsNoShow(true)}
                className={`p-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isNoShow
                    ? 'bg-[#CF2F2F] text-white border-[#CF2F2F] shadow-md'
                    : isDark
                    ? 'bg-[#181F2C] hover:bg-[#222B3D] text-slate-300 border-slate-700/50'
                    : 'bg-[#F8F8F8] hover:bg-[#F2F2F2] text-[#6D6E70] border-[#E5E5E5]'
                }`}
              >
                <UserX className="w-4 h-4" />
                <span>عدم مراجعه (ثبت غیبت / No-Show)</span>
              </button>
            </div>
          </div>

          {/* IF NO-SHOW */}
          {isNoShow ? (
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? 'bg-rose-950/30 border-rose-800/60' : 'bg-[#FFF9F9] border-[#F5C2C2]'
            }`}>
              <div className="flex items-start gap-2.5 text-[#CF2F2F] text-xs leading-relaxed">
                <AlertTriangle className="w-5 h-5 text-[#CF2F2F] shrink-0 mt-0.5" />
                <div>
                  <strong>اعمال کسر امتیاز انضباطی:</strong> با ثبت عدم حضور، ۲۵ امتیاز از امتیاز خوش‌قولی این همکار کسر شده و یک نوبت غیبت در کارنامه سازمانی ایشان درج خواهد شد.
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#CF2F2F]">
                  توضیحات تکمیلی متخصص در مورد عدم مراجعه:
                </label>
                <textarea
                  rows={3}
                  value={diagnosisOrSummary}
                  onChange={(e) => setDiagnosisOrSummary(e.target.value)}
                  placeholder="مثال: بدون هماهنگی قبلی مراجعه نکردند و تلفن در دسترس نبود..."
                  className={`w-full p-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] ${
                    isDark
                      ? 'bg-[#121622] border-slate-700 text-slate-100 placeholder-slate-500'
                      : 'bg-white border-[#F5C2C2] text-[#333333]'
                  }`}
                />
              </div>
            </div>
          ) : (
            /* IF ATTENDED: FULL CONSULTATION REPORT */
            <div className="space-y-4">
              
              {/* Field 1: Diagnosis / Service Result */}
              <div className="space-y-1.5">
                <label className={`block font-bold text-xs flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                  <HeartPulse className="w-4 h-4 text-[#CF2F2F]" />
                  <span>شرح حال، تشخیص یا شرح خدمات ارائه‌شده *</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={diagnosisOrSummary}
                  onChange={(e) => setDiagnosisOrSummary(e.target.value)}
                  placeholder="شرح کامل معاینه بالینی، تشخیص اولیه، علائم و یا اقدامات مشاوره‌ای انجام‌شده..."
                  className={`w-full p-3 rounded-2xl border text-xs focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] ${
                    isDark
                      ? 'bg-[#181F2C] border-slate-700/60 text-slate-100 placeholder-slate-500'
                      : 'bg-white border-[#E5E5E5] text-[#333333]'
                  }`}
                />
              </div>

              {/* Field 2: Prescription / Action plan */}
              <div className="space-y-1.5">
                <label className={`block font-bold text-xs flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                  <Pill className="w-4 h-4 text-blue-500" />
                  <span>دستور دارو / اقدامات لازم / بندهای حقوقی / خدمات پیرایش:</span>
                </label>
                <textarea
                  rows={2}
                  value={prescriptionOrAction}
                  onChange={(e) => setPrescriptionOrAction(e.target.value)}
                  placeholder="تجویز دارویی، ارجاع به آزمایشگاه، مواد قانونی، یا جزییات خدمت..."
                  className={`w-full p-3 rounded-2xl border text-xs focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] ${
                    isDark
                      ? 'bg-[#181F2C] border-slate-700/60 text-slate-100 placeholder-slate-500'
                      : 'bg-white border-[#E5E5E5] text-[#333333]'
                  }`}
                />
              </div>

              {/* Field 3: Recommendations for Employee */}
              <div className="space-y-1.5">
                <label className={`block font-bold text-xs flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>توصیه‌های خودمراقبتی و ارگونومیک به همکار:</span>
                </label>
                <textarea
                  rows={2}
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  placeholder="توصیه‌های سبک زندگی، ورزش‌های اصلاحی پشت میز، استراحت متناوب، یا تاریخ ویزیت مجدد..."
                  className={`w-full p-3 rounded-2xl border text-xs focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] ${
                    isDark
                      ? 'bg-[#181F2C] border-slate-700/60 text-slate-100 placeholder-slate-500'
                      : 'bg-white border-[#E5E5E5] text-[#333333]'
                  }`}
                />
              </div>

              {/* Field 4: Private Clinical Notes (Confidential) */}
              <div className={`p-4 rounded-2xl border space-y-2 ${
                isDark ? 'bg-[#181F2C] border-slate-700/50' : 'bg-[#FAFAFA] border-[#E5E5E5]'
              }`}>
                <label className="flex items-center gap-2 text-xs font-bold text-[#CF2F2F]">
                  <Lock className="w-4 h-4" />
                  <span>یادداشت محرمانه پزشک / مشاور (غیرقابل مشاهده برای کارمند):</span>
                </label>
                <textarea
                  rows={2}
                  value={privateNotes}
                  onChange={(e) => setPrivateNotes(e.target.value)}
                  placeholder="ملاحظات ویژه پرونده پرسنلی، سوابق قبلی، پیگیری با واحد HSE..."
                  className={`w-full p-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] ${
                    isDark
                      ? 'bg-[#121622] border-slate-700/60 text-slate-100 placeholder-slate-500'
                      : 'bg-white border-[#E5E5E5] text-[#333333]'
                  }`}
                />
                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                  این بخش تنها برای شما و پزشکان معتمد مپنا قابل مشاهده است و در کارتابل پرسنل نمایش داده نمی‌شود.
                </p>
              </div>

            </div>
          )}

          {/* Actions */}
          <div className={`pt-4 border-t flex items-center justify-end gap-3 ${
            isDark ? 'border-slate-700/50' : 'border-[#E5E5E5]'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2.5 rounded-xl border font-bold text-xs transition-colors cursor-pointer ${
                isDark
                  ? 'border-slate-700/60 hover:bg-[#1E2638] text-slate-300'
                  : 'border-[#E5E5E5] hover:bg-[#EAEAEA] text-[#6D6E70]'
              }`}
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#CF2F2F] hover:bg-[#B72424] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>ثبت نهایی و ذخیره پرونده</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
