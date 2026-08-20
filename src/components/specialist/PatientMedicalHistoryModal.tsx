import React, { useState } from 'react';
import { Appointment, SpecialistCategory, User } from '../../types';
import { useApp } from '../../context/AppContext';
import { toPersianDigits } from '../../utils/dateUtils';
import { 
  X, 
  FileText, 
  Stethoscope, 
  Brain, 
  Scale, 
  Scissors, 
  Apple, 
  Calendar, 
  Clock, 
  User as UserIcon, 
  Phone, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Pill, 
  HeartPulse, 
  Printer, 
  Search, 
  Filter, 
  Award,
  ChevronDown,
  ChevronUp,
  History,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';

interface PatientMedicalHistoryModalProps {
  userId: string;
  userName?: string;
  userPersonnelCode?: string;
  onClose: () => void;
  highlightAptId?: string;
}

export const PatientMedicalHistoryModal: React.FC<PatientMedicalHistoryModalProps> = ({
  userId,
  userName,
  userPersonnelCode,
  onClose,
  highlightAptId,
}) => {
  const { appointments, users, isDark } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAptId, setExpandedAptId] = useState<string | null>(highlightAptId || null);

  // Find the user profile from users list
  const patientUser = users.find((u) => u.id === userId || u.personnelCode === userPersonnelCode);

  // Get all appointments for this patient across all history
  const patientAppointments = appointments
    .filter((a) => a.userId === userId || (userPersonnelCode && a.userPersonnelCode === userPersonnelCode))
    .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());

  // Filter by category and search term
  const filteredAppointments = patientAppointments.filter((a) => {
    const matchesCategory = selectedCategory === 'all' || a.specialistCategory === selectedCategory;
    const matchesSearch =
      a.specialistName.includes(searchTerm) ||
      a.userReason.includes(searchTerm) ||
      (a.sessionResult?.diagnosisOrSummary && a.sessionResult.diagnosisOrSummary.includes(searchTerm)) ||
      (a.sessionResult?.prescriptionOrAction && a.sessionResult.prescriptionOrAction.includes(searchTerm)) ||
      (a.sessionResult?.recommendations && a.sessionResult.recommendations.includes(searchTerm)) ||
      a.dateShamsi.includes(searchTerm);

    return matchesCategory && matchesSearch;
  });

  // Calculate Medical Profile Metrics
  const totalVisits = patientAppointments.length;
  const completedVisits = patientAppointments.filter((a) => a.status === 'completed').length;
  const noShowCount = patientAppointments.filter((a) => a.status === 'no_show').length;
  const medicalVisits = patientAppointments.filter((a) => a.specialistCategory === 'medical' && a.status === 'completed').length;
  const counselingVisits = patientAppointments.filter((a) => a.specialistCategory === 'counseling' && a.status === 'completed').length;

  const lastVisit = patientAppointments.find((a) => a.status === 'completed');

  const getCategoryIcon = (category: SpecialistCategory) => {
    switch (category) {
      case 'medical':
        return <Stethoscope className="w-4 h-4 text-emerald-500" />;
      case 'counseling':
        return <Brain className="w-4 h-4 text-blue-500" />;
      case 'legal':
        return <Scale className="w-4 h-4 text-amber-500" />;
      case 'barber':
        return <Scissors className="w-4 h-4 text-purple-500" />;
      case 'nutrition':
      default:
        return <Apple className="w-4 h-4 text-rose-500" />;
    }
  };

  const getCategoryLabel = (category: SpecialistCategory) => {
    switch (category) {
      case 'medical':
        return 'پزشکی و سلامت سازمانی';
      case 'counseling':
        return 'مشاوره روانشناختی و فردی';
      case 'legal':
        return 'مشاوره حقوقی';
      case 'barber':
        return 'پیرایش و آراستگی';
      case 'nutrition':
      default:
        return 'مشاوره تغذیه و رژیم';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const displayName = patientUser?.fullName || userName || 'مراجع محترم مپنا';
  const displayPersonnelCode = patientUser?.personnelCode || userPersonnelCode || '---';
  const displayDept = patientUser?.department || (patientAppointments[0]?.userDepartment) || 'واحدهای تابعه مپنا';
  const displayPhone = patientUser?.phone || (patientAppointments[0]?.userPhone) || '---';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div 
        className={`w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border transition-all my-6 text-right flex flex-col max-h-[90vh] ${
          isDark 
            ? 'bg-[#121622]/95 border-slate-700/60 backdrop-blur-xl text-slate-100 shadow-black/60' 
            : 'bg-white border-[#E5E5E5] text-[#333333]'
        }`}
      >
        
        {/* Header Bar */}
        <div 
          className={`p-5 sm:p-6 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'bg-[#161B28]/90 border-slate-700/50' : 'bg-[#F8F8F8] border-[#E5E5E5]'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#CF2F2F] text-white flex items-center justify-center shrink-0 shadow-md">
              <History className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base sm:text-lg font-black ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                  پرونده جامع سلامت و سوابق مراجعات مراجع
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#CF2F2F] text-white font-mono">
                  Medical Record
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>
                مشاهده شرح‌حال، تشخیص‌های قبلی، نسخه‌های دارویی، توصیه‌ها و آمار مراجعات همکار
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                isDark 
                  ? 'bg-[#1C2333] hover:bg-[#252E42] border-slate-700/60 text-slate-200' 
                  : 'bg-white hover:bg-[#F2F2F2] border-[#E5E5E5] text-[#6D6E70] hover:text-black'
              }`}
              title="چاپ یا ذخیره نسخه چاپی پرونده"
            >
              <Printer className="w-4 h-4 text-[#CF2F2F]" />
              <span className="hidden sm:inline">چاپ سوابق (Print)</span>
            </button>

            <button
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? 'border-slate-700/60 hover:bg-[#222B3D] text-slate-400 hover:text-white'
                  : 'border-[#E5E5E5] hover:bg-[#E5E5E5] text-[#6D6E70] hover:text-black'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Scrollable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Patient Overview Bento Card */}
          <div 
            className={`p-5 rounded-2xl border transition-all ${
              isDark 
                ? 'bg-[#181F2C]/80 border-slate-700/60 shadow-lg' 
                : 'bg-[#FAFAFA] border-[#E5E5E5]'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              
              {/* Patient Basic Info */}
              <div className="flex items-center gap-4">
                <img
                  src={patientUser?.avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`}
                  alt={displayName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#CF2F2F] shadow-sm shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-lg sm:text-xl font-extrabold ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                      {displayName}
                    </h4>
                    {patientUser?.isBlockedForNoShow && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-600 text-white">
                        مسدود نوبت‌دهی (غیبت مکرر)
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span className={`font-mono font-bold ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>
                      کد پرسنلی: <strong className={isDark ? 'text-amber-400' : 'text-[#333333]'}>{toPersianDigits(displayPersonnelCode)}</strong>
                    </span>
                    <span>•</span>
                    <span className={isDark ? 'text-slate-300' : 'text-[#6D6E70]'}>
                      واحد سازمانی: <strong className={isDark ? 'text-slate-100' : 'text-[#333333]'}>{displayDept}</strong>
                    </span>
                    <span>•</span>
                    <span className={`font-mono ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>
                      تلفن: {displayPhone}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <span className="text-[#6D6E70]">شاخص خوش‌قولی و تعهد:</span>
                    <span className="font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      {toPersianDigits(patientUser?.attendanceScore || 95)}٪ تعهد به نوبت‌ها
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Health Stats 4-Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
                
                <div className={`p-3 rounded-xl border text-center ${
                  isDark ? 'bg-[#121622] border-slate-700/50' : 'bg-white border-[#E5E5E5]'
                }`}>
                  <span className="text-[10px] text-[#6D6E70] block font-medium">کل نوبت‌های ثبت‌شده</span>
                  <strong className="text-base sm:text-lg font-bold font-mono text-[#CF2F2F] block mt-0.5">
                    {toPersianDigits(totalVisits)}
                  </strong>
                </div>

                <div className={`p-3 rounded-xl border text-center ${
                  isDark ? 'bg-[#121622] border-slate-700/50' : 'bg-white border-[#E5E5E5]'
                }`}>
                  <span className="text-[10px] text-[#6D6E70] block font-medium">ویزیت‌های موفق</span>
                  <strong className="text-base sm:text-lg font-bold font-mono text-emerald-600 block mt-0.5">
                    {toPersianDigits(completedVisits)}
                  </strong>
                </div>

                <div className={`p-3 rounded-xl border text-center ${
                  isDark ? 'bg-[#121622] border-slate-700/50' : 'bg-white border-[#E5E5E5]'
                }`}>
                  <span className="text-[10px] text-[#6D6E70] block font-medium">طب کار و پزشکی</span>
                  <strong className="text-base sm:text-lg font-bold font-mono text-blue-500 block mt-0.5">
                    {toPersianDigits(medicalVisits)}
                  </strong>
                </div>

                <div className={`p-3 rounded-xl border text-center ${
                  isDark ? 'bg-[#121622] border-slate-700/50' : 'bg-white border-[#E5E5E5]'
                }`}>
                  <span className="text-[10px] text-[#6D6E70] block font-medium">تعداد غیبت (No-Show)</span>
                  <strong className="text-base sm:text-lg font-bold font-mono text-rose-500 block mt-0.5">
                    {toPersianDigits(noShowCount)}
                  </strong>
                </div>

              </div>

            </div>

            {/* Last Consultation Banner */}
            {lastVisit && (
              <div 
                className={`mt-4 pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                  isDark ? 'border-slate-700/40 text-slate-300' : 'border-[#E5E5E5] text-[#6D6E70]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#CF2F2F]" />
                  <span>
                    آخرین مراجعه ثبت‌شده: <strong className={isDark ? 'text-slate-100' : 'text-[#333333]'}>{lastVisit.dateShamsi} ({lastVisit.timeSlot})</strong> نزد <strong className="text-[#CF2F2F]">{lastVisit.specialistName}</strong>
                  </span>
                </div>
                {lastVisit.sessionResult && (
                  <span className="text-[11px] font-mono text-emerald-500 truncate max-w-sm">
                    تشخیص: {lastVisit.sessionResult.diagnosisOrSummary}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { id: 'all', label: 'همه تخصص‌ها' },
                { id: 'medical', label: 'پزشکی و درمانگاه' },
                { id: 'counseling', label: 'روانشناسی' },
                { id: 'nutrition', label: 'تغذیه' },
                { id: 'legal', label: 'حقوقی' },
                { id: 'barber', label: 'پیرایش' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === tab.id
                      ? 'bg-[#CF2F2F] text-white shadow-xs'
                      : isDark
                      ? 'bg-[#181F2C] hover:bg-[#20293A] text-slate-300 border border-slate-700/50'
                      : 'bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#6D6E70]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="جستجو در علائم، داروها، تاریخ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full text-xs pr-9 pl-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] ${
                  isDark
                    ? 'bg-[#141924] border-slate-700/60 text-slate-100 placeholder-slate-500'
                    : 'bg-white border-[#E5E5E5] text-[#333333] placeholder-[#6D6E70]'
                }`}
              />
            </div>

          </div>

          {/* Timeline of Appointments & Clinical Consultations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h5 className={`text-xs sm:text-sm font-bold flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                <FileText className="w-4 h-4 text-[#CF2F2F]" />
                <span>ریز سوابق مراجعات و نتایج بالینی ({toPersianDigits(filteredAppointments.length)} مورد)</span>
              </h5>
              <span className="text-[11px] text-[#6D6E70]">
                مرتب‌سازی از جدیدترین به قدیمی‌ترین
              </span>
            </div>

            {filteredAppointments.length === 0 ? (
              <div 
                className={`p-10 rounded-2xl border text-center space-y-2 ${
                  isDark ? 'bg-[#161B28]/50 border-slate-700/50 text-slate-400' : 'bg-[#F9F9F9] border-[#E5E5E5] text-[#6D6E70]'
                }`}
              >
                <Info className="w-8 h-8 mx-auto text-[#CF2F2F] opacity-60" />
                <p className="text-xs font-bold">هیچ پرونده یا سابقه ویزیت با مشخصات انتخابی یافت نشد.</p>
                <p className="text-[11px]">در صورت تمایل فیلتر تخصص یا عبارت جستجو را تغییر دهید.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAppointments.map((apt, index) => {
                  const isExpanded = expandedAptId === apt.id;
                  const isCompleted = apt.status === 'completed';
                  const isNoShow = apt.status === 'no_show';
                  const isInProgress = apt.status === 'in_progress';

                  return (
                    <div
                      key={apt.id}
                      className={`rounded-2xl border transition-all overflow-hidden ${
                        apt.id === highlightAptId
                          ? 'border-[#CF2F2F] ring-1 ring-[#CF2F2F]'
                          : isDark
                          ? 'bg-[#181F2C]/80 border-slate-700/60 hover:border-slate-600'
                          : 'bg-white border-[#E5E5E5] hover:border-[#CF2F2F]/30'
                      }`}
                    >
                      {/* Accordion Row Summary */}
                      <div
                        onClick={() => setExpandedAptId(isExpanded ? null : apt.id)}
                        className={`p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                          isDark ? 'hover:bg-[#1E2738]' : 'hover:bg-[#FBFBFB]'
                        }`}
                      >
                        {/* Right: Date, Specialist & Specialty */}
                        <div className="flex items-center gap-3.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                            isDark ? 'bg-[#121622] border-slate-700/60' : 'bg-[#F8F8F8] border-[#E5E5E5]'
                          }`}>
                            {getCategoryIcon(apt.specialistCategory)}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                                {apt.specialistName}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                                isDark ? 'bg-[#121622] border-slate-700/60 text-slate-300' : 'bg-[#F2F2F2] border-[#E5E5E5] text-[#6D6E70]'
                              }`}>
                                {getCategoryLabel(apt.specialistCategory)}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs mt-1 text-[#6D6E70]">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-[#CF2F2F]" />
                                <strong className={isDark ? 'text-slate-200' : 'text-[#333333]'}>{apt.dateShamsi}</strong>
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 font-mono">
                                <Clock className="w-3.5 h-3.5" />
                                {toPersianDigits(apt.timeSlot)}
                              </span>
                              <span>•</span>
                              <span className="font-mono text-[11px]">
                                رهگیری: {apt.trackingCode}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Left: Status Badge & Chevron */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5E5E5]">
                          {isCompleted && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              ویزیت انجام‌شده
                            </span>
                          )}
                          {isNoShow && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/30 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              عدم حضور (غیبت)
                            </span>
                          )}
                          {isInProgress && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/30 flex items-center gap-1 animate-pulse">
                              <Clock className="w-3.5 h-3.5" />
                              در حال ویزیت جاری
                            </span>
                          )}

                          <div className={`p-1.5 rounded-lg border ${
                            isDark ? 'border-slate-700/60 text-slate-400' : 'border-[#E5E5E5] text-[#6D6E70]'
                          }`}>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>

                      </div>

                      {/* Expanded Medical & Consultation Details */}
                      {isExpanded && (
                        <div 
                          className={`p-5 border-t space-y-4 text-xs ${
                            isDark ? 'bg-[#141924] border-slate-700/50' : 'bg-[#FAFAFA] border-[#E5E5E5]'
                          }`}
                        >
                          
                          {/* Reason for Visit */}
                          <div className={`p-3.5 rounded-xl border ${
                            isDark ? 'bg-[#181F2C] border-slate-700/50' : 'bg-white border-[#E5E5E5]'
                          }`}>
                            <span className="font-bold text-[#CF2F2F] block mb-1">علت و شکایت اولیه مراجع:</span>
                            <p className={isDark ? 'text-slate-200' : 'text-[#333333]'}>
                              {apt.userReason || 'شرح علت توسط همکار قید نشده است.'}
                            </p>
                          </div>

                          {/* Session Clinical Result */}
                          {apt.sessionResult ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              
                              {/* Clinical Diagnosis / Assessment */}
                              <div className={`p-3.5 rounded-xl border space-y-1.5 ${
                                isDark ? 'bg-[#181F2C] border-slate-700/50' : 'bg-white border-[#E5E5E5]'
                              }`}>
                                <span className="font-bold text-emerald-500 flex items-center gap-1.5">
                                  <HeartPulse className="w-4 h-4" />
                                  تشخیص و ارزیابی بالینی متخصص:
                                </span>
                                <p className={`leading-relaxed ${isDark ? 'text-slate-100' : 'text-[#333333]'}`}>
                                  {apt.sessionResult.diagnosisOrSummary}
                                </p>
                              </div>

                              {/* Prescriptions / Recommended Medication */}
                              <div className={`p-3.5 rounded-xl border space-y-1.5 ${
                                isDark ? 'bg-[#181F2C] border-slate-700/50' : 'bg-white border-[#E5E5E5]'
                              }`}>
                                <span className="font-bold text-blue-500 flex items-center gap-1.5">
                                  <Pill className="w-4 h-4" />
                                  نسخه دارویی / دستور اقدام:
                                </span>
                                <p className={`leading-relaxed ${isDark ? 'text-slate-100' : 'text-[#333333]'}`}>
                                  {apt.sessionResult.prescriptionOrAction || 'نیاز به تجویز دارویی ثبت نشده است.'}
                                </p>
                              </div>

                              {/* Recommendations & Follow-up */}
                              <div className={`p-3.5 rounded-xl border space-y-1.5 md:col-span-2 ${
                                isDark ? 'bg-[#181F2C] border-slate-700/50' : 'bg-white border-[#E5E5E5]'
                              }`}>
                                <span className="font-bold text-amber-500 flex items-center gap-1.5">
                                  <Sparkles className="w-4 h-4" />
                                  توصیه‌های مراقبتی و ارگونومیک به همکار:
                                </span>
                                <p className={`leading-relaxed ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                                  {apt.sessionResult.recommendations}
                                </p>
                              </div>

                              {/* Confidential Private Notes (Specialist only) */}
                              {apt.sessionResult.privateNotes && (
                                <div className={`p-3.5 rounded-xl border space-y-1.5 md:col-span-2 ${
                                  isDark ? 'bg-amber-950/20 border-amber-800/40 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'
                                }`}>
                                  <span className="font-bold flex items-center gap-1.5 text-xs">
                                    <Lock className="w-3.5 h-3.5" />
                                    یادداشت محرمانه پزشک / متخصص (غیرقابل مشاهده برای کارمند):
                                  </span>
                                  <p className="text-xs leading-relaxed">
                                    {apt.sessionResult.privateNotes}
                                  </p>
                                </div>
                              )}

                            </div>
                          ) : (
                            <div className={`p-4 rounded-xl border text-center text-xs ${
                              isDark ? 'bg-[#181F2C] border-slate-700/50 text-slate-400' : 'bg-white border-[#E5E5E5] text-[#6D6E70]'
                            }`}>
                              {isNoShow
                                ? 'همکار در موعد مقرر مراجعه ننمود و جلسه تشکیل نشد.'
                                : 'نتیجه این جلسه هنوز توسط متخصص نهایی و ثبت نگردیده است.'}
                            </div>
                          )}

                          {/* Recorded Timestamp */}
                          <div className={`text-[11px] pt-1 flex items-center justify-between ${
                            isDark ? 'text-slate-400' : 'text-[#6D6E70]'
                          }`}>
                            <span>محل خدمت: {apt.specialistRoom}</span>
                            {apt.sessionResult?.recordedAt && (
                              <span>تاریخ ثبت الکترونیکی: {new Date(apt.sessionResult.recordedAt).toLocaleTimeString('fa-IR')}</span>
                            )}
                          </div>

                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

        {/* Footer Bar */}
        <div 
          className={`p-4 sm:p-5 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 ${
            isDark ? 'bg-[#161B28]/90 border-slate-700/50' : 'bg-[#F8F8F8] border-[#E5E5E5]'
          }`}
        >
          <div className="flex items-center gap-2 text-xs text-[#6D6E70]">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>اطلاعات پرونده پزشکی همکاران تحت پروتکل‌های محرمانگی بهداری مپنا محافظت می‌گردد.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#CF2F2F] hover:bg-[#B72424] text-white font-bold text-xs shadow-md transition-all cursor-pointer self-end sm:self-auto"
          >
            بستن پرونده
          </button>
        </div>

      </div>
    </div>
  );
};
