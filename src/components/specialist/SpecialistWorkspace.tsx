import React, { useState } from 'react';
import { useApp, getRoleLabel } from '../../context/AppContext';
import { Appointment, Specialist } from '../../types';
import { toPersianDigits, getAvailableWorkDays } from '../../utils/dateUtils';
import { RecordResultModal } from './RecordResultModal';
import { SessionResultModal } from '../employee/SessionResultModal';
import { SpecialistScheduleManager } from '../admin/SpecialistScheduleManager';
import { EditSpecialistProfileModal } from '../common/EditSpecialistProfileModal';
import { PatientMedicalHistoryModal } from './PatientMedicalHistoryModal';
import { 
  Calendar, 
  Clock, 
  UserCheck, 
  UserX, 
  Play, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Stethoscope, 
  Search, 
  Phone, 
  Building2, 
  Filter, 
  Sparkles, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Sliders,
  Edit3,
  Camera,
  History,
  FolderHeart,
  User
} from 'lucide-react';

export const SpecialistWorkspace: React.FC = () => {
  const { currentUser, specialists, appointments, updateAppointmentStatus, isDark } = useApp();

  // Find linked specialist profile for current user, or fallback to first specialist
  const linkedSpec = specialists.find((s) => s.userId === currentUser.id || s.id === currentUser.specialistId);
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<string>(
    linkedSpec ? linkedSpec.id : specialists[0]?.id || ''
  );

  const activeSpecialist = specialists.find((s) => s.id === selectedSpecialistId) || specialists[0];

  const workDays = getAvailableWorkDays(10);
  const [selectedDateISO, setSelectedDateISO] = useState<string>(workDays[0].dateISO);
  const [activeTab, setActiveTab] = useState<'today_schedule' | 'all_history' | 'presence_schedule'>('today_schedule');
  const [searchTerm, setSearchTerm] = useState('');

  const [modalApt, setModalApt] = useState<{ apt: Appointment; isNoShow: boolean } | null>(null);
  const [viewResultApt, setViewResultApt] = useState<Appointment | null>(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [patientHistoryTarget, setPatientHistoryTarget] = useState<{
    userId: string;
    userName?: string;
    userPersonnelCode?: string;
    aptId?: string;
  } | null>(null);

  // Appointments for this specialist on selected date
  const specialistAppointments = appointments.filter(
    (a) => a.specialistId === activeSpecialist?.id
  );

  const dayAppointments = specialistAppointments
    .filter((a) => a.dateISO === selectedDateISO)
    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

  const filteredHistory = specialistAppointments.filter(
    (a) =>
      a.userName.includes(searchTerm) ||
      a.userPersonnelCode.includes(searchTerm) ||
      a.userDepartment.includes(searchTerm) ||
      a.trackingCode.includes(searchTerm) ||
      (a.sessionResult?.diagnosisOrSummary && a.sessionResult.diagnosisOrSummary.includes(searchTerm))
  );

  // Today Stats
  const countTotal = dayAppointments.length;
  const countCompleted = dayAppointments.filter((a) => a.status === 'completed').length;
  const countInProgress = dayAppointments.filter((a) => a.status === 'in_progress').length;
  const countPending = dayAppointments.filter((a) => a.status === 'confirmed' || a.status === 'pending').length;
  const countNoShow = dayAppointments.filter((a) => a.status === 'no_show').length;

  return (
    <div className="space-y-6">
      
      {/* Bento Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Specialist Profile Bento Tile (7 cols) */}
        <div 
          className={`lg:col-span-7 rounded-3xl p-5 sm:p-6 border shadow-md flex flex-col justify-between relative overflow-hidden transition-all ${
            isDark 
              ? 'bg-[#121622]/85 border-slate-700/60 backdrop-blur-xl text-slate-100 shadow-black/40' 
              : 'bg-white border-[#E5E5E5] text-[#333333]'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
            
            <div className="flex items-center gap-4">
              <img
                src={activeSpecialist?.avatarUrl}
                alt={activeSpecialist?.fullName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#CF2F2F] shadow-sm"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#CF2F2F] text-white">
                    میز کار متخصص
                  </span>
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                    {activeSpecialist?.building}
                  </span>
                </div>
                <h2 className={`text-lg sm:text-xl font-black mt-1 ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                  {activeSpecialist?.fullName}
                </h2>
                <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>
                  {activeSpecialist?.title} • {activeSpecialist?.roomNumber} (داخلی: {toPersianDigits(activeSpecialist?.phoneExt)})
                </p>
              </div>
            </div>

            {/* Switch specialist dropdown */}
            <div className={`p-3 rounded-2xl border shrink-0 ${
              isDark ? 'bg-[#181F2C] border-slate-700/60' : 'bg-[#F8F8F8] border-[#E5E5E5]'
            }`}>
              <label className={`block text-[11px] mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>
                مشاهده میز کار سایر متخصصان:
              </label>
              <select
                value={selectedSpecialistId}
                onChange={(e) => setSelectedSpecialistId(e.target.value)}
                className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] ${
                  isDark 
                    ? 'bg-[#121622] border-slate-700/60 text-slate-100' 
                    : 'bg-white border-[#E5E5E5] text-[#333333]'
                }`}
              >
                {specialists.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.title.split(' ')[0]} - {s.roomNumber})
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div className={`flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t text-xs ${
            isDark ? 'border-slate-700/50 text-slate-300' : 'border-[#E5E5E5] text-[#6D6E70]'
          }`}>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#CF2F2F]" />
              <span>روزهای حضور شما در ستاد: <strong className={isDark ? 'text-white' : 'text-[#333333]'}>{activeSpecialist?.workingDays.join('، ')}</strong></span>
            </div>

            <button
              type="button"
              onClick={() => setShowEditProfileModal(true)}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs border transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer ${
                isDark
                  ? 'bg-[#181F2C] hover:bg-[#20293A] text-slate-200 border-slate-700/60'
                  : 'bg-[#F8F8F8] hover:bg-[#F2F2F2] text-[#333333] border-[#E5E5E5]'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-[#CF2F2F]" />
              <span>ویرایش مشخصات فردی و تصویر من</span>
            </button>
          </div>
        </div>

        {/* 5-Metric Bento Tiles Grid (5 cols) */}
        <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
          
          <div className={`rounded-2xl p-4 border shadow-sm flex flex-col justify-between transition-all ${
            isDark ? 'bg-[#121622]/85 border-slate-700/60 backdrop-blur-xl' : 'bg-white border-[#E5E5E5]'
          }`}>
            <span className={`text-[11px] font-bold block ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>کل نوبت‌های امروز</span>
            <div className="flex items-baseline justify-between mt-2">
              <strong className={`text-2xl font-bold font-mono ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                {toPersianDigits(countTotal)}
              </strong>
              <Clock className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`} />
            </div>
          </div>

          <div className={`rounded-2xl p-4 border shadow-sm flex flex-col justify-between transition-all ${
            isDark ? 'bg-[#121622]/85 border-slate-700/60 backdrop-blur-xl' : 'bg-white border-[#E5E5E5]'
          }`}>
            <span className={`text-[11px] font-bold block ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>ویزیت‌های انجام‌شده</span>
            <div className="flex items-baseline justify-between mt-2">
              <strong className="text-2xl font-bold font-mono text-emerald-500">
                {toPersianDigits(countCompleted)}
              </strong>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          </div>

          <div className={`rounded-2xl p-4 border shadow-sm flex flex-col justify-between transition-all ${
            isDark ? 'bg-[#121622]/85 border-slate-700/60 backdrop-blur-xl' : 'bg-white border-[#E5E5E5]'
          }`}>
            <span className={`text-[11px] font-bold block ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>در حال ویزیت</span>
            <div className="flex items-baseline justify-between mt-2">
              <strong className="text-2xl font-bold font-mono text-[#CF2F2F]">
                {toPersianDigits(countInProgress)}
              </strong>
              <Play className="w-4 h-4 text-[#CF2F2F] fill-[#CF2F2F]" />
            </div>
          </div>

          <div className={`rounded-2xl p-4 border shadow-sm flex flex-col justify-between transition-all ${
            isDark ? 'bg-[#121622]/85 border-slate-700/60 backdrop-blur-xl' : 'bg-white border-[#E5E5E5]'
          }`}>
            <span className={`text-[11px] font-bold block ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>در انتظار مراجع</span>
            <div className="flex items-baseline justify-between mt-2">
              <strong className={`text-2xl font-bold font-mono ${isDark ? 'text-slate-100' : 'text-[#333333]'}`}>
                {toPersianDigits(countPending)}
              </strong>
              <UserCheck className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`} />
            </div>
          </div>

          <div className={`col-span-2 sm:col-span-1 lg:col-span-2 rounded-2xl p-4 border shadow-sm flex items-center justify-between transition-all ${
            isDark ? 'bg-rose-950/30 border-rose-800/50 text-rose-300' : 'bg-[#FFF9F9] border-[#F5C2C2]'
          }`}>
            <div>
              <span className="text-[11px] font-bold text-[#CF2F2F] block">عدم حضور (غیبت ثبت‌شده)</span>
              <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>ثبت رسمی در پرونده انضباطی پرسنل</span>
            </div>
            <strong className="text-2xl font-bold font-mono text-[#CF2F2F]">
              {toPersianDigits(countNoShow)}
            </strong>
          </div>

        </div>

      </div>

      {/* Navigation Sub-tabs Bento Tile */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl border shadow-sm transition-all ${
        isDark ? 'bg-[#121622]/85 border-slate-700/60 backdrop-blur-xl' : 'bg-white border-[#E5E5E5]'
      }`}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('today_schedule')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'today_schedule'
                ? 'bg-[#CF2F2F] text-white shadow-md'
                : isDark
                ? 'bg-[#181F2C] hover:bg-[#20293A] text-slate-300'
                : 'bg-[#F8F8F8] hover:bg-[#F2F2F2] text-[#6D6E70]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>برنامه کاری و نوبت‌های روز</span>
          </button>

          <button
            onClick={() => setActiveTab('all_history')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'all_history'
                ? 'bg-[#CF2F2F] text-white shadow-md'
                : isDark
                ? 'bg-[#181F2C] hover:bg-[#20293A] text-slate-300'
                : 'bg-[#F8F8F8] hover:bg-[#F2F2F2] text-[#6D6E70]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>پرونده و سوابق مراجعات ({toPersianDigits(specialistAppointments.length)})</span>
          </button>

          <button
            onClick={() => setActiveTab('presence_schedule')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'presence_schedule'
                ? 'bg-[#CF2F2F] text-white shadow-md'
                : isDark
                ? 'bg-[#181F2C] hover:bg-[#20293A] text-slate-300'
                : 'bg-[#F8F8F8] hover:bg-[#F2F2F2] text-[#6D6E70]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>برنامه حضور و ساعات کاری من</span>
          </button>
        </div>

        {/* Date pills for Today Schedule */}
        {activeTab === 'today_schedule' && (
          <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto text-xs">
            {workDays.slice(0, 5).map((d) => (
              <button
                key={d.dateISO}
                onClick={() => setSelectedDateISO(d.dateISO)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  selectedDateISO === d.dateISO
                    ? 'bg-[#CF2F2F] text-white shadow-xs'
                    : isDark
                    ? 'bg-[#181F2C] border border-slate-700/60 text-slate-300 hover:bg-[#20293A]'
                    : 'bg-white border border-[#E5E5E5] text-[#6D6E70]'
                }`}
              >
                {d.dayName} {d.shortDate}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB 1: TODAY'S SCHEDULE & QUEUE */}
      {activeTab === 'today_schedule' && (
        <div className="space-y-4">
          
          {/* Mobile date switcher */}
          <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {workDays.map((d) => (
              <button
                key={d.dateISO}
                onClick={() => setSelectedDateISO(d.dateISO)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedDateISO === d.dateISO
                    ? 'bg-[#CF2F2F] text-white'
                    : isDark
                    ? 'bg-[#181F2C] border border-slate-700/60 text-slate-300'
                    : 'bg-white border border-[#E5E5E5] text-[#6D6E70]'
                }`}
              >
                {d.dayName} {d.shortDate}
              </button>
            ))}
          </div>

          {/* Agenda List */}
          {dayAppointments.length === 0 ? (
            <div className={`p-12 text-center rounded-3xl border space-y-3 shadow-sm transition-all ${
              isDark ? 'bg-[#121622]/85 border-slate-700/60 backdrop-blur-xl' : 'bg-white border-[#E5E5E5]'
            }`}>
              <Calendar className="w-12 h-12 text-[#6D6E70] mx-auto opacity-40" />
              <h4 className={`font-bold ${isDark ? 'text-white' : 'text-[#333333]'}`}>برای این تاریخ نوبتی رزرو نشده است.</h4>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                همکاران می‌توانند در بازه‌های زمانی تعریف شده اقدام به اخذ نوبت فرمایند.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayAppointments.map((apt, index) => {
                const isInProgress = apt.status === 'in_progress';
                const isCompleted = apt.status === 'completed';
                const isNoShow = apt.status === 'no_show';
                const isPending = apt.status === 'confirmed' || apt.status === 'pending';

                return (
                  <div
                    key={apt.id}
                    className={`rounded-3xl border p-5 sm:p-6 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isInProgress
                        ? isDark
                          ? 'border-[#CF2F2F] bg-rose-950/30'
                          : 'border-[#CF2F2F] bg-[#FFF9F9]'
                        : isCompleted
                        ? isDark
                          ? 'border-slate-700/60 bg-[#121622]/80 backdrop-blur-md'
                          : 'border-[#E5E5E5] bg-white'
                        : isNoShow
                        ? isDark
                          ? 'border-rose-800/50 bg-rose-950/20'
                          : 'border-rose-200 bg-[#FFF9F9]'
                        : isDark
                        ? 'border-slate-700/60 bg-[#121622]/80 hover:border-slate-500 backdrop-blur-md'
                        : 'border-[#E5E5E5] hover:border-[#CF2F2F]/30 bg-white'
                    }`}
                  >
                    {/* Time and Patient Info */}
                    <div className="flex items-start gap-4 flex-1">
                      
                      {/* Slot Time Badge */}
                      <div className={`text-center p-3 rounded-2xl border shrink-0 min-w-[95px] ${
                        isDark ? 'bg-[#181F2C] border-slate-700/60' : 'bg-[#F8F8F8] border-[#E5E5E5]'
                      }`}>
                        <span className={`text-[10px] block font-medium ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>ساعت نوبت</span>
                        <strong className="text-sm font-bold font-mono text-[#CF2F2F] block mt-0.5">
                          {toPersianDigits(apt.timeSlot)}
                        </strong>
                        <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>نوبت #{toPersianDigits(index + 1)}</span>
                      </div>

                      {/* Patient Details */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className={`font-black text-base ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                            {apt.userName}
                          </h4>
                          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${
                            isDark ? 'bg-[#181F2C] border-slate-700/60 text-slate-300' : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#6D6E70]'
                          }`}>
                            کد پرسنلی: {toPersianDigits(apt.userPersonnelCode)}
                          </span>
                          <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>
                            • {apt.userDepartment}
                          </span>
                          <span className={`text-xs font-mono font-semibold ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>
                            (تلفن: {apt.userPhone})
                          </span>
                        </div>

                        <p className={`text-xs p-2.5 rounded-xl border ${
                          isDark ? 'bg-[#181F2C]/70 border-slate-700/50 text-slate-300' : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#6D6E70]'
                        }`}>
                          <strong className={isDark ? 'text-slate-100' : 'text-[#333333]'}>علت مراجعه:</strong> {apt.userReason}
                        </p>

                        {/* If completed, show summary excerpt */}
                        {isCompleted && apt.sessionResult && (
                          <div className={`text-xs p-2.5 rounded-xl border flex items-center justify-between ${
                            isDark ? 'bg-[#181F2C] border-slate-700/50 text-slate-200' : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#333333]'
                          }`}>
                            <span className="truncate max-w-md">
                              <strong>نتیجه ثبت‌شده:</strong> {apt.sessionResult.diagnosisOrSummary}
                            </span>
                            <button
                              onClick={() => setViewResultApt(apt)}
                              className="text-[#CF2F2F] font-bold hover:underline shrink-0 text-[11px] flex items-center gap-1 mr-2 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              مشاهده کامل
                            </button>
                          </div>
                        )}

                        {/* If No-Show */}
                        {isNoShow && (
                          <div className={`text-xs p-2.5 rounded-xl border flex items-center gap-1.5 font-semibold ${
                            isDark ? 'bg-rose-950/40 border-rose-800/60 text-rose-300' : 'bg-[#FDF2F2] border-[#F5C2C2] text-[#CF2F2F]'
                          }`}>
                            <AlertTriangle className="w-4 h-4 text-[#CF2F2F]" />
                            <span>عدم مراجعه (No-Show) ثبت شد • کسر ۲۵ امتیاز انضباطی اعمال گردید</span>
                          </div>
                        )}

                      </div>
                    </div>

                    {/* Action Buttons for Specialist */}
                    <div className={`flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 justify-end ${
                      isDark ? 'border-slate-700/50' : 'border-[#E5E5E5]'
                    }`}>
                      
                      {/* CRITICAL: VIEW MEDICAL & CONSULTATION HISTORY */}
                      <button
                        type="button"
                        onClick={() => setPatientHistoryTarget({
                          userId: apt.userId,
                          userName: apt.userName,
                          userPersonnelCode: apt.userPersonnelCode,
                          aptId: apt.id,
                        })}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border shadow-xs ${
                          isDark
                            ? 'bg-blue-950/50 hover:bg-blue-900/70 text-blue-300 border-blue-800/60'
                            : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200'
                        }`}
                        title="مشاهده پرونده کامل، سوابق ویزیت‌های قبلی، داروها و تشخیص‌ها (View History)"
                      >
                        <History className="w-3.5 h-3.5 text-blue-500" />
                        <span>مشاهده سوابق و پرونده</span>
                      </button>

                      {/* Step 1: Start Visit / In-Progress */}
                      {isPending && (
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'in_progress')}
                          className="px-4 py-2 rounded-xl bg-[#333333] hover:bg-[#1E1E1E] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>فراخوانی و شروع ویزیت</span>
                        </button>
                      )}

                      {/* Step 2: Record Result & Finish */}
                      {(isPending || isInProgress) && (
                        <button
                          onClick={() => setModalApt({ apt, isNoShow: false })}
                          className="px-4 py-2 rounded-xl bg-[#CF2F2F] hover:bg-[#B72424] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>ثبت نتیجه و پایان جلسه</span>
                        </button>
                      )}

                      {/* Step 3: Mark No-Show */}
                      {(isPending || isInProgress) && (
                        <button
                          onClick={() => setModalApt({ apt, isNoShow: true })}
                          className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isDark
                              ? 'border-slate-700/60 hover:bg-rose-950/40 hover:border-rose-700 text-slate-300 hover:text-rose-300'
                              : 'border-[#E5E5E5] hover:bg-[#FFF5F5] hover:border-[#CF2F2F] text-[#6D6E70] hover:text-[#CF2F2F]'
                          }`}
                        >
                          <UserX className="w-4 h-4 text-[#CF2F2F]" />
                          <span>ثبت عدم حضور</span>
                        </button>
                      )}

                      {/* If already completed: edit result */}
                      {isCompleted && (
                        <button
                          onClick={() => setModalApt({ apt, isNoShow: false })}
                          className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                            isDark
                              ? 'border-slate-700/60 hover:bg-[#1E2738] text-slate-300'
                              : 'border-[#E5E5E5] hover:bg-[#F8F8F8] text-[#6D6E70]'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>ویرایش نتیجه</span>
                        </button>
                      )}

                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: CONSULTATION HISTORY & RECORDS TABLE */}
      {activeTab === 'all_history' && (
        <div className="space-y-4">
          
          {/* Search bar Bento Tile */}
          <div className={`p-4 rounded-3xl border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 transition-all ${
            isDark ? 'bg-[#121622]/85 border-slate-700/60 backdrop-blur-xl' : 'bg-white border-[#E5E5E5]'
          }`}>
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              <input
                type="text"
                placeholder="جستجو بر اساس نام مراجع، کد پرسنلی، واحد مپنا، یا کلمات کلیدی تشخیص..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full text-xs pr-10 pl-4 py-2.5 rounded-2xl border focus:outline-none focus:ring-1 focus:ring-[#CF2F2F] ${
                  isDark
                    ? 'bg-[#181F2C] border-slate-700/60 text-slate-100 placeholder-slate-500'
                    : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#333333] placeholder-[#6D6E70]'
                }`}
              />
            </div>
            <span className={`text-xs shrink-0 font-medium ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>
              تعداد پرونده‌های یافت‌شده: {toPersianDigits(filteredHistory.length)}
            </span>
          </div>

          {/* Records Table */}
          <div className={`rounded-3xl border overflow-hidden shadow-sm transition-all ${
            isDark ? 'bg-[#121622]/85 border-slate-700/60 backdrop-blur-xl' : 'bg-white border-[#E5E5E5]'
          }`}>
            <div className="overflow-x-auto">
              <table className={`w-full text-right text-xs ${isDark ? 'text-slate-200' : 'text-[#333333]'}`}>
                <thead className={`font-bold border-b ${
                  isDark ? 'bg-[#181F2C] border-slate-700/60 text-slate-200' : 'bg-[#F8F8F8] border-[#E5E5E5] text-[#333333]'
                }`}>
                  <tr>
                    <th className="p-4">کد پیگیری</th>
                    <th className="p-4">نام مراجع</th>
                    <th className="p-4">کد پرسنلی</th>
                    <th className="p-4">واحد سازمانی</th>
                    <th className="p-4">تاریخ و ساعت</th>
                    <th className="p-4">وضعیت حضور</th>
                    <th className="p-4">خلاصه اقدام / تشخیص</th>
                    <th className="p-4 text-center">مشاهده سوابق و پرونده (View History)</th>
                    <th className="p-4 text-center">برگه نتیجه</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800/80' : 'divide-[#E5E5E5]'}`}>
                  {filteredHistory.map((a) => (
                    <tr key={a.id} className={`transition-colors ${isDark ? 'hover:bg-[#181F2C]/60' : 'hover:bg-[#F8F8F8]'}`}>
                      <td className="p-4 font-mono font-bold">{a.trackingCode}</td>
                      <td className="p-4 font-bold">{a.userName}</td>
                      <td className={`p-4 font-mono font-semibold ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>{toPersianDigits(a.userPersonnelCode)}</td>
                      <td className={`p-4 max-w-[150px] truncate ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>{a.userDepartment}</td>
                      <td className="p-4">
                        <span className="font-semibold">{a.dateShamsi}</span>
                        <span className={`block text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-[#6D6E70]'}`}>{toPersianDigits(a.timeSlot)}</span>
                      </td>
                      <td className="p-4">
                        {a.status === 'completed' && (
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 font-bold text-[11px]">
                            حاضر (ویزیت شد)
                          </span>
                        )}
                        {a.status === 'no_show' && (
                          <span className="px-2.5 py-0.5 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/30 font-bold text-[11px]">
                            غیبت (No-Show)
                          </span>
                        )}
                        {a.status === 'confirmed' && (
                          <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/30 font-semibold text-[11px]">
                            پیش‌رو
                          </span>
                        )}
                        {a.status === 'cancelled' && (
                          <span className={`px-2.5 py-0.5 rounded-md border font-medium text-[11px] ${
                            isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-[#F8F8F8] text-[#6D6E70] border-[#E5E5E5]'
                          }`}>
                            لغو شده
                          </span>
                        )}
                      </td>
                      <td className={`p-4 max-w-[200px] truncate ${isDark ? 'text-slate-300' : 'text-[#6D6E70]'}`}>
                        {a.sessionResult?.diagnosisOrSummary || a.userReason}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => setPatientHistoryTarget({
                            userId: a.userId,
                            userName: a.userName,
                            userPersonnelCode: a.userPersonnelCode,
                            aptId: a.id,
                          })}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-all flex items-center gap-1.5 mx-auto cursor-pointer shadow-xs ${
                            isDark
                              ? 'bg-blue-950/50 hover:bg-blue-900/70 text-blue-300 border-blue-800/60'
                              : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200'
                          }`}
                          title="مشاهده سوابق و پرونده جامع پزشکی و مشاوره‌ای مراجع (View History)"
                        >
                          <History className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>مشاهده سوابق (View History)</span>
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        {a.sessionResult ? (
                          <button
                            onClick={() => setViewResultApt(a)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-colors cursor-pointer ${
                              isDark
                                ? 'bg-[#181F2C] hover:bg-[#222B3D] text-[#CF2F2F] border-slate-700/60'
                                : 'bg-white hover:bg-[#F8F8F8] text-[#CF2F2F] border-[#E5E5E5]'
                            }`}
                          >
                            نمایش برگه
                          </button>
                        ) : (
                          <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-[#6D6E70]'}`}>-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: PRESENCE SCHEDULE & WORKING HOURS MANAGER */}
      {activeTab === 'presence_schedule' && (
        <SpecialistScheduleManager
          specialistIdToEdit={activeSpecialist?.id}
          isSpecialistSelfService={true}
        />
      )}

      {/* Record Result Modal */}
      {modalApt && (
        <RecordResultModal
          appointment={modalApt.apt}
          isInitialNoShow={modalApt.isNoShow}
          onClose={() => setModalApt(null)}
          onOpenMedicalHistory={() => setPatientHistoryTarget({
            userId: modalApt.apt.userId,
            userName: modalApt.apt.userName,
            userPersonnelCode: modalApt.apt.userPersonnelCode,
            aptId: modalApt.apt.id,
          })}
        />
      )}

      {/* View Result Modal */}
      {viewResultApt && (
        <SessionResultModal
          appointment={viewResultApt}
          onClose={() => setViewResultApt(null)}
        />
      )}

      {/* Patient Medical History Modal */}
      {patientHistoryTarget && (
        <PatientMedicalHistoryModal
          userId={patientHistoryTarget.userId}
          userName={patientHistoryTarget.userName}
          userPersonnelCode={patientHistoryTarget.userPersonnelCode}
          highlightAptId={patientHistoryTarget.aptId}
          onClose={() => setPatientHistoryTarget(null)}
        />
      )}

      {/* Edit Specialist Profile & Photo Modal */}
      {showEditProfileModal && activeSpecialist && (
        <EditSpecialistProfileModal
          specialist={activeSpecialist}
          onClose={() => setShowEditProfileModal(false)}
          onSaved={() => setShowEditProfileModal(false)}
        />
      )}

    </div>
  );
};
